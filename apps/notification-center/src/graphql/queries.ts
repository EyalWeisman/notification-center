export const NOTIFICATIONS_QUERY = `
  query Notifications {
    notifications {
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

export const MARK_SEEN_MUTATION = `
  mutation MarkNotificationsSeen {
    markNotificationsSeen
  }
`;

export const DISMISS_NOTIFICATIONS_MUTATION = `
  mutation DismissNotifications($archiveIds: [ID!]!) {
    dismissNotifications(archiveIds: $archiveIds)
  }
`;

export const DISMISS_ALL_MUTATION = `
  mutation DismissAllNotifications {
    dismissAllNotifications
  }
`;
