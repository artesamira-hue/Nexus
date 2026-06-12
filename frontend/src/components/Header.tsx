import "../style/header.css";
import { type User } from "../constants";

type Props = {
    user: User;
    onLogout: () => void;
    title?: string;
};

const Header = ({ user, onLogout, title }: Props) => {
    const initials = user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="top-header">
            {title && <h1 className="header-title">{title}</h1>}
            <div className="header-user">
                <div className="user-avatar">{initials}</div>
                <span className="user-name">{user.username}</span>
                <button className="user-menu-btn" onClick={onLogout} title="Sign out">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
