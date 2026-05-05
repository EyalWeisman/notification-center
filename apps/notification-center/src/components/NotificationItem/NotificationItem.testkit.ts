import { within, fireEvent } from '@testing-library/react';

export const createNotificationItemTestkit = (container: HTMLElement) => {
	const getItem = (id: string) => within(container).getByTestId(`notification-item-${id}`);

	const queryItem = (id: string) => within(container).queryByTestId(`notification-item-${id}`);

	return {
		click: (id: string) => {
			fireEvent.click(getItem(id));
		},

		dismiss: (id: string) => {
			const item = getItem(id);
			const dismissBtn = within(item).getByTestId('dismiss-btn');
			fireEvent.click(dismissBtn);
		},

		getTitle: (id: string) => {
			const item = getItem(id);
			return within(item).getByTestId('notification-title').textContent || '';
		},

		isUnread: (id: string) => {
			return getItem(id).classList.contains('unread');
		},

		isLeaving: (id: string) => {
			return getItem(id).classList.contains('leaving');
		},

		isEntering: (id: string) => {
			return getItem(id).classList.contains('entering');
		},

		hasProgressBar: (id: string) => {
			const item = getItem(id);
			return within(item).queryByTestId('progress-bar') !== null;
		},

		hasStalledBar: (id: string) => {
			const item = getItem(id);
			return within(item).queryByTestId('stalled-bar') !== null;
		},

		hasProjectChip: (id: string) => {
			const item = getItem(id);
			return within(item).queryByTestId('project-chip') !== null;
		},

		clickProjectChip: (id: string) => {
			const item = getItem(id);
			const chip = within(item).getByTestId('project-chip');
			fireEvent.click(chip);
		},

		hasActions: (id: string) => {
			const item = getItem(id);
			return within(item).queryByTestId('notification-actions') !== null;
		},

		clickAction: (id: string, actionLabel: string) => {
			const item = getItem(id);
			const btnTestId = `action-btn-${actionLabel.toLowerCase().replace(/\s+/g, '-')}`;
			const btn = within(item).getByTestId(btnTestId);
			fireEvent.click(btn);
		},

		exists: (id: string) => {
			return queryItem(id) !== null;
		},
	};
};
