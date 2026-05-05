import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const mockRefetch = vi.fn();
const mockMutate = vi.fn();

const mockQueryResult = {
	data: {
		notifications: {
			notifications: [
				{
					id: 'arch-1',
					recording: {
						archiveId: 'arch-1',
						sessionId: 'session-1',
						speakerName: 'Host',
						clientStatus: 'uploaded',
						status: 'done',
						uploadProgress: 100,
						projectName: 'Test Project',
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				},
			],
			lastSeenAt: '2020-01-01T00:00:00.000Z',
		},
	},
	isLoading: false,
	refetch: mockRefetch,
};

const mockMutationResult = {
	mutate: mockMutate,
	isLoading: false,
};

vi.mock('@riversidefm/client-graphql', () => ({
	useQuery: vi.fn(() => mockQueryResult),
	useMutation: vi.fn(() => mockMutationResult),
	WunderGraphProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@riversidefm/state-management', () => ({
	useUserData: vi.fn(() => ({ id: 'test-account-123' })),
	StateProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@riversidefm/rollout-control', () => ({
	loadMFE: vi.fn(() => Promise.resolve({
		default: {
			on: vi.fn(),
			off: vi.fn(),
		},
	})),
}));
