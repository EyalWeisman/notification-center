import { within, fireEvent } from '@testing-library/react';

export const createNotificationBellTestkit = (container: HTMLElement) => {
	const getBellBtn = () => within(container).getByTestId('nc-bell-btn');

	return {
		clickBell: () => {
			fireEvent.click(getBellBtn());
		},

		getUnreadBadge: () => {
			const badge = within(container).queryByTestId('nc-bell-badge');
			return badge ? badge.textContent || '' : null;
		},

		hasUnreadIndicator: () => {
			return getBellBtn().classList.contains('has-unread');
		},

		isPanelOpen: () => {
			return within(container).queryByTestId('nc-panel') !== null;
		},

		hasPulseAnimation: () => {
			return getBellBtn().classList.contains('pulse');
		},

		isAriaExpanded: () => {
			return getBellBtn().getAttribute('aria-expanded') === 'true';
		},

		closePanelViaBackdrop: () => {
			const backdrop = within(container).queryByTestId('nc-backdrop');
			if (backdrop) fireEvent.click(backdrop);
		},
	};
};
