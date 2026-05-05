import { useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@riversidefm/client-graphql';
import { useNotificationDispatch, useNotificationSelector } from './notification.store';
import { notificationActions } from './notification.slice';
import { mapRecordingsToNotifications } from './notification.mapper';
import { useUploadProgress } from './useUploadProgress';
import { deriveTrackState } from '../types/notification.types';
import type { RecordingNotification } from '../types/notification.types';
import {
	NOTIFICATIONS_QUERY,
	MARK_SEEN_MUTATION,
	DISMISS_NOTIFICATIONS_MUTATION,
	DISMISS_ALL_MUTATION,
} from '../graphql/queries';

const DISMISS_ANIMATION_MS = 220;
const CLEAR_ALL_ANIMATION_MS = 240;

interface NotificationsResponse {
	notifications: {
		notifications: Array<{ id: string; recording: RecordingNotification }>;
		lastSeenAt: string | null;
	};
}

export function useNotifications() {
	const dispatch = useNotificationDispatch();
	const { open, leavingIds, enteringIds } = useNotificationSelector((state) => state.notifications);

	const { data, refetch } = useQuery<NotificationsResponse>(
		NOTIFICATIONS_QUERY,
		{},
		{}
	);

	const typedData = data as NotificationsResponse | undefined;

	const recordings: RecordingNotification[] = useMemo(
		() => typedData?.notifications?.notifications?.map((n) => n.recording) ?? [],
		[typedData]
	);

	const uploadingArchiveIds = useMemo(
		() => recordings
			.filter((r) => deriveTrackState(r) === 'uploading')
			.map((r) => r.archiveId),
		[recordings]
	);

	const liveProgress = useUploadProgress(uploadingArchiveIds, () => refetch());

	const recordingsWithLiveProgress = useMemo((): RecordingNotification[] => {
		if (liveProgress.size === 0) return recordings;
		return recordings.map((r) => {
			const live = liveProgress.get(r.archiveId);
			if (live == null) return r;
			return { ...r, uploadProgress: live };
		});
	}, [recordings, liveProgress]);

	const lastSeenAt = useMemo(() => {
		const raw = typedData?.notifications?.lastSeenAt;
		return raw ? new Date(raw).getTime() : 0;
	}, [typedData]);

	const notifications = useMemo(() => {
		const cards = mapRecordingsToNotifications(recordingsWithLiveProgress);
		return cards.map((card) => ({
			...card,
			unread: card.ts > lastSeenAt,
		}));
	}, [recordingsWithLiveProgress, lastSeenAt]);

	const unreadCount = useMemo(
		() => notifications.filter((n) => n.unread).length,
		[notifications]
	);

	const { mutate: markSeenMutation } = useMutation(MARK_SEEN_MUTATION);
	const { mutate: dismissMutation } = useMutation(DISMISS_NOTIFICATIONS_MUTATION);
	const { mutate: dismissAllMutation } = useMutation(DISMISS_ALL_MUTATION);

	const openRef = useRef(open);
	openRef.current = open;

	const toggle = useCallback(() => {
		if (!openRef.current) {
			markSeenMutation({}, { onSuccess: () => refetch() });
		}
		dispatch(notificationActions.toggle());
	}, [dispatch, markSeenMutation, refetch]);

	const close = useCallback(() => {
		dispatch(notificationActions.close());
	}, [dispatch]);

	/**
	 * Computes which archiveIds to send to the BE when dismissing a card.
	 * Session cards: all archiveIds in session, minus those with their own track-level card.
	 * Track cards: just that one archiveId.
	 */
	const getArchiveIdsForDismiss = useCallback(
		(cardId: string): string[] => {
			if (cardId.startsWith('track-')) {
				const archiveId = cardId.replace('track-', '');
				return [archiveId];
			}

			const card = notifications.find((n) => n.id === cardId);
			if (!card?.archiveIds) return [];

			const trackCardArchiveIds = new Set(
				notifications
					.filter((n) => n.id.startsWith('track-') && n.sessionId === card.sessionId)
					.flatMap((n) => n.archiveIds ?? [])
			);

			return card.archiveIds.filter((id) => !trackCardArchiveIds.has(id));
		},
		[notifications]
	);

	const dismiss = useCallback(
		(cardId: string) => {
			dispatch(notificationActions.startDismiss(cardId));

			const archiveIds = getArchiveIdsForDismiss(cardId);

			setTimeout(() => {
				dispatch(notificationActions.finishDismiss(cardId));
				if (archiveIds.length > 0) {
					dismissMutation(
						{ archiveIds },
						{ onSuccess: () => refetch() }
					);
				}
			}, DISMISS_ANIMATION_MS);
		},
		[dispatch, getArchiveIdsForDismiss, dismissMutation, refetch]
	);

	const markAllAsRead = useCallback(() => {
		markSeenMutation({}, { onSuccess: () => refetch() });
	}, [markSeenMutation, refetch]);

	const clearAll = useCallback(() => {
		const allIds = notifications.map((n) => n.id);
		dispatch(notificationActions.startClearAll(allIds));

		setTimeout(() => {
			dispatch(notificationActions.finishClearAll());
			dismissAllMutation({}, { onSuccess: () => refetch() });
		}, CLEAR_ALL_ANIMATION_MS);
	}, [dispatch, notifications, dismissAllMutation, refetch]);

	return {
		notifications,
		open,
		unreadCount,
		leavingIds: new Set(leavingIds),
		enteringIds: new Set(enteringIds),
		toggle,
		close,
		dismiss,
		markAllAsRead,
		clearAll,
	};
}
