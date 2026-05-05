# Notification Service — Backend Specification

## Overview

A NestJS GraphQL federation subgraph backed by MongoDB (via Prisma) that stores per-account notification state. Archive IDs are pushed into the collection by consuming Kafka events (via Dapr) from existing services. The GraphQL resolver returns `Recording` entity references keyed by `archiveId`, which the gateway enriches automatically via the recordings subgraph.

---

## Tech Stack

- **Runtime**: NestJS 11
- **Database**: MongoDB via Prisma
- **GraphQL**: Apollo Federation v2.7 subgraph
- **Events**: Dapr + Kafka (CloudEvents via `@riversidefm/events`)
- **Enrichment**: Temporary direct MongoDB query to recordings DB; will migrate to federation entity references

---

## MongoDB Schema (Prisma)

### Collection: `account_notifications`

```prisma
model AccountNotifications {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  accountId   String    @unique
  archiveIds  String[]
  lastSeenAt  DateTime?

  @@map("account_notifications")
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Auto-generated document ID |
| `accountId` | string | Account identifier, **unique** |
| `archiveIds` | string[] | Ordered newest-first, capped at **20 entries** |
| `lastSeenAt` | DateTime? | Set to `now()` when user opens the notification panel; `null` means never opened. The FE computes unread count by comparing each card's latest `updatedAt` against this timestamp. |

### Array Cap Strategy

The `archiveIds` array is capped at 20 entries in application code. When a new archive is pushed, dedup + slice is applied:

```typescript
const currentIds: string[] = existing?.archiveIds ?? [];
const deduped = currentIds.filter((id) => id !== archiveId);
const updated = [archiveId, ...deduped].slice(0, MAX_ARCHIVE_IDS); // MAX = 20
```

---

## GraphQL Schema

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.7",
        import: ["@key", "@shareable", "@extends", "@external"])

scalar DateTime

type Query {
  notifications(accountId: ID!): NotificationList!
}

type Mutation {
  markNotificationsAsRead(accountId: ID!): Boolean!
  dismissNotifications(accountId: ID!, archiveIds: [ID!]!): Boolean!
  dismissAllNotifications(accountId: ID!): Boolean!
}

type NotificationList {
  notifications: [Notification!]!
  lastSeenAt: DateTime
}

type Notification {
  id: ID!
  recording: Recording!
}

extend type Recording @key(fields: "archiveId") {
  archiveId: String! @external
}
```

### Federation Enrichment Strategy

The notification subgraph does **not** fetch recording details itself. It returns `Recording` entity references (just the `archiveId`), and the gateway resolves the full recording from the recordings subgraph automatically.

**Notification subgraph resolver:**

```typescript
@ResolveField('recording')
resolveRecording(@Parent() notification: { archiveId: string }) {
  return { __typename: 'Recording', archiveId: notification.archiveId };
}
```

**Recordings subgraph** (needs `@key` directive + reference resolver):

