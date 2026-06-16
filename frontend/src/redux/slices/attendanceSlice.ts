import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getAttendanceRecords, getAttendanceSummary, type AttendanceSummary } from "../../api/attendanceApi";
import { type AttendanceRecord } from "../../constants/attendance";
import { DEFAULT_MONTH } from "../../constants";

interface AttendanceState {
    selectedMonth: string;
    records: AttendanceRecord[];
    summary: AttendanceSummary | null;
    loading: boolean;
}

const initialState: AttendanceState = {
    selectedMonth: DEFAULT_MONTH,
    records: [],
    summary: null,
    loading: false,
};

export const fetchAttendanceData = createAsyncThunk(
    "attendance/fetchAll",
    async (month: string) => {
        const [recordsRes, summaryRes] = await Promise.all([
            getAttendanceRecords(month),
            getAttendanceSummary(month),
        ]);
        return {
            records: recordsRes.data,
            summary: summaryRes.data,
        };
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        setSelectedMonth(state, action: PayloadAction<string>) {
            state.selectedMonth = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendanceData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttendanceData.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload.records;
                state.summary = action.payload.summary;
            })
            .addCase(fetchAttendanceData.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setSelectedMonth } = attendanceSlice.actions;
export default attendanceSlice.reducer;
