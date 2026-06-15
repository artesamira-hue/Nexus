const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { getDb } = require("./db/init");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

const users = [
    { username: "samira",  role: "employee"   },
    { username: "jasmine", role: "management" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

// Accepts "Jun 2026" → { month: "Jun", year: 2026 }
// Falls back to current month/year when not supplied.
function parseMonthParam(raw) {
    if (raw && /^[A-Za-z]+ \d{4}$/.test(raw.trim())) {
        const [month, year] = raw.trim().split(" ");
        return { month, year: parseInt(year, 10) };
    }
    const now = new Date();
    return {
        month: now.toLocaleString("en-US", { month: "short" }),
        year: now.getFullYear(),
    };
}

// ── Auth middleware ────────────────────────────────────────────────────────────

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(403);
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ── Auth routes ────────────────────────────────────────────────────────────────

app.post("/login", (req, res) => {
    const { username } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: "User not found" });
    const token = jwt.sign(user, SECRET, { expiresIn: "1h" });
    res.json({ token });
});

app.get("/profile", verifyToken, (req, res) => {
    res.json({ user: req.user });
});

// ── Dashboard routes ───────────────────────────────────────────────────────────

app.get("/dashboard/stats", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const db = await getDb();
    const rows = await db.all(
        `SELECT title, value, color, subtitle, subtitle_up, subtitle_down, subtitle_text
         FROM dashboard_stats WHERE month = ? AND year = ?`,
        month, year
    );
    res.json(rows.map(r => ({
        title: r.title,
        value: r.value,
        color: r.color,
        ...(r.subtitle      && { subtitle:     r.subtitle      }),
        ...(r.subtitle_up   && { subtitleUp:   r.subtitle_up   }),
        ...(r.subtitle_down && { subtitleDown: r.subtitle_down }),
        ...(r.subtitle_text && { subtitleText: r.subtitle_text }),
    })));
});

app.get("/dashboard/attendance-trend", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const db = await getDb();
    const rows = await db.all(
        "SELECT day, present, absent FROM attendance_trend WHERE month = ? AND year = ? ORDER BY CAST(day AS INTEGER)",
        month, year
    );
    res.json(rows);
});

app.get("/dashboard/wfh-wfo-split", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const db = await getDb();
    const rows = await db.all(
        "SELECT dept, wfh, wfo FROM wfh_wfo_split WHERE month = ? AND year = ?",
        month, year
    );
    res.json(rows);
});

app.get("/dashboard/du-breakdown", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const db = await getDb();
    const rows = await db.all(
        `SELECT name, headcount, present, absent, on_leave AS onLeave,
                attendance, avg_hours AS avgHours, wfo
         FROM du_breakdown WHERE month = ? AND year = ?`,
        month, year
    );
    res.json(rows);
});

// ── Attendance routes ──────────────────────────────────────────────────────────

app.get("/attendance/records", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const username = req.user.username;
    const db = await getDb();
    const rows = await db.all(
        `SELECT date, first_activity AS firstActivity, last_activity AS lastActivity,
                working_hours AS workingHours, type, status,
                non_working_hours AS nonWorkingHours, total_session AS totalSession,
                office_location AS officeLocation,
                system_tracked_location AS systemTrackedLocation,
                last_updated AS lastUpdated
         FROM attendance_records
         WHERE username = ? AND month = ? AND year = ?
         ORDER BY date DESC`,
        username, month, year
    );
    // strip null fields so the shape matches AttendanceRecord
    res.json(rows.map(r => Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null))));
});

app.get("/attendance/summary", verifyToken, async (req, res) => {
    const { month, year } = parseMonthParam(req.query.month);
    const username = req.user.username;
    const db = await getDb();
    const row = await db.get(
        `SELECT working_days AS workingDays, present_days AS presentDays,
                present_pct AS presentPct, absent_days AS absentDays,
                absent_pct AS absentPct, leave_days AS leaveDays,
                avg_working_hours AS avgWorkingHours
         FROM attendance_summary
         WHERE username = ? AND month = ? AND year = ?`,
        username, month, year
    );
    if (!row) return res.status(404).json({ message: "No summary found" });
    res.json({ ...row, month: `${month} ${year}` });
});

// ── Start ──────────────────────────────────────────────────────────────────────

getDb()
    .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
    .catch(err => { console.error("DB init failed:", err); process.exit(1); });
