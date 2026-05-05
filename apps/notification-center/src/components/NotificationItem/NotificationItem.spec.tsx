import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationItem } from './NotificationItem';
import { createNotificationItemTestkit } from './NotificationItem.testkit';
import type { Notification } from '../../types/notification.types';

const baseNotification: Notification = {
	id: 'test-1',
	kind: 'success',
	icon: 'check',
	title: 'Recording ready',
	desc: 'Your recording finished processing.',
	project: 'Test Project',
	time: '2m',
	ts: Date.now() - 2 * 60_000,
	unread: true,
};

const renderItem = (
	props: Partial<Notification> = {},
	overrides: Partial<React.ComponentProps<typeof NotificationItem>> = {}
) => {
	const notification = { ...baseNotification, ...props };
	const onDismiss = overrides.onDismiss ?? vi.fn();
	const onClick = overrides.onClick ?? vi.fn();
	const onAction = overrides.onAction ?? vi.fn();

	const { container } = render(
		<NotificationItem
			notification={notification}
			onDismiss={onDismiss}
			onClick={onClick}
			onAction={onAction}
			{...overrides}
		/>
	);

	const testkit = createNotificationItemTestkit(container);
	return { testkit, onDismiss, onClick, onAction };
};

describe('NotificationItem', () => {
	it('should render the notification title', () => {
		const { testkit } = renderItem();
		expect(testkit.getTitle('test-1')).toBe('Recording ready');
	});

	it('should show unread indicator when unread', () => {
		const { testkit } = renderItem({ unread: true });
		expect(testkit.isUnread('test-1')).toBe(true);
	});

	it('should not show unread indicator when read', () => {
		const { testkit } = renderItem({ unread: false });
		expect(testkit.isUnread('test-1')).toBe(false);
	});

	it('should call onClick when item is clicked', () => {
		const { testkit, onClick } = renderItem();
		testkit.click('test-1');
		expect(onClick).toHaveBeenCalledWith('test-1');
	});

	it('should call onDismiss when dismiss button is clicked', () => {
		const { testkit, onDismiss, onClick } = renderItem();
		testkit.dismiss('test-1');
		expect(onDismiss).toHaveBeenCalledWith('test-1');
		expect(onClick).not.toHaveBeenCalled();
	});

	it('should show progress bar for processing notifications', () => {
		const { testkit } = renderItem({ kind: 'processing', progress: 62 });
		expect(testkit.hasProgressBar('test-1')).toBe(true);
	});

	it('should show stalled bar for warning notifications with stalledAt', () => {
		const { testkit } = renderItem({ kind: 'warning', stalledAt: 48 });
		expect(testkit.hasStalledBar('test-1')).toBe(true);
	});

	it('should show project chip when project is set', () => {
		const { testkit } = renderItem({ project: 'My Project' });
		expect(testkit.hasProjectChip('test-1')).toBe(true);
	});

	it('should call onAction when project chip is clicked', () => {
		const { testkit, onAction, onClick } = renderItem({ project: 'My Project' });
		testkit.clickProjectChip('test-1');
		expect(onAction).toHaveBeenCalledWith('test-1', 'Open project');
		expect(onClick).not.toHaveBeenCalled();
	});

	it('should render action buttons', () => {
		const { testkit } = renderItem({
			actions: [{ label: 'Contact support', kind: 'primary' }],
		});
		expect(testkit.hasActions('test-1')).toBe(true);
	});

	it('should call onAction when action button is clicked', () => {
		const { testkit, onAction } = renderItem({
			actions: [{ label: 'Contact support', kind: 'primary' }],
		});
		testkit.clickAction('test-1', 'Contact support');
		expect(onAction).toHaveBeenCalledWith('test-1', 'Contact support');
	});

	it('should apply leaving class when leaving prop is true', () => {
		const { testkit } = renderItem({}, { leaving: true });
		expect(testkit.isLeaving('test-1')).toBe(true);
	});

	it('should apply entering class when entering prop is true', () => {
		const { testkit } = renderItem({}, { entering: true });
		expect(testkit.isEntering('test-1')).toBe(true);
	});
});
