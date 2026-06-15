import "./style/login.css";
import { useEffect, useState } from "react";
import { getProfile } from "./api/authApi";
import { type User, type Page } from "./constants";
import Login from "./pages/Login";
import AttendancePage from "./pages/AttendancePage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => localStorage.getItem("token") !== null);
  const [activePage, setActivePage] = useState<Page>("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (activePage === "attendance") {
    return <AttendancePage user={user} onLogout={handleLogout} onNavigate={setActivePage} />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} onNavigate={setActivePage} />;
}

export default App;