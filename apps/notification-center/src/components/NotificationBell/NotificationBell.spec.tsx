import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationBell } from './NotificationBell';
import { createNotificationBellTestkit } from './NotificationBell.testkit';
import { notificationStore } from '../../store/notification.store';
import { notificationActions } from '../../store/notification.slice';

const renderBell = () => {
	const { container } = render(<NotificationBell />);
	const testkit = createNotificationBellTestkit(container);
	return { testkit, container };
};

describe('NotificationBell', () => {
	beforeEach(() => {
		notificationStore.dispatch(notificationActions.resetState());
	});
	it('should render the bell button', () => {
		const { testkit } = renderBell();
		expect(testkit.getUnreadBadge()).not.toBeNull();
	});

	it('should show unread badge with count', () => {
		const { testkit } = renderBell();
		const badge = testkit.getUnreadBadge();
		expect(badge).toBeTruthy();
		expect(Number(badge)).toBeGreaterThan(0);
	});

	it('should not show panel initially', () => {
		const { testkit } = renderBell();
		expect(testkit.isPanelOpen()).toBe(false);
	});

	it('should open panel when bell is clicked', () => {
		const { testkit } = renderBell();
		testkit.clickBell();
		expect(testkit.isPanelOpen()).toBe(true);
	});

	it('should close panel when bell is clicked again', () => {
		const { testkit } = renderBell();
		testkit.clickBell();
		expect(testkit.isPanelOpen()).toBe(true);
		testkit.clickBell();
		expect(testkit.isPanelOpen()).toBe(false);
	});

	it('should close panel when backdrop is clicked', () => {
		const { testkit } = renderBell();
		testkit.clickBell();
		expect(testkit.isPanelOpen()).toBe(true);
		testkit.closePanelViaBackdrop();
		expect(testkit.isPanelOpen()).toBe(false);
	});

	it('should close panel on Escape key', () => {
		const { testkit } = renderBell();
		testkit.clickBell();
		expect(testkit.isPanelOpen()).toBe(true);
		fireEvent.keyDown(window, { key: 'Escape' });
		expect(testkit.isPanelOpen()).toBe(false);
	});

	it('should have pulse animation when there are unread notifications', () => {
		const { testkit } = renderBell();
		expect(testkit.hasPulseAnimation()).toBe(true);
	});

	it('should set aria-expanded correctly', () => {
		const { testkit } = renderBell();
		expect(testkit.isAriaExpanded()).toBe(false);
		testkit.clickBell();
		expect(testkit.isAriaExpanded()).toBe(true);
	});
});
