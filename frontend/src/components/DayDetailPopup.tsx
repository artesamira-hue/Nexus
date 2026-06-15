import { MONTH_NAMES, DAY_NAMES, TYPE_LABELS, type DayDetailProps } from "../constants/calendar";

function formatActivity(value: string): string {
    if (value === "-") return "-";
    const parts = value.split(" ");
    if (parts.length < 2) return value;
    const [date, time] = parts;
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${date} ${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

const DayDetailPopup = ({ record, year, month, day, onClose }: DayDetailProps) => {
    const dateObj = new Date(year, month, day);
    const dayName = DAY_NAMES[dateObj.getDay()];
    const dateStr = `${MONTH_NAMES[month].slice(0, 3)} ${String(day).padStart(2, "0")}, ${year}`;

    const stats = [
        { value: record.workingHours, label: "Working Hours", valueClass: "popup-stat-value green" },
        { value: record.nonWorkingHours ?? "0h", label: "Non-Working", valueClass: "popup-stat-value" },
        { value: record.totalSession ?? record.workingHours, label: "Total Session", valueClass: "popup-stat-value" },
    ];

    const details = [
        { label: "1st Activity", valueNode: <span className="popup-detail-value">{formatActivity(record.firstActivity)}</span> },
        { label: "Last Activity", valueNode: <span className="popup-detail-value">{formatActivity(record.lastActivity)}</span> },
        { label: "Status", valueNode: <span className={`popup-status-badge ${record.status.toLowerCase().replace(" ", "-")}`}>{record.status}</span> },
        { label: "Type", valueNode: <span className="popup-type-badge">{TYPE_LABELS[record.type] ?? record.type}</span> },
        { label: "Office Location", valueNode: <span className="popup-detail-value">{record.officeLocation ?? "—"}</span> },
        { label: "System Tracked Location (Beta)", valueNode: <span className="popup-detail-value">{record.systemTrackedLocation ?? "—"}</span> },
        { label: "Last Updated", valueNode: <span className="popup-detail-value">{record.lastUpdated ?? "—"}</span>, rowClass: "border-none" },
    ];

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-panel" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <div>
                        <p className="popup-date-title">{dateStr}</p>
                        <p className="popup-day-name">{dayName}</p>
                    </div>
                    <button className="popup-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="popup-stats-row">
                    {stats.map(({ value, label, valueClass }) => (
                        <div key={label} className="popup-stat-box">
                            <p className={valueClass}>{value}</p>
                            <p className="popup-stat-label">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="popup-details">
                    {details.map(({ label, valueNode, rowClass }) => (
                        <div key={label} className={`popup-detail-row${rowClass ? ` ${rowClass}` : ""}`}>
                            <span className="popup-detail-label">{label}</span>
                            {valueNode}
                        </div>
                    ))}
                </div>

                <div className="popup-actions">
                    <button className="popup-btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default DayDetailPopup;
