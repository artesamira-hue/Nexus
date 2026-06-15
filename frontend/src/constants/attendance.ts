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
    nonWorkingHours?: string;
    totalSession?: string;
    officeLocation?: string;
    systemTrackedLocation?: string;
    lastUpdated?: string;
}