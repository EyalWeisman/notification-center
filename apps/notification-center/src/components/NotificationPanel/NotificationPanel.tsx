/** @jsxImportSource @emotion/react */
import type { Notification } from '../../types/notification.types';
import { NotificationItem } from '../NotificationItem';
import { IconCheck, IconSettings } from '../icons/icons';
import {
	backdropStyle,
	panelStyle,
	headerStyle,
	titleStyle,
	countBadgeStyle,
	actionsStyle,
	linkBtnStyle,
	listStyle,
	emptyStyle,
	footerStyle,
	prefBtnStyle,
} from './NotificationPanel.styles';

export interface NotificationPanelProps {
	notifications: Notification[];
	leavingIds: Set<string>;
	enteringIds: Set<string>;
	onClose: () => void;
	onDismiss: (id: string) => void;
	onItemClick: (id: string) => void;
	onAction?: (id: string, label: string) => void;
	onMarkAllRead: () => void;
	onClearAll: () => void;
}

export function NotificationPanel({
	notifications,
	leavingIds,
	enteringIds,
	onClose,
	onDismiss,
	onItemClick,
	onAction,
	onMarkAllRead,
	onClearAll,
}: NotificationPanelProps) {
	const unread = notifications.filter((n) => n.unread).length;

	return (
		<>
			<div css={backdropStyle} onClick={onClose} data-testid="nc-backdrop" />
			<div css={panelStyle} role="dialog" aria-label="Notifications" data-testid="nc-panel">
				<div css={headerStyle}>
					<div css={titleStyle}>
						<span>Notifications</span>
						{unread > 0 && (
							<span css={countBadgeStyle} data-testid="nc-unread-count">
								{unread}
							</span>
						)}
					</div>
					<div css={actionsStyle}>
						<button
							css={linkBtnStyle}
							disabled={unread === 0}
							onClick={onMarkAllRead}
							data-testid="nc-mark-all-read"
						>
							Mark all as read
						</button>
					</div>
				</div>

				{notifications.length === 0 ? (
					<div css={emptyStyle} data-testid="nc-empty">
						<div className="ring">
							<IconCheck />
						</div>
						<div className="t">You're all caught up</div>
						<div className="s">New recording updates will appear here.</div>
					</div>
				) : (
					<div css={listStyle} data-testid="nc-list">
						{notifications.map((n) => (
							<NotificationItem
								key={n.id}
								notification={n}
								leaving={leavingIds.has(n.id)}
								entering={enteringIds.has(n.id)}
								onDismiss={onDismiss}
								onClick={onItemClick}
								onAction={onAction}
							/>
						))}
					</div>
				)}

				<div css={footerStyle}>
					<button css={prefBtnStyle} data-testid="nc-settings-btn">
						<IconSettings /> Notification settings
					</button>
					<button
						css={linkBtnStyle}
						onClick={onClearAll}
						disabled={notifications.length === 0}
						data-testid="nc-clear-all"
					>
						Clear all
					</button>
				</div>
			</div>
		</>
	);
}
