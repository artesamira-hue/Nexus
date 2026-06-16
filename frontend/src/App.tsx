import "./style/login.css";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AttendancePage from "./pages/AttendancePage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const { user, loading, activePage } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  if (activePage === "attendance") {
    return <AttendancePage />;
  }

  return <DashboardPage />;
}

export default App;
