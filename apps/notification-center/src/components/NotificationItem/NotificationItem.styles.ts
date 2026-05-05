import { css, keyframes } from '@emotion/react';

const ncLeave = keyframes`
	to {
		opacity: 0;
		transform: translateX(12px);
		max-height: 0;
		padding-top: 0;
		padding-bottom: 0;
		border-bottom-width: 0;
	}
`;

const ncEnter = keyframes`
	from {
		opacity: 0;
		transform: translateY(-8px);
		background: rgba(120, 72, 255, 0.08);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
`;

const ncSpin = keyframes`
	to { transform: rotate(360deg); }
`;

export const itemStyle = css`
	position: relative;
	display: flex;
	gap: 12px;
	padding: 12px 16px;
	cursor: pointer;
	border-bottom: 1px solid var(--color-secondary-c900);
	transition: background var(--dur-fast) var(--ease-standard);

	&:last-child {
		border-bottom: 0;
	}

	&:hover {
		background: var(--color-secondary-c900);
	}

	&.read {
		opacity: 0.7;
	}

	&.unread {
		padding-left: 22px;
	}

	&.unread::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 18px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-primary-c700);
		box-shadow: 0 0 0 3px rgba(120, 72, 255, 0.18);
	}

	&.kind-error.unread::before {
		background: var(--color-error-c600);
		box-shadow: 0 0 0 3px rgba(242, 87, 87, 0.18);
	}

	&.leaving {
		animation: ${ncLeave} 220ms var(--ease-standard) forwards;
		pointer-events: none;
	}

	&.entering {
		animation: ${ncEnter} 320ms var(--ease-emphasized) forwards;
	}

	&:hover .nc-dismiss {
		opacity: 1;
	}
`;

export const thumbStyle = css`
	width: 40px;
	height: 40px;
	border-radius: var(--radius-md);
	background: var(--color-secondary-c900);
	border: 1px solid var(--color-secondary-c700);
	display: grid;
	place-items: center;
	color: var(--color-secondary-c100);
	flex-shrink: 0;
	overflow: hidden;
	position: relative;

	svg {
		width: 18px;
		height: 18px;
	}

	&.success {
		background: rgba(111, 207, 151, 0.1);
		border-color: rgba(111, 207, 151, 0.25);
		color: var(--color-success-c600);
	}

	&.processing {
		background: rgba(120, 72, 255, 0.1);
		border-color: rgba(120, 72, 255, 0.3);
		color: var(--color-primary-c500);
	}

	&.processing::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: var(--radius-md);
		border: 1.5px solid transparent;
		border-top-color: var(--color-primary-c600);
		border-right-color: var(--color-primary-c600);
		animation: ${ncSpin} 1.4s linear infinite;
	}

	&.warning {
		background: rgba(242, 201, 76, 0.1);
		border-color: rgba(242, 201, 76, 0.3);
		color: var(--color-warning-c700);
	}

	&.error {
		background: rgba(242, 112, 112, 0.12);
		border-color: rgba(242, 112, 112, 0.3);
		color: var(--color-error-c500);
	}
`;

export const bodyStyle = css`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const titleRowStyle = css`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 8px;
`;

export const itemTitleStyle = css`
	font: var(--font-label-medium);
	color: var(--color-secondary-c100);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
`;

export const timeStyle = css`
	font: var(--font-tiny-label);
	color: var(--color-secondary-c300);
	flex-shrink: 0;
`;

export const descStyle = css`
	font: var(--font-body-small);
	color: var(--color-secondary-c200);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

export const projectChipStyle = css`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-top: 8px;
	padding: 3px 8px;
	background: var(--color-secondary-c900);
	border: 1px solid var(--color-secondary-c700);
	border-radius: var(--radius-pill);
	color: var(--color-secondary-c150);
	font: var(--font-tip);
	max-width: 100%;
	cursor: pointer;
	transition:
		background var(--dur-fast) var(--ease-standard),
		border-color var(--dur-fast) var(--ease-standard),
		color var(--dur-fast) var(--ease-standard);

	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.label-hover {
		display: none;
	}

	&:hover .label-default {
		display: none;
	}

	&:hover .label-hover {
		display: inline;
	}

	&:hover {
		background: var(--color-secondary-c800);
		border-color: var(--color-primary-c700);
		color: var(--color-primary-c300);
	}

	&:hover .arrow {
		color: var(--color-primary-c500);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-primary-c600);
		flex-shrink: 0;
	}

	.arrow {
		color: var(--color-secondary-c300);
		margin-left: 2px;
		flex-shrink: 0;
		transition: color var(--dur-fast) var(--ease-standard);
	}
`;

export const progressStyle = css`
	margin-top: 8px;
	height: 4px;
	background: var(--color-secondary-c800);
	border-radius: var(--radius-pill);
	overflow: hidden;
	position: relative;

	&.stalled {
		background: rgba(242, 201, 76, 0.12);
	}
`;

export const progressFillStyle = css`
	height: 100%;
	background: linear-gradient(90deg, var(--color-primary-c700), var(--color-primary-c500));
	border-radius: var(--radius-pill);
	transition: width 600ms var(--ease-standard);

	&.warn {
		background: repeating-linear-gradient(
			45deg,
			var(--color-warning-c700),
			var(--color-warning-c700) 4px,
			var(--color-warning-c800) 4px,
			var(--color-warning-c800) 8px
		);
	}
`;

export const itemActionsStyle = css`
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
	margin-top: 10px;
`;

export const actionBtnStyle = css`
	padding: 6px 10px;
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-secondary-c700);
	background: var(--color-secondary-c900);
	color: var(--color-secondary-c100);
	font: var(--font-label-small);
	cursor: pointer;
	transition:
		background var(--dur-fast) var(--ease-standard),
		border-color var(--dur-fast) var(--ease-standard);

	&:hover {
		background: var(--color-secondary-c800);
		border-color: var(--color-secondary-c500);
	}

	&.primary {
		background: var(--color-primary-c800);
		border-color: var(--color-primary-c800);
		color: white;
	}

	&.primary:hover {
		background: var(--color-primary-c700);
		border-color: var(--color-primary-c700);
	}

	&.primary.danger {
		background: var(--color-error-c700);
		border-color: var(--color-error-c700);
	}

	&.primary.danger:hover {
		background: var(--color-error-c600);
		border-color: var(--color-error-c600);
	}

	&.ghost {
		background: transparent;
	}
`;

export const dismissStyle = css`
	position: absolute;
	top: 10px;
	right: 8px;
	width: 22px;
	height: 22px;
	border-radius: var(--radius-sm);
	border: 0;
	background: var(--color-secondary-c800);
	color: var(--color-secondary-c200);
	display: grid;
	place-items: center;
	cursor: pointer;
	opacity: 0;
	transition:
		opacity var(--dur-fast) var(--ease-standard),
		background var(--dur-fast) var(--ease-standard);

	svg {
		width: 11px;
		height: 11px;
	}

	&:hover {
		background: var(--color-secondary-c600);
		color: var(--color-secondary-c100);
	}
`;
