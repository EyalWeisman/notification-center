import { helloWorld } from '@mfe/hello-world';
import { useFeatureFlags } from '@riversidefm/feature-flags/browser';
import { useUserData, useUserActions } from '@riversidefm/state-management';

export function App() {
	console.log(helloWorld());
	const ff = useFeatureFlags();
	const userData = useUserData();
	console.log({ ff, userData });
	const { logoutUser } = useUserActions();

	const handleLogout = () => {
		logoutUser();
	};

	return (
		<div style={{ color: 'red' }}>
			<div>MFE Component</div>
			<div style={{ fontSize: '12px', marginTop: '10px' }}>User: {userData?.name || 'Not logged in'}</div>
			<div style={{ fontSize: '12px' }}>Status: {userData?.id ? '✅ Logged In' : '❌ Not Logged In'}</div>
			<button onClick={handleLogout}>log out</button>
		</div>
	);
}

export default App;
