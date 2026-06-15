import "../style/attendance.css";
import "../style/dashboard.css";
import { useState, useEffect } from "react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import { type User, type Page, MONTH_OPTIONS, DEFAULT_MONTH } from "../constants";
import { useLoading } from "../hooks/useLoading";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import Table from "../components/Table";
import {
    getDashboardStats, getAttendanceTrend, getWfhWfoSplit, getDuBreakdown,
    type DashboardStatCard, type AttendanceTrendPoint, type WfhWfoSplitPoint, type DuBreakdownRow,
} from "../api/dashboardApi";

type Props = {
    user: User;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
};

const attendanceColor = (pct: number) => {
    if (pct >= 85) return "";
    if (pct >= 75) return "warn";
    return "danger";
};

const DashboardPage = ({ user, onLogout, onNavigate }: Props) => {
    const [month, setMonth] = useState(DEFAULT_MONTH);
    const [statsCards, setStatsCards] = useState<DashboardStatCard[]>([]);
    const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrendPoint[]>([]);
    const [wfhWfoSplit, setWfhWfoSplit] = useState<WfhWfoSplitPoint[]>([]);
    const [duBreakdown, setDuBreakdown] = useState<DuBreakdownRow[]>([]);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [statsRes, trendRes, splitRes, duRes] = await Promise.all([
                    getDashboardStats(month),
                    getAttendanceTrend(month),
                    getWfhWfoSplit(month),
                    getDuBreakdown(month),
                ]);
                setStatsCards(statsRes.data);
                setAttendanceTrend(trendRes.data);
                setWfhWfoSplit(splitRes.data);
                setDuBreakdown(duRes.data);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [month]);

    return (
        <div className="app-layout">
            <Sidebar role={user.role} activePage="dashboard" onNavigate={onNavigate} />

            <div className="main-area">
                <Header user={user} onLogout={onLogout} title="Executive Dashboard" />

                <div className="page-content">

                    {/* Title row + filters */}
                    <div className="dash-title-row">
                        <div>
                            <h2 className="dash-heading">Executive Dashboard</h2>
                            <p className="dash-sub">Organisation-wide attendance overview</p>
                        </div>
                        <div className="dash-filters">
                            <select
                                className="dash-filter-select"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {MONTH_OPTIONS.map((m) => (
                                    <option key={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="dash-loading">Loading…</div>
                    ) : (
                        <>
                            {/* Stats cards */}
                            <div className="dash-stats">
                                {statsCards.map((card) => (
                                    <StatsCard
                                        key={card.title}
                                        title={card.title}
                                        value={card.value}
                                        color={card.color}
                                        subtitle={
                                            card.subtitleUp
                                                ? <><span className="up">{card.subtitleUp}</span> {card.subtitleText}</>
                                                : card.subtitleDown
                                                    ? <><span className="down">{card.subtitleDown}</span> {card.subtitleText}</>
                                                    : card.subtitle!
                                        }
                                    />
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="dash-charts">

                                {/* Daily Attendance Trend */}
                                <div className="dash-chart-card">
                                    <p className="dash-chart-title">Daily Attendance Trend — {month}</p>
                                    <div className="dash-chart-legend">
                                        <div className="dash-legend-item">
                                            <div className="dash-legend-dot" style={{ background: "#22c55e" }} />
                                            Present %
                                        </div>
                                        <div className="dash-legend-item">
                                            <div className="dash-legend-dot" style={{ background: "#ef4444" }} />
                                            Absent %
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={attendanceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                                                </linearGradient>
                                                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={(val, name) => [`${val}%`, name === "present" ? "Present %" : "Absent %"]} />
                                            <Area type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} fill="url(#presentGrad)" dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                            <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fill="url(#absentGrad)" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* WFH vs WFO Split */}
                                <div className="dash-chart-card">
                                    <p className="dash-chart-title">WFH vs WFO Split — {month}</p>
                                    <div className="dash-chart-legend">
                                        <div className="dash-legend-item">
                                            <div className="dash-legend-dot" style={{ background: "#93c5fd" }} />
                                            WFH
                                        </div>
                                        <div className="dash-legend-item">
                                            <div className="dash-legend-dot" style={{ background: "#86efac" }} />
                                            WFO
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={wfhWfoSplit} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                            <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={(val, name) => [`${val}%`, name === "wfh" ? "WFH" : "WFO"]} />
                                            <Legend wrapperStyle={{ display: "none" }} />
                                            <Bar dataKey="wfh" stackId="a" fill="#93c5fd" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="wfo" stackId="a" fill="#86efac" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* DU-Level Breakdown */}
                            <div className="dash-table-card">
                                <div className="dash-table-header">
                                    <p className="dash-table-header-title">DU-Level Breakdown</p>
                                </div>
                                <Table
                                    data={duBreakdown}
                                    columns={[
                                        { header: "Delivery Unit", accessor: "name" },
                                        { header: "Headcount", accessor: "headcount" },
                                        { header: "Present", accessor: "present" },
                                        { header: "Absent", accessor: "absent" },
                                        { header: "On Leave", accessor: "onLeave" },
                                        {
                                            header: "Attendance %",
                                            accessor: "attendance",
                                            render: (_val, row) => (
                                                <div className="dash-progress-cell">
                                                    <div className="dash-progress-bar">
                                                        <div
                                                            className={`dash-progress-fill ${attendanceColor(row.attendance)}`}
                                                            style={{ width: `${row.attendance}%` }}
                                                        />
                                                    </div>
                                                    <span className="dash-progress-pct">{row.attendance}%</span>
                                                </div>
                                            ),
                                        },
                                        { header: "Avg Hours", accessor: "avgHours", render: (_val, row) => `${row.avgHours}h` },
                                        { header: "WFO %", accessor: "wfo", render: (_val, row) => `${row.wfo}%` },
                                    ]}
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
