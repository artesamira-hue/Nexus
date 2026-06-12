import { type AttendanceStatus } from "../constants/attendance";

type Props = {
    year?: number;
    month?: number;
    dayStatuses?: Record<number, AttendanceStatus>;
    today?: number;
};

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const STATUS_CLASS: Record<string, string> = {
    present: "present",
    absent: "absent",
    leave: "leave",
    "week off": "week-off",
    holiday: "holiday",
};

const Calendar = ({
    year = 2026,
    month = 5,
    dayStatuses = {},
    today = 11,
}: Props) => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = (firstDayOfWeek + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const getDayClass = (day: number): string => {
        const dow = new Date(year, month, day).getDay();
        if (dow === 0 || dow === 6) return "week-off";
        const status = dayStatuses[day];
        if (!status) return "";
        return STATUS_CLASS[status.toLowerCase()] ?? "";
    };

    const LEGEND = [
        { cls: "present", label: "Present" },
        { cls: "absent", label: "Absent" },
        { cls: "leave", label: "Leave" },
        { cls: "week-off", label: "Week Off" },
        { cls: "holiday", label: "Holiday" },
    ];

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <button className="calendar-nav-btn">‹</button>
                <span className="calendar-month-title">
                    {MONTH_NAMES[month]} {year}
                </span>
            </div>

            <div className="calendar-grid">
                {DAY_HEADERS.map((d, i) => (
                    <div key={i} className="calendar-day-header">
                        {d}
                    </div>
                ))}

                {cells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`e-${idx}`} className="calendar-day empty" />;
                    }
                    const cls = getDayClass(day);
                    const isToday = day === today;
                    return (
                        <div
                            key={day}
                            className={`calendar-day${cls ? ` ${cls}` : ""}${isToday ? " today" : ""}`}
                        >
                            <span className="day-number">{day}</span>
                            {cls && <span className="day-dot" />}
                        </div>
                    );
                })}
            </div>

            <div className="calendar-legend">
                {LEGEND.map(({ cls, label }) => (
                    <div key={cls} className="legend-item">
                        <div className={`legend-color ${cls}`} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
