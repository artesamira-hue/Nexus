import { type Props, DAY_HEADERS, MONTH_NAMES, STATUS_CLASS, LEGEND } from "../constants/calendar";

const Calendar = ({
    year = 2026,
    month = 5,
    dayStatuses = {},
    today = 11,
    onDayClick,
    onPrevMonth,
    onNextMonth,
    canGoPrev = true,
    canGoNext = true,
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

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                {canGoPrev && (
                    <button className="calendar-nav-btn" onClick={onPrevMonth}>‹</button>
                )}
                <span className="calendar-month-title">
                    {MONTH_NAMES[month]} {year}
                </span>
                {canGoNext && (
                    <button className="calendar-nav-btn" onClick={onNextMonth}>›</button>
                )}
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
                    const isClickable = cls === "present";
                    return (
                        <div
                            key={day}
                            className={`calendar-day${cls ? ` ${cls}` : ""}${isToday ? " today" : ""}${isClickable ? " clickable" : ""}`}
                            onClick={isClickable ? () => onDayClick?.(day) : undefined}
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
