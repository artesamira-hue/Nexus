import "../style/attendance.css";
import { attendanceData } from "../data/attendanceMockData";
import { type AttendanceRecord, type AttendanceStatus } from "../constants/attendance";
import { type User } from "../constants";
import StatsCard from "../components/StatsCard";
import Calendar from "../components/Calendar";
import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

type Props = {
    user: User;
    onLogout: () => void;
};

const AttendancePage = ({ user, onLogout }: Props) => {
    const dayStatuses: Record<number, AttendanceStatus> = {};
    attendanceData.forEach((record) => {
        const day = parseInt(record.date.split("-")[0]);
        dayStatuses[day] = record.status;
    });

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

    return (
        <div className="app-layout">
            <Sidebar />

            {/* Main area */}
            <div className="main-area">
                <Header user={user} onLogout={onLogout} title="My Attendance" />

                {/* Page content */}
                <div className="page-content">
                    <p className="page-subtitle">
                        Attendance summary and daily records (All Metrics are calculated by Days)
                    </p>

                    <div className="stats">
                        <StatsCard title="Working Days" value={22} subtitle="Jun 2026" color="blue" />
                        <StatsCard title="Present Days" value={6} subtitle="85.7%" color="green" />
                        <StatsCard title="Absent Days" value={1} subtitle="14.3%" color="red" />
                        <StatsCard title="Leave Days" value={2} subtitle="This Month" color="orange" />
                        <StatsCard title="Avg Working Hrs / Day" value={9.7} subtitle="This Month" color="purple" />
                    </div>

                    <div className="content">
                        <Calendar dayStatuses={dayStatuses} />

                        <div className="table-wrapper">
                            <p className="table-title">Day-wise Records</p>
                            <Table
                                columns={attendanceColumns}
                                data={attendanceData as unknown as Record<string, unknown>[]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
