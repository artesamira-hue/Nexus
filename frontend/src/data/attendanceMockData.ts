// data/mockData.ts

import { type AttendanceRecord } from "../constants/attendance";

export const attendanceData: AttendanceRecord[] = [
    {
        date: "11-06-2026",
        firstActivity: "11-06-2026 12:15",
        lastActivity: "11-06-2026 13:50",
        workingHours: "1h 30m",
        type: "WFH",
        status: "Absent",
    },
    {
        date: "10-06-2026",
        firstActivity: "10-06-2026 09:44",
        lastActivity: "10-06-2026 18:40",
        workingHours: "8h 55m",
        type: "WFH",
        status: "Present",
    },
    {
        date: "09-06-2026",
        firstActivity: "09-06-2026 09:30",
        lastActivity: "09-06-2026 18:45",
        workingHours: "9h 15m",
        type: "WFH",
        status: "Present",
    },
    {
        date: "08-06-2026",
        firstActivity: "08-06-2026 09:15",
        lastActivity: "08-06-2026 18:30",
        workingHours: "9h 15m",
        type: "WFO",
        status: "Present",
    },
    {
        date: "05-06-2026",
        firstActivity: "05-06-2026 09:00",
        lastActivity: "05-06-2026 18:00",
        workingHours: "9h 00m",
        type: "WFO",
        status: "Present",
    },
    {
        date: "04-06-2026",
        firstActivity: "04-06-2026 09:30",
        lastActivity: "04-06-2026 19:00",
        workingHours: "9h 30m",
        type: "WFO",
        status: "Present",
    },
    {
        date: "03-06-2026",
        firstActivity: "03-06-2026 09:45",
        lastActivity: "03-06-2026 18:45",
        workingHours: "9h 00m",
        type: "WFH",
        status: "Present",
    },
    {
        date: "02-06-2026",
        firstActivity: "-",
        lastActivity: "-",
        workingHours: "-",
        type: "WFH",
        status: "Leave",
    },
    {
        date: "01-06-2026",
        firstActivity: "-",
        lastActivity: "-",
        workingHours: "-",
        type: "WFH",
        status: "Leave",
    },
];
