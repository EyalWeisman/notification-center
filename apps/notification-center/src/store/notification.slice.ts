import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
	open: boolean;
	leavingIds: string[];
	enteringIds: string[];
}

const initialState: NotificationState = {
	open: false,
	leavingIds: [],
	enteringIds: [],
};

export const notificationSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		toggle(state) {
			state.open = !state.open;
		},
		close(state) {
			state.open = false;
		},
		startDismiss(state, action: PayloadAction<string>) {
			if (!state.leavingIds.includes(action.payload)) {
				state.leavingIds.push(action.payload);
			}
		},
		finishDismiss(state, action: PayloadAction<string>) {
			state.leavingIds = state.leavingIds.filter((id) => id !== action.payload);
		},
		startClearAll(state, action: PayloadAction<string[]>) {
			state.leavingIds = action.payload;
		},
		finishClearAll(state) {
			state.leavingIds = [];
		},
		startEntering(state, action: PayloadAction<string>) {
			state.enteringIds.push(action.payload);
		},
		finishEntering(state, action: PayloadAction<string>) {
			state.enteringIds = state.enteringIds.filter((id) => id !== action.payload);
		},
		resetState() {
			return initialState;
		},
	},
});

export const notificationActions = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
