/** @jsxImportSource @emotion/react */
import { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { IconBell } from '../icons/icons';
import { NotificationPanel } from '../NotificationPanel';
import { useNotifications } from '../../store/useNotifications';
import { notificationStore } from '../../store/notification.store';
import { bellBtnStyle, badgeStyle } from './NotificationBell.styles';

function NotificationBellInner() {
	const {
		notifications,
		open,
		unreadCount,
		leavingIds,
		enteringIds,
		toggle,
		close,
		dismiss,
		markAllAsRead,
		clearAll,
	} = useNotifications();

	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		},
		[close]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [handleEscape]);

	const bellClassNames = [unreadCount > 0 ? 'has-unread pulse' : '', open ? 'open' : '']
		.filter(Boolean)
		.join(' ');

	return (
		<>
			<button
				css={bellBtnStyle}
				className={bellClassNames}
				onClick={toggle}
				aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
				aria-expanded={open}
				data-testid="nc-bell-btn"
			>
				<IconBell />
				{unreadCount > 0 && (
					<span css={badgeStyle} data-testid="nc-bell-badge">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<NotificationPanel
					notifications={notifications}
					leavingIds={leavingIds}
					enteringIds={enteringIds}
					onClose={close}
					onDismiss={dismiss}
					onItemClick={() => {}}
					onMarkAllRead={markAllAsRead}
					onClearAll={clearAll}
				/>
			)}
		</>
	);
}

/**
 * Self-contained notification bell widget exposed via Module Federation.
 * Wraps its own Redux store for UI animation state.
 * Data is fetched via GraphQL hooks from @riversidefm/client-graphql.
 */
export function NotificationBell() {
	return (
		<Provider store={notificationStore}>
			<NotificationBellInner />
		</Provider>
	);
}
