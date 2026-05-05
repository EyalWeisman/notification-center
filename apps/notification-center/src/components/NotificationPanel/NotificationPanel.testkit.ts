import { within, fireEvent } from '@testing-library/react';

export const createNotificationPanelTestkit = (container: HTMLElement) => {
	const getPanel = () => within(container).getByTestId('nc-panel');
	const queryPanel = () => within(container).queryByTestId('nc-panel');

	return {
		isVisible: () => queryPanel() !== null,

		getUnreadCount: () => {
			const badge = within(container).queryByTestId('nc-unread-count');
			return badge ? Number(badge.textContent) : 0;
		},

		clickMarkAllRead: () => {
			fireEvent.click(within(container).getByTestId('nc-mark-all-read'));
		},

		isMarkAllReadDisabled: () => {
			const btn = within(container).getByTestId('nc-mark-all-read');
			return btn.hasAttribute('disabled');
		},

		clickClearAll: () => {
			fireEvent.click(within(container).getByTestId('nc-clear-all'));
		},

		isClearAllDisabled: () => {
			const btn = within(container).getByTestId('nc-clear-all');
			return btn.hasAttribute('disabled');
		},

		clickBackdrop: () => {
			fireEvent.click(within(container).getByTestId('nc-backdrop'));
		},

		isEmpty: () => within(container).queryByTestId('nc-empty') !== null,

		getNotificationCount: () => {
			const list = within(container).queryByTestId('nc-list');
			if (!list) return 0;
			return list.querySelectorAll('[data-testid^="notification-item-"]').length;
		},

		hasSettingsButton: () => within(container).queryByTestId('nc-settings-btn') !== null,
	};
};
