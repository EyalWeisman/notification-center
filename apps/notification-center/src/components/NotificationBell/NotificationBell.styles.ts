import { css, keyframes } from '@emotion/react';

const bellPulse = keyframes`
	0% { box-shadow: 0 0 0 0 rgba(120, 72, 255, 0.45); }
	70% { box-shadow: 0 0 0 8px rgba(120, 72, 255, 0); }
	100% { box-shadow: 0 0 0 0 rgba(120, 72, 255, 0); }
`;

export const bellBtnStyle = css`
	position: relative;
	width: 36px;
	height: 36px;
	border-radius: var(--radius-md);
	background: transparent;
	border: 1px solid transparent;
	color: var(--color-secondary-c150);
	display: grid;
	place-items: center;
	cursor: pointer;
	transition:
		background var(--dur-fast) var(--ease-standard),
		border-color var(--dur-fast) var(--ease-standard),
		color var(--dur-fast) var(--ease-standard);

	&:hover {
		background: var(--color-secondary-c900);
		color: var(--color-secondary-c100);
	}

	&.open {
		background: var(--color-secondary-c900);
		border-color: var(--color-secondary-c700);
		color: var(--color-secondary-c100);
	}

	svg {
		width: 18px;
		height: 18px;
	}

	&.has-unread {
		color: var(--color-secondary-c100);
	}

	&.pulse::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: var(--radius-md);
		box-shadow: 0 0 0 0 rgba(120, 72, 255, 0.45);
		animation: ${bellPulse} 2.4s var(--ease-standard) infinite;
		pointer-events: none;
	}
`;

export const badgeStyle = css`
	position: absolute;
	top: 2px;
	right: 2px;
	min-width: 16px;
	height: 16px;
	padding: 0 4px;
	border-radius: var(--radius-pill);
	background: var(--color-primary-c800);
	color: white;
	font: 700 10px/16px var(--font-family-main);
	text-align: center;
	box-shadow: 0 0 0 2px var(--color-black);
	letter-spacing: 0.02em;
`;
