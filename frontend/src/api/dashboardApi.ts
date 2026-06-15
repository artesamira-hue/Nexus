import api from "./api";

export type DashboardStatCard = {
    title: string;
    value: string;
    color: "blue" | "green" | "red" | "orange" | "dark";
    subtitle?: string;
    subtitleUp?: string;
    subtitleDown?: string;
    subtitleText?: string;
};

export type AttendanceTrendPoint = {
    day: string;
    present: number;
    absent: number;
};

export type WfhWfoSplitPoint = {
    dept: string;
    wfh: number;
    wfo: number;
};

export type DuBreakdownRow = {
    name: string;
    headcount: number;
    present: number;
    absent: number;
    onLeave: number;
    attendance: number;
    avgHours: number;
    wfo: number;
};

export const getDashboardStats = (month?: string) =>
    api.get<DashboardStatCard[]>("/dashboard/stats", { params: { month } });

export const getAttendanceTrend = (month?: string) =>
    api.get<AttendanceTrendPoint[]>("/dashboard/attendance-trend", { params: { month } });

export const getWfhWfoSplit = (month?: string) =>
    api.get<WfhWfoSplitPoint[]>("/dashboard/wfh-wfo-split", { params: { month } });

export const getDuBreakdown = (month?: string) =>
    api.get<DuBreakdownRow[]>("/dashboard/du-breakdown", { params: { month } });
