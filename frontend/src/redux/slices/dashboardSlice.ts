import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
    getDashboardStats, getAttendanceTrend, getWfhWfoSplit, getDuBreakdown,
    type DashboardStatCard, type AttendanceTrendPoint, type WfhWfoSplitPoint, type DuBreakdownRow,
} from "../../api/dashboardApi";
import { DEFAULT_MONTH } from "../../constants";

interface DashboardState {
    month: string;
    statsCards: DashboardStatCard[];
    attendanceTrend: AttendanceTrendPoint[];
    wfhWfoSplit: WfhWfoSplitPoint[];
    duBreakdown: DuBreakdownRow[];
    loading: boolean;
}

const initialState: DashboardState = {
    month: DEFAULT_MONTH,
    statsCards: [],
    attendanceTrend: [],
    wfhWfoSplit: [],
    duBreakdown: [],
    loading: false,
};

export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetchAll",
    async (month: string) => {
        const [statsRes, trendRes, splitRes, duRes] = await Promise.all([
            getDashboardStats(month),
            getAttendanceTrend(month),
            getWfhWfoSplit(month),
            getDuBreakdown(month),
        ]);
        return {
            statsCards: statsRes.data,
            attendanceTrend: trendRes.data,
            wfhWfoSplit: splitRes.data,
            duBreakdown: duRes.data,
        };
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setMonth(state, action: PayloadAction<string>) {
            state.month = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.statsCards = action.payload.statsCards;
                state.attendanceTrend = action.payload.attendanceTrend;
                state.wfhWfoSplit = action.payload.wfhWfoSplit;
                state.duBreakdown = action.payload.duBreakdown;
            })
            .addCase(fetchDashboardData.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setMonth } = dashboardSlice.actions;
export default dashboardSlice.reducer;
