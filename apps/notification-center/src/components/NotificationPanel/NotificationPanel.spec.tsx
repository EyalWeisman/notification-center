import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationPanel } from './NotificationPanel';
import { createNotificationPanelTestkit } from './NotificationPanel.testkit';
import type { Notification } from '../../types/notification.types';

const mockNotifications: Notification[] = [
	{
		id: 'n1',
		kind: 'success',
		icon: 'check',
		title: 'Recording ready',
		desc: 'Your recording is ready.',
		project: 'Test Project',
		time: '2m',
		ts: Date.now() - 120_000,
		unread: true,
	},
	{
		id: 'n2',
		kind: 'processing',
		icon: 'upload',
		title: 'Uploading',
		desc: 'Upload in progress.',
		time: 'Now',
		ts: Date.now(),
		unread: true,
		progress: 50,
	},
	{
		id: 'n3',
		kind: 'warning',
		icon: 'warn',
		title: 'Upload paused',
		desc: 'Connection lost.',
		time: '1h',
		ts: Date.now() - 3_600_000,
		unread: false,
	},
];

const defaultProps = {
	notifications: mockNotifications,
	leavingIds: new Set<string>(),
	enteringIds: new Set<string>(),
	onClose: vi.fn(),
	onDismiss: vi.fn(),
	onItemClick: vi.fn(),
	onAction: vi.fn(),
	onMarkAllRead: vi.fn(),
	onClearAll: vi.fn(),
};

const renderPanel = (overrides: Partial<typeof defaultProps> = {}) => {
	const props = { ...defaultProps, ...overrides };
	const { container } = render(<NotificationPanel {...props} />);
	const testkit = createNotificationPanelTestkit(container);
	return { testkit, ...props };
};

describe('NotificationPanel', () => {
	it('should render the panel', () => {
		const { testkit } = renderPanel();
		expect(testkit.isVisible()).toBe(true);
	});

	it('should show unread count badge', () => {
		const { testkit } = renderPanel();
		expect(testkit.getUnreadCount()).toBe(2);
	});

	it('should render all notifications', () => {
		const { testkit } = renderPanel();
		expect(testkit.getNotificationCount()).toBe(3);
	});

	it('should show empty state when there are no notifications', () => {
		const { testkit } = renderPanel({ notifications: [] });
		expect(testkit.isEmpty()).toBe(true);
		expect(testkit.getNotificationCount()).toBe(0);
	});

	it('should call onClose when backdrop is clicked', () => {
		const { testkit, onClose } = renderPanel();
		testkit.clickBackdrop();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should call onMarkAllRead when button is clicked', () => {
		const { testkit, onMarkAllRead } = renderPanel();
		testkit.clickMarkAllRead();
		expect(onMarkAllRead).toHaveBeenCalledTimes(1);
	});

	it('should disable Mark all as read when no unread notifications', () => {
		const readNotifications = mockNotifications.map((n) => ({ ...n, unread: false }));
		const { testkit } = renderPanel({ notifications: readNotifications });
		expect(testkit.isMarkAllReadDisabled()).toBe(true);
	});

	it('should call onClearAll when button is clicked', () => {
		const { testkit, onClearAll } = renderPanel();
		testkit.clickClearAll();
		expect(onClearAll).toHaveBeenCalledTimes(1);
	});

	it('should disable Clear all when no notifications', () => {
		const { testkit } = renderPanel({ notifications: [] });
		expect(testkit.isClearAllDisabled()).toBe(true);
	});

	it('should render settings button', () => {
		const { testkit } = renderPanel();
		expect(testkit.hasSettingsButton()).toBe(true);
	});
});
