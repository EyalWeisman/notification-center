import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { notificationReducer } from './notification.slice';

export const notificationStore = configureStore({
	reducer: {
		notifications: notificationReducer,
	},
});

export type NotificationRootState = ReturnType<typeof notificationStore.getState>;
export type NotificationDispatch = typeof notificationStore.dispatch;

export const useNotificationDispatch: () => NotificationDispatch = useDispatch;
export const useNotificationSelector: TypedUseSelectorHook<NotificationRootState> = useSelector;
