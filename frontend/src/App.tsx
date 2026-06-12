import "./style/login.css";
import { useEffect, useState } from "react";
import { getProfile } from "./api/authApi";
import { type User } from "./constants";
import Login from "./pages/Login";
import AttendancePage from "./pages/AttendancePage";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => localStorage.getItem("token") !== null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    getProfile()
      .then((res) => {
        setUser(res.data.user);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 👇 ROLE CHECK HERE
  if (user.role === "employee") {
    return <AttendancePage user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="dashboard">
      <h2>Welcome {user.username} 👋</h2>
      <h3>Role: {user.role}</h3>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default App;