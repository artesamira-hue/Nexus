import "../style/attendance.css";
import { useState, useEffect } from "react";
import { type AttendanceRecord, type AttendanceStatus } from "../constants/attendance";
import { type User, type Page, CURRENT_YEAR, CURRENT_MONTH, TODAY, MONTH_OPTIONS, DEFAULT_MONTH } from "../constants";
import { useLoading } from "../hooks/useLoading";
import StatsCard from "../components/StatsCard";
import Calendar from "../components/Calendar";
import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DayDetailPopup from "../components/DayDetailPopup";
import { getAttendanceRecords, getAttendanceSummary, type AttendanceSummary } from "../api/attendanceApi";

function parseMonthStr(s: string) {
    const [mon, yr] = s.split(" ");
    return {
        year: parseInt(yr),
        monthIndex: new Date(`${mon} 1 ${yr}`).getMonth(),
    };
}

type Props = {
    user: User;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
};

const attendanceColumns = [
    { header: "Date", accessor: "date" },
    { header: "1st Activity", accessor: "firstActivity" },
    { header: "Last Activity", accessor: "lastActivity" },
    { header: "Wkg Hrs", accessor: "workingHours" },
    {
        header: "Type",
        accessor: "type",
        render: (value: unknown) => (
            <span className={`type-badge ${String(value).toLowerCase()}`}>
                {String(value)}
            </span>
        ),
    },
    {
        header: "Status",
        accessor: "status",
        render: (value: unknown) => (
            <span className={`status ${String(value).toLowerCase()}`}>
                {String(value)}
            </span>
        ),
    },
] satisfies {
    header: string;
    accessor: keyof AttendanceRecord;
    render?: (value: unknown, row: AttendanceRecord) => React.ReactNode;
}[];

const AttendancePage = ({ user, onLogout, onNavigate }: Props) => {
    const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const { loading, setLoading } = useLoading();

    const { year: calYear, monthIndex: calMonth } = parseMonthStr(selectedMonth);
    const calToday = calYear === CURRENT_YEAR && calMonth === CURRENT_MONTH ? TODAY : -1;

    const currentMonthIdx = MONTH_OPTIONS.indexOf(selectedMonth);
    const canGoPrev = currentMonthIdx > 0;
    const canGoNext = currentMonthIdx < MONTH_OPTIONS.length - 1;
    const handlePrevMonth = () => canGoPrev && setSelectedMonth(MONTH_OPTIONS[currentMonthIdx - 1]);
    const handleNextMonth = () => canGoNext && setSelectedMonth(MONTH_OPTIONS[currentMonthIdx + 1]);

    useEffect(() => {
        setSelectedDay(null);
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [recordsRes, summaryRes] = await Promise.all([
                    getAttendanceRecords(selectedMonth),
                    getAttendanceSummary(selectedMonth),
                ]);
                setRecords(recordsRes.data);
                setSummary(summaryRes.data);
            } catch (err) {
                console.error("Failed to load attendance data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [selectedMonth]);

    const dayStatuses: Record<number, AttendanceStatus> = {};
    const recordsByDay: Record<number, AttendanceRecord> = {};
    records.forEach((record) => {
        const day = parseInt(record.date.split("-")[0]);
        dayStatuses[day] = record.status;
        recordsByDay[day] = record;
    });

    return (
        <div className="app-layout">
            <Sidebar role={user.role} activePage="attendance" onNavigate={onNavigate} />

            <div className="main-area">
                <Header user={user} onLogout={onLogout} title="My Attendance" />

                <div className="page-content">
                    <div className="dash-title-row">
                        <p className="page-subtitle">
                            Attendance summary and daily records (All Metrics are calculated by Days)
                        </p>
                    </div>

                    {loading ? (
                        <div className="dash-loading">Loading…</div>
                    ) : (
                        <>
                            <div className="stats">
                                <StatsCard title="Working Days" value={summary?.workingDays ?? 0} subtitle={summary?.month ?? ""} color="blue" />
                                <StatsCard title="Present Days" value={summary?.presentDays ?? 0} subtitle={summary?.presentPct ?? ""} color="green" />
                                <StatsCard title="Absent Days" value={summary?.absentDays ?? 0} subtitle={summary?.absentPct ?? ""} color="red" />
                                <StatsCard title="Leave Days" value={summary?.leaveDays ?? 0} subtitle="This Month" color="orange" />
                                <StatsCard title="Avg Working Hrs / Day" value={summary?.avgWorkingHours ?? 0} subtitle="This Month" color="purple" />
                            </div>

                            <div className="content">
                                <Calendar
                                    year={calYear}
                                    month={calMonth}
                                    today={calToday}
                                    dayStatuses={dayStatuses}
                                    onDayClick={(day) => setSelectedDay(day)}
                                    canGoPrev={canGoPrev}
                                    canGoNext={canGoNext}
                                    onPrevMonth={handlePrevMonth}
                                    onNextMonth={handleNextMonth}
                                />

                                <div className="table-wrapper">
                                    <p className="table-title">Day-wise Records</p>
                                    <Table
                                        scroll
                                        columns={attendanceColumns}
                                        data={records as unknown as Record<string, unknown>[]}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedDay !== null && recordsByDay[selectedDay] && (
                <DayDetailPopup
                    record={recordsByDay[selectedDay]}
                    year={calYear}
                    month={calMonth}
                    day={selectedDay}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
};

export default AttendancePage;
