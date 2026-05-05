export const NOTIFICATIONS_QUERY = `
  query Notifications($accountId: ID!) {
    notifications(accountId: $accountId) {
      notifications {
        id
        recording {
          archiveId
          sessionId
          speakerName
          clientStatus
          status
          uploadProgress
          projectName
          createdAt
          updatedAt
        }
      }
      lastSeenAt
    }
  }
`;

export const MARK_AS_READ_MUTATION = `
  mutation MarkNotificationsAsRead($accountId: ID!) {
    markNotificationsAsRead(accountId: $accountId)
  }
`;

export const DISMISS_NOTIFICATIONS_MUTATION = `
  mutation DismissNotifications($accountId: ID!, $archiveIds: [ID!]!) {
    dismissNotifications(accountId: $accountId, archiveIds: $archiveIds)
  }
`;

export const DISMISS_ALL_MUTATION = `
  mutation DismissAllNotifications($accountId: ID!) {
    dismissAllNotifications(accountId: $accountId)
  }
`;
