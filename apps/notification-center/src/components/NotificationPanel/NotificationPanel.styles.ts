import { css, keyframes } from '@emotion/react';

const ncFadeIn = keyframes`
	to { opacity: 1; }
`;

const ncDropdownIn = keyframes`
	from {
		opacity: 0;
		transform: translateY(-8px) scale(0.98);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
`;

export const backdropStyle = css`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.35);
	backdrop-filter: blur(2px);
	z-index: 50;
	opacity: 0;
	animation: ${ncFadeIn} 160ms var(--ease-standard) forwards;
`;

export const panelStyle = css`
	background: var(--color-secondary-c1000);
	border: 1px solid var(--color-secondary-c700);
	box-shadow: var(--shadow-lg);
	display: flex;
	flex-direction: column;
	z-index: 60;
	overflow: hidden;
	position: fixed;
	right: 20px;
	top: 60px;
	width: 380px;
	max-height: calc(100vh - 80px);
	border-radius: var(--radius-lg);
	transform-origin: top right;
	animation: ${ncDropdownIn} 220ms var(--ease-emphasized) forwards;
`;

export const headerStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px 12px;
	border-bottom: 1px solid var(--color-secondary-c800);
`;

export const titleStyle = css`
	display: flex;
	align-items: center;
	gap: 8px;
	font: var(--font-heading-xsmall);
	color: var(--color-secondary-c100);
`;

export const countBadgeStyle = css`
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	border-radius: var(--radius-pill);
	background: var(--color-primary-c800);
	color: white;
	font: 700 11px/20px var(--font-family-main);
	text-align: center;
	letter-spacing: 0.02em;
`;

export const actionsStyle = css`
	display: flex;
	gap: 4px;
`;

export const linkBtnStyle = css`
	background: transparent;
	border: 0;
	color: var(--color-secondary-c200);
	font: var(--font-link-small);
	padding: 6px 8px;
	border-radius: var(--radius-sm);
	cursor: pointer;

	&:hover {
		background: var(--color-secondary-c800);
		color: var(--color-secondary-c100);
	}

	&:disabled {
		opacity: 0.4;
		cursor: default;
	}

	&:disabled:hover {
		background: transparent;
	}
`;

export const listStyle = css`
	flex: 1;
	overflow-y: auto;
	padding: 4px 0;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-thumb {
		background: var(--color-secondary-c800);
		border-radius: 4px;
	}
`;

export const emptyStyle = css`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 48px 24px;
	text-align: center;

	.ring {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-secondary-c900);
		border: 1px solid var(--color-secondary-c700);
		display: grid;
		place-items: center;
		color: var(--color-secondary-c300);
	}

	.ring svg {
		width: 20px;
		height: 20px;
	}

	.t {
		font: var(--font-heading-xxsmall);
		color: var(--color-secondary-c100);
	}

	.s {
		font: var(--font-body-small);
		color: var(--color-secondary-c300);
	}
`;

export const footerStyle = css`
	padding: 10px 12px;
	border-top: 1px solid var(--color-secondary-c800);
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--color-secondary-c1000);
`;

export const prefBtnStyle = css`
	background: transparent;
	border: 0;
	color: var(--color-secondary-c300);
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font: var(--font-link-small);
	padding: 6px 8px;
	border-radius: var(--radius-sm);
	cursor: pointer;

	&:hover {
		background: var(--color-secondary-c800);
		color: var(--color-secondary-c100);
	}

	svg {
		width: 13px;
		height: 13px;
	}
`;
