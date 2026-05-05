export type NotificationKind = 'success' | 'processing' | 'warning' | 'error';

export type NotificationIconType = 'check' | 'upload' | 'warn' | 'error' | 'bell';

export interface NotificationAction {
	label: string;
	kind: 'primary' | 'ghost';
}

export interface Notification {
	id: string;
	kind: NotificationKind;
	icon: NotificationIconType;
	title: string;
	desc: string;
	project?: string;
	time: string;
	ts: number;
	unread: boolean;
	progress?: number;
	stalledAt?: number;
	errorCode?: string;
	actions?: NotificationAction[];
	/** archiveIds associated with this card, used for dismiss logic */
	archiveIds?: string[];
	sessionId?: string;
}

/**
 * Shape returned by the GraphQL notifications query after
 * the gateway resolves the Recording federation entity.
 */
export interface RecordingNotification {
	archiveId: string;
	sessionId: string;
	speakerName: string;
	clientStatus: 'recording' | 'uploading' | 'uploaded';
	status: 'recording' | 'uploading' | 'uploaded' | 'done' | 'failed';
	uploadProgress: number;
	projectName: string;
	createdAt: string;
	updatedAt: string;
}

export type TrackState = 'uploading' | 'processing' | 'done' | 'failed' | 'stalled' | 'done_partial';

/**
 * Derives a simplified track state from the raw clientStatus + status combo.
 * The stalled vs uploading distinction requires session-level context
 * and is handled in the mapper, not here.
 */
export function deriveTrackState(rec: RecordingNotification): TrackState {
	if (rec.status === 'failed') return 'failed';
	if (rec.status === 'done') {
		return rec.clientStatus === 'uploaded' ? 'done' : 'done_partial';
	}
	if (rec.clientStatus === 'uploaded' && rec.status === 'uploaded') return 'processing';
	return 'uploading';
}
