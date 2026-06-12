// types/attendance.ts

export type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Leave"
    | "Week Off"
    | "Holiday";

export interface AttendanceRecord {
    date: string;
    firstActivity: string;
    lastActivity: string;
    workingHours: string;
    type: "WFH" | "WFO";
    status: AttendanceStatus;
}