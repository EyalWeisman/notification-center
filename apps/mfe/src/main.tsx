import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { init } from '@module-federation/enhanced/runtime';
import { StateProvider, type StoreManagerConfig } from '@riversidefm/state-management';
import { overrideMFEs } from '@riversidefm/rollout-control';
import App from './app/app';
import './styles.css';

const stateConfig: StoreManagerConfig = {
	baseURL: '<REPLACE_WITH_API_BASE_URL>',
	preloadedState: {},
	extraArgument: {
		// httpClient,
	},
};
// Initialize MFE overrides for local development
if (import.meta.env.DEV) {
	overrideMFEs({
		// Add MFEs you need to load with their default localhost ports
		// Example:
		// editor: { useLocalhostDefaultOverride: true },
		// studio: { useLocalhostDefaultOverride: true },
	});
}

// Initialize Module Federation runtime BEFORE any dynamic imports
// This must happen first so remotes can use getInstance()
init({
	name: 'shell',
	// Empty remotes - we'll register them on-demand when routes are accessed
	remotes: [],
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<StrictMode>
		<StateProvider config={stateConfig}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</StateProvider>
	</StrictMode>
);
