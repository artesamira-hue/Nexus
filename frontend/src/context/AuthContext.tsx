import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProfile } from "../api/authApi";
import { type User, type Page } from "../constants";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    activePage: Page;
    setActivePage: (page: Page) => void;
    handleLogin: (user: User) => void;
    handleLogout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(() => localStorage.getItem("token") !== null);
    const [activePage, setActivePage] = useState<Page>("dashboard");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        getProfile()
            .then((res) => {
                const fetchedUser: User = res.data.user;
                setUser(fetchedUser);
                setActivePage(fetchedUser.role === "management" ? "dashboard" : "attendance");
            })
            .catch(() => {
                localStorage.removeItem("token");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const handleLogin = (loggedInUser: User) => {
        setActivePage(loggedInUser.role === "management" ? "dashboard" : "attendance");
        setUser(loggedInUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, activePage, setActivePage, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
