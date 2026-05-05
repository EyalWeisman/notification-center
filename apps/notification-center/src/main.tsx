import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { init } from '@module-federation/enhanced/runtime';
import { WunderGraphProvider } from '@riversidefm/client-graphql';
import '@riversidefm/riverstyle/styles.css';
import { NotificationBell } from './components/NotificationBell';
import Config from './config';

init({
	name: 'notification_center',
	remotes: [],
});

function StandaloneDev() {
	return (
		<div
			style={{
				background: 'var(--color-black)',
				minHeight: '100vh',
				display: 'flex',
				justifyContent: 'flex-end',
				padding: '10px 24px',
			}}
		>
			<NotificationBell />
		</div>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<StrictMode>
		<WunderGraphProvider config={{ endpoint: Config.supergraph.url }}>
			<StandaloneDev />
		</WunderGraphProvider>
	</StrictMode>
);
