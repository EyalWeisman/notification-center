/** @jsxImportSource @emotion/react */
import type { Notification, NotificationIconType } from '../../types/notification.types';
import { IconBell, IconCheck, IconUpload, IconWarn, IconError, IconX, IconArrowUpRight } from '../icons/icons';
import {
	itemStyle,
	thumbStyle,
	bodyStyle,
	titleRowStyle,
	itemTitleStyle,
	timeStyle,
	descStyle,
	projectChipStyle,
	progressStyle,
	progressFillStyle,
	itemActionsStyle,
	actionBtnStyle,
	dismissStyle,
} from './NotificationItem.styles';
import { relativeTime } from './utils';

function ThumbIcon({ icon }: { icon: NotificationIconType }) {
	switch (icon) {
		case 'check':
			return <IconCheck />;
		case 'upload':
			return <IconUpload />;
		case 'warn':
			return <IconWarn />;
		case 'error':
			return <IconError />;
		default:
			return <IconBell />;
	}
}

export interface NotificationItemProps {
	notification: Notification;
	leaving?: boolean;
	entering?: boolean;
	onDismiss: (id: string) => void;
	onClick: (id: string) => void;
	onAction?: (id: string, label: string) => void;
}

export function NotificationItem({
	notification: n,
	leaving,
	entering,
	onDismiss,
	onClick,
	onAction,
}: NotificationItemProps) {
	const classNames = [
		`kind-${n.kind}`,
		n.unread ? 'unread' : 'read',
		leaving ? 'leaving' : '',
		entering ? 'entering' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			css={itemStyle}
			className={classNames}
			onClick={() => onClick(n.id)}
			role="button"
			tabIndex={0}
			data-testid={`notification-item-${n.id}`}
		>
			<div css={thumbStyle} className={n.kind}>
				<ThumbIcon icon={n.icon} />
			</div>

			<div css={bodyStyle}>
				<div css={titleRowStyle}>
					<div css={itemTitleStyle} data-testid="notification-title">
						{n.title}
					</div>
					<div css={timeStyle}>{relativeTime(n.ts)}</div>
				</div>

				<div css={descStyle}>{n.desc}</div>

				{n.project && (
					<button
						css={projectChipStyle}
						onClick={(e) => {
							e.stopPropagation();
							onAction?.(n.id, 'Open project');
						}}
						title="Open project"
						data-testid="project-chip"
					>
						<span className="dot" />
						<span className="label-default">{n.project}</span>
						<span className="label-hover">Go to project</span>
						<IconArrowUpRight className="arrow" width={11} height={11} />
					</button>
				)}

				{typeof n.progress === 'number' && (
					<div css={progressStyle} data-testid="progress-bar">
						<div css={progressFillStyle} style={{ width: `${n.progress}%` }} />
					</div>
				)}

				{typeof n.stalledAt === 'number' && (
					<div css={progressStyle} className="stalled" data-testid="stalled-bar">
						<div css={progressFillStyle} className="warn" style={{ width: `${n.stalledAt}%` }} />
					</div>
				)}

				{n.actions && n.actions.length > 0 && (
					<div
						css={itemActionsStyle}
						onClick={(e) => e.stopPropagation()}
						data-testid="notification-actions"
					>
						{n.actions
							.filter((a) => a.label !== 'Open project')
							.map((a, i) => (
								<button
									key={i}
									css={actionBtnStyle}
									className={`${a.kind} ${n.kind === 'error' && a.kind === 'primary' ? 'danger' : ''}`}
									onClick={(e) => {
										e.stopPropagation();
										onAction?.(n.id, a.label);
									}}
									data-testid={`action-btn-${a.label.toLowerCase().replace(/\s+/g, '-')}`}
								>
									{a.label}
								</button>
							))}
					</div>
				)}
			</div>

			<button
				css={dismissStyle}
				className="nc-dismiss"
				aria-label="Dismiss"
				onClick={(e) => {
					e.stopPropagation();
					onDismiss(n.id);
				}}
				data-testid="dismiss-btn"
			>
				<IconX />
			</button>
		</div>
	);
}
