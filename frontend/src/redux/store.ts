import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
import attendanceReducer from "./slices/attendanceSlice";

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        attendance: attendanceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
