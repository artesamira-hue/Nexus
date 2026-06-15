import api from "./api";
import type { AttendanceRecord } from "../constants/attendance";

export type AttendanceSummary = {
    workingDays: number;
    presentDays: number;
    presentPct: string;
    absentDays: number;
    absentPct: string;
    leaveDays: number;
    avgWorkingHours: number;
    month: string;
};

export const getAttendanceRecords = (month?: string, year?: number) =>
    api.get<AttendanceRecord[]>("/attendance/records", { params: { month, year } });

export const getAttendanceSummary = (month?: string, year?: number) =>
    api.get<AttendanceSummary>("/attendance/summary", { params: { month, year } });
