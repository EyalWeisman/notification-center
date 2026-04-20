import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock @riversidefm/feature-flags/browser
vi.mock('@riversidefm/feature-flags/browser', () => ({
	useFeatureFlags: vi.fn(() => ({})),
	FeatureFlagsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @riversidefm/state-management
vi.mock('@riversidefm/state-management', () => ({
	useUserData: vi.fn(() => null),
	useUserActions: vi.fn(() => ({
		logoutUser: vi.fn(),
	})),
	StateProvider: ({ children }: { children: React.ReactNode }) => children,
}));
