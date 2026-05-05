import type { RecordingNotification, Notification, TrackState } from '../types/notification.types';
import { deriveTrackState } from '../types/notification.types';
import { relativeTime } from '../components/NotificationItem/utils';

interface TrackWithState {
	rec: RecordingNotification;
	state: TrackState;
}

function groupBySessionId(recordings: RecordingNotification[]): Map<string, RecordingNotification[]> {
	const map = new Map<string, RecordingNotification[]>();
	for (const rec of recordings) {
		const group = map.get(rec.sessionId) ?? [];
		group.push(rec);
		map.set(rec.sessionId, group);
	}
	return map;
}

/**
 * Refines uploading vs stalled at the session level.
 * A track is stalled if it's still uploading/recording but every other track
 * in the session has already moved past upload (clientStatus === 'uploaded' or done/failed).
 */
function refineTrackStates(tracks: TrackWithState[]): TrackWithState[] {
	const othersPastUpload = (idx: number) =>
		tracks.every(
			(t, i) => i === idx || t.rec.clientStatus === 'uploaded' || t.state === 'done' || t.state === 'failed' || t.state === 'done_partial'
		);

	return tracks.map((t, i) => {
		if (t.state === 'uploading' && tracks.length > 1 && othersPastUpload(i)) {
			return { ...t, state: 'stalled' as TrackState };
		}
		return t;
	});
}

function buildSessionCard(sessionId: string, tracks: TrackWithState[]): Notification | null {
	const firstRec = tracks[0].rec;
	const ts = Math.max(...tracks.map((t) => new Date(t.rec.updatedAt).getTime()));
	const archiveIds = tracks.map((t) => t.rec.archiveId);

	const uploading = tracks.filter((t) => t.state === 'uploading');
	const processing = tracks.filter((t) => t.state === 'processing');
	const done = tracks.filter((t) => t.state === 'done');
	const failed = tracks.filter((t) => t.state === 'failed');
	const stalled = tracks.filter((t) => t.state === 'stalled');
	const donePartial = tracks.filter((t) => t.state === 'done_partial');

	const hasProblems = failed.length > 0 || stalled.length > 0 || donePartial.length > 0;

	if (uploading.length > 0) {
		const uploaded = tracks.length - uploading.length;
		const maxProgress = Math.max(...uploading.map((t) => t.rec.uploadProgress));
		return {
			id: `session-${sessionId}`,
			kind: 'processing',
			icon: 'upload',
			title: 'Uploading recording',
			desc: `Track ${uploaded} of ${tracks.length} uploaded.`,
			project: firstRec.projectName,
			time: relativeTime(ts),
			ts,
			unread: false,
			progress: maxProgress,
			archiveIds,
			sessionId,
		};
	}

	if (processing.length > 0) {
		return {
			id: `session-${sessionId}`,
			kind: 'processing',
			icon: 'upload',
			title: 'Processing recording',
			desc: 'Processing your recording\u2026',
			project: firstRec.projectName,
			time: relativeTime(ts),
			ts,
			unread: false,
			archiveIds,
			sessionId,
		};
	}

	if (done.length === tracks.length && !hasProblems) {
		return {
			id: `session-${sessionId}`,
			kind: 'success',
			icon: 'check',
			title: 'Recording ready',
			desc: 'Recording finished processing and is ready to edit.',
			project: firstRec.projectName,
			time: relativeTime(ts),
			ts,
			unread: false,
			archiveIds,
			sessionId,
		};
	}

	if (hasProblems && done.length + failed.length + stalled.length + donePartial.length === tracks.length) {
		if (done.length > 0) {
			return {
				id: `session-${sessionId}`,
				kind: 'success',
				icon: 'check',
				title: 'Recording ready',
				desc: 'Recording finished processing and is ready to edit.',
				project: firstRec.projectName,
				time: relativeTime(ts),
				ts,
				unread: false,
				archiveIds,
				sessionId,
			};
		}
	}

	return null;
}

function buildTrackCards(tracks: TrackWithState[], sessionId: string): Notification[] {
	const cards: Notification[] = [];
	const firstRec = tracks[0].rec;

	for (const t of tracks) {
		const ts = new Date(t.rec.updatedAt).getTime();

		if (t.state === 'failed') {
			cards.push({
				id: `track-${t.rec.archiveId}`,
				kind: 'error',
				icon: 'error',
				title: 'Track processing failed',
				desc: `${t.rec.speakerName}\u2019s audio track couldn\u2019t be processed.`,
				project: firstRec.projectName,
				time: relativeTime(ts),
				ts,
				unread: false,
				actions: [{ label: 'Contact support', kind: 'primary' }],
				archiveIds: [t.rec.archiveId],
				sessionId,
			});
		}

		if (t.state === 'stalled') {
			cards.push({
				id: `track-${t.rec.archiveId}`,
				kind: 'warning',
				icon: 'warn',
				title: "Guest upload didn\u2019t finish",
				desc: `${t.rec.speakerName} left before their local tracks finished uploading.`,
				project: firstRec.projectName,
				time: relativeTime(ts),
				ts,
				unread: false,
				stalledAt: t.rec.uploadProgress,
				actions: [
					{ label: 'Remind guest', kind: 'primary' },
					{ label: 'Open project', kind: 'ghost' },
				],
				archiveIds: [t.rec.archiveId],
				sessionId,
			});
		}

		if (t.state === 'done_partial') {
			cards.push({
				id: `track-${t.rec.archiveId}`,
				kind: 'warning',
				icon: 'warn',
				title: 'Partial recording available',
				desc: `${t.rec.speakerName}\u2019s recording was incompletely uploaded. A partial version is available.`,
				project: firstRec.projectName,
				time: relativeTime(ts),
				ts,
				unread: false,
				archiveIds: [t.rec.archiveId],
				sessionId,
			});
		}
	}

	return cards;
}

/**
 * Groups raw RecordingNotification[] by sessionId and derives
 * UI notification cards (session-level + track-level).
 */
export function mapRecordingsToNotifications(recordings: RecordingNotification[]): Notification[] {
	const sessions = groupBySessionId(recordings);
	const cards: Notification[] = [];

	for (const [sessionId, recs] of sessions) {
		const rawTracks = recs.map((rec) => ({ rec, state: deriveTrackState(rec) }));
		const tracks = refineTrackStates(rawTracks);

		const sessionCard = buildSessionCard(sessionId, tracks);
		if (sessionCard) cards.push(sessionCard);

		const trackCards = buildTrackCards(tracks, sessionId);
		cards.push(...trackCards);
	}

	cards.sort((a, b) => b.ts - a.ts);
	return cards;
}
