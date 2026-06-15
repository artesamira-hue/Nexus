import { type AttendanceStatus, type AttendanceRecord } from "../constants/attendance";

export type Props = {
    year?: number;
    month?: number;
    dayStatuses?: Record<number, AttendanceStatus>;
    today?: number;
    onDayClick?: (day: number) => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    canGoPrev?: boolean;
    canGoNext?: boolean;
};

export const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const STATUS_CLASS: Record<string, string> = {
    present: "present",
    absent: "absent",
    leave: "leave",
    "week off": "week-off",
    holiday: "holiday",
};

export const LEGEND = [
    { cls: "present", label: "Present" },
    { cls: "absent", label: "Absent" },
    { cls: "leave", label: "Leave" },
    { cls: "week-off", label: "Week Off" },
    { cls: "holiday", label: "Holiday" },
];

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const TYPE_LABELS: Record<string, string> = {
    WFH: "Work From Home",
    WFO: "Work From Office",
};

export type DayDetailProps = {
    record: AttendanceRecord;
    year: number;
    month: number;
    day: number;
    onClose: () => void;
};