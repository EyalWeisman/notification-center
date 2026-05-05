import { useState, useEffect, useRef, useCallback } from 'react';
import { loadMFE } from '@riversidefm/rollout-control';

interface ProgressEvent {
	archiveId: string;
	totalBytesUploaded: number;
	totalBytes: number;
}

interface CompletedEvent {
	archiveId: string;
}

interface UploadServiceInstance {
	on: (event: string, handler: (...args: unknown[]) => void) => void;
	off: (event: string, handler: (...args: unknown[]) => void) => void;
}

async function getUploadService(): Promise<UploadServiceInstance | null> {
	try {
		const module = await loadMFE('web_uploader', 'uploadServiceInstance');
		return module.default;
	} catch {
		return null;
	}
}

/**
 * Subscribes to the already-running UploadService singleton for real-time
 * upload progress. Returns a Map of archiveId -> progress percentage.
 */
export function useUploadProgress(
	archiveIds: string[],
	onUploadCompleted?: (archiveId: string) => void
): Map<string, number> {
	const [progressMap, setProgressMap] = useState<Map<string, number>>(() => new Map());
	const archiveIdSetRef = useRef<Set<string>>(new Set());
	const serviceRef = useRef<UploadServiceInstance | null>(null);
	const onCompletedRef = useRef(onUploadCompleted);
	onCompletedRef.current = onUploadCompleted;

	useEffect(() => {
		archiveIdSetRef.current = new Set(archiveIds);
	}, [archiveIds]);

	const handleProgress = useCallback((data: ProgressEvent) => {
		if (!archiveIdSetRef.current.has(data.archiveId)) return;
		const pct = Math.min(Math.round((data.totalBytesUploaded / (data.totalBytes + 0.000001)) * 100), 99);
		setProgressMap((prev) => {
			if (prev.get(data.archiveId) === pct) return prev;
			const next = new Map(prev);
			next.set(data.archiveId, pct);
			return next;
		});
	}, []);

	const handleCompleted = useCallback((data: CompletedEvent) => {
		if (!archiveIdSetRef.current.has(data.archiveId)) return;
		setProgressMap((prev) => {
			const next = new Map(prev);
			next.set(data.archiveId, 100);
			return next;
		});
		onCompletedRef.current?.(data.archiveId);
	}, []);

	useEffect(() => {
		if (archiveIds.length === 0) return;

		let cancelled = false;

		getUploadService().then((service) => {
			if (cancelled || !service) return;
			serviceRef.current = service;
			service.on('progressByArchiveId', handleProgress as (...args: unknown[]) => void);
			service.on('uploadCompletedByArchiveId', handleCompleted as (...args: unknown[]) => void);
		});

		return () => {
			cancelled = true;
			const service = serviceRef.current;
			if (service) {
				service.off('progressByArchiveId', handleProgress as (...args: unknown[]) => void);
				service.off('uploadCompletedByArchiveId', handleCompleted as (...args: unknown[]) => void);
				serviceRef.current = null;
			}
		};
	}, [archiveIds.length > 0]); // subscribe once when we have uploading archives, unsub when none

	return progressMap;
}