```graphql
type Recording @key(fields: "archiveId") {
  archiveId: String!
  sessionId: String!
  speakerName: String
  clientStatus: String
  processingStatus: String
  uploadProgress: Float
  projectName: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

> **Temporary approach**: Until the recordings subgraph supports federation entities, the notification service resolves `accountId` from `archiveId` by querying the recordings MongoDB collection directly via `RecordingsMongooseService`.

---

## Query & Mutation Details

### `notifications(accountId)`

```typescript
const { archiveIds, lastSeenAt } = await this.notificationsService.getNotifications(accountId);
const notificationItems = archiveIds.map((archiveId) => ({ id: archiveId, archiveId }));
return { notifications: notificationItems, lastSeenAt };
```

The gateway automatically resolves the `recording` field for each notification via the recordings subgraph. The FE uses `lastSeenAt` together with each recording's `updatedAt` to compute the unread badge count on the client side.

### `markNotificationsAsRead(accountId)`

```typescript
await db.accountNotifications.update({
  where: { accountId },
  data: { lastSeenAt: new Date() },
});
```

### `dismissNotifications(accountId, archiveIds)`

Permanently removes one or more archives from the array.

```typescript
const doc = await db.accountNotifications.findUnique({
  where: { accountId },
  select: { archiveIds: true },
});
const toRemove = new Set(archiveIds);
const filtered = doc.archiveIds.filter((id) => !toRemove.has(id));
await db.accountNotifications.update({
  where: { accountId },
  data: { archiveIds: filtered },
});
```

### `dismissAllNotifications(accountId)`

Clears all notifications for the account.

```typescript
await db.accountNotifications.update({
  where: { accountId },
  data: { archiveIds: [], lastSeenAt: new Date() },
});
```

---

## Kafka Consumer (via Dapr)

### Events Consumed

Events are delivered as CloudEvents via Dapr HTTP subscriptions to `/events/process`, handled by `EventsHandlerService` using `@RSCloudEventHandlerDecorator` from `@riversidefm/events`.

| Kafka Event | Source | Trigger |
|-------------|--------|---------|
| `RECORDING_START_REQUESTED` | `WEB` | A recording session has started |
| `PROCESSING_STEP_DONE_CONCAT` | `PROCESSING` | Recording processing (concat step) completed |

### Dapr Subscription Topics

- Staging: `processing-wf-routing-events-stg`, `processing-biz-events-stg`
- Production: `processing-wf-routing-events-prod`, `processing-biz-events-prod`

### Consumer Logic

```typescript
@RSCloudEventHandlerDecorator({
  eventSource: rsproto.SourceType[rsproto.SourceType.WEB],
  eventType: rsproto.EventType[rsproto.EventType.RECORDING_START_REQUESTED],
})
async handleRecordingStartRequested(ce: rsproto.CloudEvent) {
  const archiveId = ce.archiveId;
  const accountId = await this.resolveAccountId(ce, 'RECORDING_START_REQUESTED');
  await this.notificationsService.pushArchiveId(accountId, archiveId);
}
```

### Account ID Resolution

When `accountId` is missing from the CloudEvent, the service resolves it by querying the recordings MongoDB:

```typescript
const collection = connection.collection('recordings');
const doc = await collection.findOne({ archiveId }, { projection: { accountId: 1 } });
return doc?.accountId ? String(doc.accountId) : null;
```

### Deduplication

The same `archiveId` can arrive from multiple events (e.g. first `RECORDING_START_REQUESTED`, then `PROCESSING_STEP_DONE_CONCAT`). The `pushArchiveId` method handles this in application code:

1. Fetch existing `archiveIds` array
2. Filter out the incoming `archiveId` (dedup)
3. Prepend it to the front (newest first)
4. Slice to cap at 20
5. Upsert the document

This ensures only one entry per `archiveId` exists in the array, always at the newest position.

---

## Data Flow

```
┌──────────────┐    Kafka (via Dapr)    ┌─────────────────────────┐
│  Recording   │ ──────────────────────>│  Notification Service   │
│  Services    │  RECORDING_START_REQ.  │  (NestJS)               │
│  (existing)  │  PROC_STEP_DONE_CONCAT│                         │
│              │                        │  ┌───────────────────┐  │
└──────────────┘                        │  │ MongoDB (Prisma)  │  │
                                        │  │ account_notifs    │  │
                                        │  └───────────────────┘  │
                                        │                         │
                                        │  GraphQL Federation     │
                                        └────────────┬────────────┘
                                                     │
                                              queries & mutations
                                                     │
                                        ┌────────────▼────────────┐
                                        │  Gateway                │
                                        │  (resolves Recording    │
                                        │   entity references)    │
                                        └────────────┬────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  Frontend MFE           │
                                        │  (NotificationBell)     │
                                        └─────────────────────────┘
```

---

## Frontend Integration

The FE `NotificationBell` component will:

1. On mount: call `notifications` query which returns the list + `lastSeenAt`
2. Compute badge count on the FE: number of notification cards whose `max(updatedAt)` > `lastSeenAt`
3. On bell click (panel open): call `markNotificationsAsRead` mutation (sets `lastSeenAt = now()`)
4. On dismiss single: call `dismissNotifications` mutation with the affected `archiveIds` array
5. On dismiss all: call `dismissAllNotifications` mutation
6. `time` field (relative time like "2m", "1h", "Yesterday") is computed on the frontend from the recording's `updatedAt` timestamp

---

## Notification Flow Rules (FE)

The FE groups `archiveIds` by `sessionId` (from the resolved `Recording` entity) and derives notification cards:

### Per-session notifications

| Scenario | Kind | Icon | Description |
|----------|------|------|-------------|
| At least one track uploading | `processing` | `upload` | "Track X of Y uploaded." + progress bar (highest %) |
| All uploaded, at least one processing | `processing` | `upload` | "Processing your recording..." (no bar) |
| All tracks completed successfully | `success` | `check` | "Recording finished processing and is ready to edit." |

### Per-track notifications

| Scenario | Kind | Icon | Description |
|----------|------|------|-------------|
| Track processing failed | `error` | `error` | "[Speaker]'s audio track couldn't be processed." |
| Upload didn't finish (guest left) | `warning` | `warn` | "[Speaker] left before their local tracks finished uploading." |

### Transition rules

- When all tracks finish processing: session card becomes `success`
- If a track fails: separate `error` card appears; session-level card **stays** (shows remaining tracks)
- When dismissing a session card: send all `archiveIds` in that session, excluding any referenced by other visible notifications (e.g. a failed track error card)

### Action buttons

- **"Go to project"**: Will call a GraphQL query with `sessionId` (not yet implemented)
- **"Contact support"**: No-op for now
- **"Remind guest"**: No-op for now

---

## Open Questions

- [x] ~~Confirm exact Kafka event types~~ -- `RECORDING_START_REQUESTED`, `PROCESSING_STEP_DONE_CONCAT`
- [x] ~~Database choice~~ -- MongoDB with Prisma
- [ ] Recording details enrichment -- temporarily resolving `accountId` via recordings MongoDB; will migrate to **Apollo Federation entity references** once the recordings subgraph supports `@key(fields: "archiveId")` + `__resolveReference`
- [ ] GraphQL subscription for `lastSeenAt` / live badge updates -- to be designed in a follow-up iteration in this service
- [ ] GraphQL subscription for recording status changes -- will live in the recordings service, not here
