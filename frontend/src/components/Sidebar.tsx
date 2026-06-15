import { useState } from "react";
import { type Page } from "../constants";

type Props = {
    role: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
};

const Sidebar = ({ role, activePage, onNavigate }: Props) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="prism-logo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="prism-logo-text">NEXUS</span>
            </div>

            <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>‹</button>

            <div className="sidebar-section">
                <p className="sidebar-section-label">OVERVIEW</p>

                {role === "management" && (
                    <div
                        className={`sidebar-nav-item${activePage === "dashboard" ? " active" : ""}`}
                        onClick={() => onNavigate("dashboard")}
                    >
                        <div className="nav-icon-wrap">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </div>
                        <span>Dashboard</span>
                    </div>
                )}

                <div
                    className={`sidebar-nav-item${activePage === "attendance" ? " active" : ""}`}
                    onClick={() => onNavigate("attendance")}
                >
                    <div className="nav-icon-wrap">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <span>My Attendance</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
