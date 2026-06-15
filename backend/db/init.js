const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let _db = null;

async function getDb() {
    if (_db) return _db;

    _db = await open({
        filename: path.join(__dirname, "nexus.db"),
        driver: sqlite3.Database,
    });

    await _db.exec("PRAGMA journal_mode = WAL");
    await createTables(_db);
    await seed(_db);

    return _db;
}

async function createTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS dashboard_stats (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            month         TEXT    NOT NULL,
            year          INTEGER NOT NULL,
            title         TEXT    NOT NULL,
            value         TEXT    NOT NULL,
            color         TEXT    NOT NULL,
            subtitle      TEXT,
            subtitle_up   TEXT,
            subtitle_down TEXT,
            subtitle_text TEXT,
            UNIQUE(month, year, title)
        );

        CREATE TABLE IF NOT EXISTS attendance_trend (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            month   TEXT    NOT NULL,
            year    INTEGER NOT NULL,
            day     TEXT    NOT NULL,
            present INTEGER NOT NULL,
            absent  INTEGER NOT NULL,
            UNIQUE(month, year, day)
        );

        CREATE TABLE IF NOT EXISTS wfh_wfo_split (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT    NOT NULL,
            year  INTEGER NOT NULL,
            dept  TEXT    NOT NULL,
            wfh   INTEGER NOT NULL,
            wfo   INTEGER NOT NULL,
            UNIQUE(month, year, dept)
        );

        CREATE TABLE IF NOT EXISTS du_breakdown (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            month      TEXT    NOT NULL,
            year       INTEGER NOT NULL,
            name       TEXT    NOT NULL,
            headcount  INTEGER NOT NULL,
            present    INTEGER NOT NULL,
            absent     INTEGER NOT NULL,
            on_leave   INTEGER NOT NULL,
            attendance INTEGER NOT NULL,
            avg_hours  REAL    NOT NULL,
            wfo        INTEGER NOT NULL,
            UNIQUE(month, year, name)
        );

        CREATE TABLE IF NOT EXISTS attendance_records (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            username                TEXT NOT NULL,
            month                   TEXT NOT NULL,
            year                    INTEGER NOT NULL,
            date                    TEXT NOT NULL,
            first_activity          TEXT NOT NULL,
            last_activity           TEXT NOT NULL,
            working_hours           TEXT NOT NULL,
            type                    TEXT NOT NULL,
            status                  TEXT NOT NULL,
            non_working_hours       TEXT,
            total_session           TEXT,
            office_location         TEXT,
            system_tracked_location TEXT,
            last_updated            TEXT,
            UNIQUE(username, date)
        );

        CREATE TABLE IF NOT EXISTS attendance_summary (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            username          TEXT NOT NULL,
            month             TEXT NOT NULL,
            year              INTEGER NOT NULL,
            working_days      INTEGER NOT NULL,
            present_days      INTEGER NOT NULL,
            present_pct       TEXT    NOT NULL,
            absent_days       INTEGER NOT NULL,
            absent_pct        TEXT    NOT NULL,
            leave_days        INTEGER NOT NULL,
            avg_working_hours REAL    NOT NULL,
            UNIQUE(username, month, year)
        );
    `);
}

async function seed(db) {
    await db.run("BEGIN");
    try {

        // ── Jun 2026: dashboard_stats ────────────────────────────────────────────────
        for (const row of [
            ["Jun", 2026, "Headcount",       "700", "blue",   "Active employees", null,     null,     null            ],
            ["Jun", 2026, "Attendance %",    "84%", "green",  null,               "↑ 2.1%", null,     "vs last month" ],
            ["Jun", 2026, "Absenteeism %",   "9%",  "red",    null,               null,     "↓ 0.8%", "vs last month" ],
            ["Jun", 2026, "On Leave",        "48",  "orange", "Today",            null,     null,     null            ],
            ["Jun", 2026, "Avg Working Hrs", "7.2", "dark",   "Across org",       null,     null,     null            ],
            ["Jun", 2026, "WFO %",           "38%", "dark",   "WFH: 62%",         null,     null,     null            ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO dashboard_stats (month, year, title, value, color, subtitle, subtitle_up, subtitle_down, subtitle_text)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        // ── Jun 2026: attendance_trend — working days 1–12 only (Jun 13/14 are weekend) ──
        for (const row of [
            ["Jun", 2026, "1",  86, 11],
            ["Jun", 2026, "2",  84, 13],
            ["Jun", 2026, "3",  88,  9],
            ["Jun", 2026, "4",  82, 14],
            ["Jun", 2026, "5",  85, 12],
            ["Jun", 2026, "8",  87, 10],
            ["Jun", 2026, "9",  83, 13],
            ["Jun", 2026, "10", 86, 11],
            ["Jun", 2026, "11", 84, 12],
            ["Jun", 2026, "12", 88,  9],
        ]) {
            await db.run(
                "INSERT OR IGNORE INTO attendance_trend (month, year, day, present, absent) VALUES (?, ?, ?, ?, ?)",
                ...row
            );
        }

        // ── Jun 2026: wfh_wfo_split ──────────────────────────────────────────────────
        for (const row of [
            ["Jun", 2026, "Cloud Infra",      58, 42],
            ["Jun", 2026, "Data & Analytics", 65, 35],
            ["Jun", 2026, "Digital",          49, 51],
            ["Jun", 2026, "Enterprise",       72, 28],
            ["Jun", 2026, "Finance",          60, 40],
        ]) {
            await db.run(
                "INSERT OR IGNORE INTO wfh_wfo_split (month, year, dept, wfh, wfo) VALUES (?, ?, ?, ?, ?)",
                ...row
            );
        }

        // ── Jun 2026: du_breakdown ───────────────────────────────────────────────────
        for (const row of [
            ["Jun", 2026, "Cloud Infrastructure", 24, 19, 3, 2, 79, 7.1, 42],
            ["Jun", 2026, "Data & Analytics",     31, 27, 2, 2, 87, 7.4, 35],
            ["Jun", 2026, "Digital Solutions",    45, 36, 6, 3, 80, 6.8, 51],
            ["Jun", 2026, "Enterprise Platforms", 38, 32, 4, 2, 84, 7.3, 28],
            ["Jun", 2026, "Finance",              28, 22, 3, 3, 79, 7.0, 38],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO du_breakdown (month, year, name, headcount, present, absent, on_leave, attendance, avg_hours, wfo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        // ── Jun 2026: samira attendance_records — 10 working days (1–12) ────────────
        // present: 7 (3,4,5,8,9,10,12)  absent: 1 (11)  leave: 2 (1,2)
        for (const row of [
            ["samira", "Jun", 2026, "01-06-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,             null,                  null          ],
            ["samira", "Jun", 2026, "02-06-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,             null,                  null          ],
            ["samira", "Jun", 2026, "03-06-2026", "03-06-2026 09:14", "03-06-2026 19:21", "10h 7m", "WFH", "Present", "0h", "10h 7m", "India – Mumbai", "Pune, Maharashtra",   "4 Jun 2026"  ],
            ["samira", "Jun", 2026, "04-06-2026", "04-06-2026 09:30", "04-06-2026 19:00", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Mumbai", "Mumbai, Maharashtra", "5 Jun 2026"  ],
            ["samira", "Jun", 2026, "05-06-2026", "05-06-2026 09:00", "05-06-2026 18:00", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Mumbai", "Mumbai, Maharashtra", "6 Jun 2026"  ],
            ["samira", "Jun", 2026, "08-06-2026", "08-06-2026 09:15", "08-06-2026 18:30", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Mumbai", "Mumbai, Maharashtra", "9 Jun 2026"  ],
            ["samira", "Jun", 2026, "09-06-2026", "09-06-2026 09:30", "09-06-2026 18:45", "9h 15m", "WFH", "Present", "0h", "9h 15m", "India – Mumbai", "Pune, Maharashtra",   "10 Jun 2026" ],
            ["samira", "Jun", 2026, "10-06-2026", "10-06-2026 09:44", "10-06-2026 18:40", "8h 55m", "WFH", "Present", "0h", "8h 55m", "India – Mumbai", "Pune, Maharashtra",   "11 Jun 2026" ],
            ["samira", "Jun", 2026, "11-06-2026", "11-06-2026 12:15", "11-06-2026 13:50", "1h 30m", "WFH", "Absent",  null, null,     null,             null,                  null          ],
            ["samira", "Jun", 2026, "12-06-2026", "12-06-2026 09:00", "12-06-2026 17:30", "8h 30m", "WFO", "Present", "0h", "8h 30m", "India – Mumbai", "Mumbai, Maharashtra", "13 Jun 2026" ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO attendance_records
                 (username, month, year, date, first_activity, last_activity, working_hours, type, status,
                  non_working_hours, total_session, office_location, system_tracked_location, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        await db.run(
            `INSERT OR IGNORE INTO attendance_summary
             (username, month, year, working_days, present_days, present_pct, absent_days, absent_pct, leave_days, avg_working_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            "samira", "Jun", 2026, 10, 7, "87.5%", 1, "12.5%", 2, 9.2
        );

        // ── Jun 2026: jasmine attendance_records — 10 working days (1–12) ───────────
        // present: 8 (2,3,4,5,9,10,11,12)  absent: 1 (1)  leave: 1 (8)
        for (const row of [
            ["jasmine", "Jun", 2026, "01-06-2026", "-",                "-",                "-",       "WFO", "Absent",  null, null,     null,                null,                  null          ],
            ["jasmine", "Jun", 2026, "02-06-2026", "02-06-2026 09:45", "02-06-2026 17:30", "7h 45m", "WFO", "Present", "0h", "7h 45m", "India – Bangalore", "Bangalore, Karnataka", "3 Jun 2026"  ],
            ["jasmine", "Jun", 2026, "03-06-2026", "03-06-2026 09:20", "03-06-2026 18:45", "9h 25m", "WFH", "Present", "0h", "9h 25m", "India – Bangalore", "Bangalore, Karnataka", "4 Jun 2026"  ],
            ["jasmine", "Jun", 2026, "04-06-2026", "04-06-2026 09:30", "04-06-2026 19:10", "9h 40m", "WFO", "Present", "0h", "9h 40m", "India – Bangalore", "Bangalore, Karnataka", "5 Jun 2026"  ],
            ["jasmine", "Jun", 2026, "05-06-2026", "05-06-2026 08:55", "05-06-2026 18:00", "9h 05m", "WFO", "Present", "0h", "9h 05m", "India – Bangalore", "Bangalore, Karnataka", "6 Jun 2026"  ],
            ["jasmine", "Jun", 2026, "08-06-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,                null,                  null          ],
            ["jasmine", "Jun", 2026, "09-06-2026", "09-06-2026 09:00", "09-06-2026 18:25", "9h 25m", "WFH", "Present", "0h", "9h 25m", "India – Bangalore", "Bangalore, Karnataka", "10 Jun 2026" ],
            ["jasmine", "Jun", 2026, "10-06-2026", "10-06-2026 09:10", "10-06-2026 17:50", "8h 40m", "WFO", "Present", "0h", "8h 40m", "India – Bangalore", "Bangalore, Karnataka", "11 Jun 2026" ],
            ["jasmine", "Jun", 2026, "11-06-2026", "11-06-2026 09:00", "11-06-2026 18:15", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "12 Jun 2026" ],
            ["jasmine", "Jun", 2026, "12-06-2026", "12-06-2026 09:05", "12-06-2026 18:05", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Bangalore", "Bangalore, Karnataka", "13 Jun 2026" ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO attendance_records
                 (username, month, year, date, first_activity, last_activity, working_hours, type, status,
                  non_working_hours, total_session, office_location, system_tracked_location, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        await db.run(
            `INSERT OR IGNORE INTO attendance_summary
             (username, month, year, working_days, present_days, present_pct, absent_days, absent_pct, leave_days, avg_working_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            "jasmine", "Jun", 2026, 10, 8, "88.9%", 1, "11.1%", 1, 9.0
        );

        // ── May 2026: dashboard_stats ────────────────────────────────────────────────
        for (const row of [
            ["May", 2026, "Headcount",       "695", "blue",   "Active employees", null,     null,     null            ],
            ["May", 2026, "Attendance %",    "82%", "green",  null,               "↑ 1.3%", null,     "vs last month" ],
            ["May", 2026, "Absenteeism %",   "9.8%","red",    null,               null,     "↓ 0.4%", "vs last month" ],
            ["May", 2026, "On Leave",        "52",  "orange", "Today",            null,     null,     null            ],
            ["May", 2026, "Avg Working Hrs", "7.0", "dark",   "Across org",       null,     null,     null            ],
            ["May", 2026, "WFO %",           "35%", "dark",   "WFH: 65%",         null,     null,     null            ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO dashboard_stats (month, year, title, value, color, subtitle, subtitle_up, subtitle_down, subtitle_text)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        // ── May 2026: attendance_trend — all 21 working days ────────────────────────
        for (const row of [
            ["May", 2026, "1",  83, 14],
            ["May", 2026, "4",  81, 16],
            ["May", 2026, "5",  85, 12],
            ["May", 2026, "6",  82, 15],
            ["May", 2026, "7",  80, 16],
            ["May", 2026, "8",  84, 13],
            ["May", 2026, "11", 79, 17],
            ["May", 2026, "12", 83, 14],
            ["May", 2026, "13", 86, 11],
            ["May", 2026, "14", 82, 15],
            ["May", 2026, "15", 84, 13],
            ["May", 2026, "18", 80, 15],
            ["May", 2026, "19", 83, 14],
            ["May", 2026, "20", 85, 12],
            ["May", 2026, "21", 81, 15],
            ["May", 2026, "22", 84, 13],
            ["May", 2026, "25", 82, 14],
            ["May", 2026, "26", 80, 16],
            ["May", 2026, "27", 83, 13],
            ["May", 2026, "28", 86, 11],
            ["May", 2026, "29", 84, 13],
        ]) {
            await db.run(
                "INSERT OR IGNORE INTO attendance_trend (month, year, day, present, absent) VALUES (?, ?, ?, ?, ?)",
                ...row
            );
        }

        // ── May 2026: wfh_wfo_split ──────────────────────────────────────────────────
        for (const row of [
            ["May", 2026, "Cloud Infra",      62, 38],
            ["May", 2026, "Data & Analytics", 68, 32],
            ["May", 2026, "Digital",          52, 48],
            ["May", 2026, "Enterprise",       70, 30],
            ["May", 2026, "Finance",          63, 37],
        ]) {
            await db.run(
                "INSERT OR IGNORE INTO wfh_wfo_split (month, year, dept, wfh, wfo) VALUES (?, ?, ?, ?, ?)",
                ...row
            );
        }

        // ── May 2026: du_breakdown ───────────────────────────────────────────────────
        for (const row of [
            ["May", 2026, "Cloud Infrastructure", 24, 18, 4, 2, 75, 6.9, 38],
            ["May", 2026, "Data & Analytics",     31, 26, 3, 2, 84, 7.2, 32],
            ["May", 2026, "Digital Solutions",    45, 34, 8, 3, 76, 6.6, 48],
            ["May", 2026, "Enterprise Platforms", 38, 30, 5, 3, 79, 7.0, 30],
            ["May", 2026, "Finance",              28, 21, 4, 3, 75, 6.8, 37],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO du_breakdown (month, year, name, headcount, present, absent, on_leave, attendance, avg_hours, wfo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        // ── May 2026: samira attendance_records — all 21 working days ───────────────
        // present: 17  absent: 1 (26)  leave: 3 (11,12,20)
        for (const row of [
            ["samira", "May", 2026, "01-05-2026", "01-05-2026 09:30", "01-05-2026 18:30", "9h 00m", "WFH", "Present", "0h", "9h 00m", "India – Mumbai", "Pune, Maharashtra",   "2 May 2026"  ],
            ["samira", "May", 2026, "04-05-2026", "04-05-2026 09:15", "04-05-2026 18:30", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Mumbai", "Mumbai, Maharashtra", "5 May 2026"  ],
            ["samira", "May", 2026, "05-05-2026", "05-05-2026 09:30", "05-05-2026 18:15", "8h 45m", "WFH", "Present", "0h", "8h 45m", "India – Mumbai", "Pune, Maharashtra",   "6 May 2026"  ],
            ["samira", "May", 2026, "06-05-2026", "06-05-2026 09:00", "06-05-2026 18:30", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Mumbai", "Mumbai, Maharashtra", "7 May 2026"  ],
            ["samira", "May", 2026, "07-05-2026", "07-05-2026 09:15", "07-05-2026 18:15", "9h 00m", "WFH", "Present", "0h", "9h 00m", "India – Mumbai", "Pune, Maharashtra",   "8 May 2026"  ],
            ["samira", "May", 2026, "08-05-2026", "08-05-2026 09:00", "08-05-2026 18:15", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Mumbai", "Mumbai, Maharashtra", "9 May 2026"  ],
            ["samira", "May", 2026, "11-05-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,             null,                  null          ],
            ["samira", "May", 2026, "12-05-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,             null,                  null          ],
            ["samira", "May", 2026, "13-05-2026", "13-05-2026 09:20", "13-05-2026 18:40", "9h 20m", "WFH", "Present", "0h", "9h 20m", "India – Mumbai", "Pune, Maharashtra",   "14 May 2026" ],
            ["samira", "May", 2026, "14-05-2026", "14-05-2026 09:10", "14-05-2026 18:00", "8h 50m", "WFO", "Present", "0h", "8h 50m", "India – Mumbai", "Mumbai, Maharashtra", "15 May 2026" ],
            ["samira", "May", 2026, "15-05-2026", "15-05-2026 09:30", "15-05-2026 18:45", "9h 15m", "WFH", "Present", "0h", "9h 15m", "India – Mumbai", "Pune, Maharashtra",   "16 May 2026" ],
            ["samira", "May", 2026, "18-05-2026", "18-05-2026 09:00", "18-05-2026 18:00", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Mumbai", "Mumbai, Maharashtra", "19 May 2026" ],
            ["samira", "May", 2026, "19-05-2026", "19-05-2026 09:10", "19-05-2026 18:20", "9h 10m", "WFH", "Present", "0h", "9h 10m", "India – Mumbai", "Pune, Maharashtra",   "20 May 2026" ],
            ["samira", "May", 2026, "20-05-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,             null,                  null          ],
            ["samira", "May", 2026, "21-05-2026", "21-05-2026 09:30", "21-05-2026 19:00", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Mumbai", "Mumbai, Maharashtra", "22 May 2026" ],
            ["samira", "May", 2026, "22-05-2026", "22-05-2026 09:15", "22-05-2026 18:00", "8h 45m", "WFO", "Present", "0h", "8h 45m", "India – Mumbai", "Mumbai, Maharashtra", "23 May 2026" ],
            ["samira", "May", 2026, "25-05-2026", "25-05-2026 09:00", "25-05-2026 18:00", "9h 00m", "WFH", "Present", "0h", "9h 00m", "India – Mumbai", "Pune, Maharashtra",   "26 May 2026" ],
            ["samira", "May", 2026, "26-05-2026", "-",                "-",                "-",       "WFH", "Absent",  null, null,     null,             null,                  null          ],
            ["samira", "May", 2026, "27-05-2026", "27-05-2026 09:20", "27-05-2026 19:00", "9h 40m", "WFH", "Present", "0h", "9h 40m", "India – Mumbai", "Pune, Maharashtra",   "28 May 2026" ],
            ["samira", "May", 2026, "28-05-2026", "28-05-2026 09:00", "28-05-2026 18:30", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Mumbai", "Mumbai, Maharashtra", "29 May 2026" ],
            ["samira", "May", 2026, "29-05-2026", "29-05-2026 09:30", "29-05-2026 18:45", "9h 15m", "WFH", "Present", "0h", "9h 15m", "India – Mumbai", "Pune, Maharashtra",   "30 May 2026" ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO attendance_records
                 (username, month, year, date, first_activity, last_activity, working_hours, type, status,
                  non_working_hours, total_session, office_location, system_tracked_location, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        await db.run(
            `INSERT OR IGNORE INTO attendance_summary
             (username, month, year, working_days, present_days, present_pct, absent_days, absent_pct, leave_days, avg_working_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            "samira", "May", 2026, 21, 17, "94.4%", 1, "5.6%", 3, 9.1
        );

        // ── May 2026: jasmine attendance_records — all 21 working days ───────────────
        // present: 19  absent: 1 (18)  leave: 1 (19)
        for (const row of [
            ["jasmine", "May", 2026, "01-05-2026", "01-05-2026 08:55", "01-05-2026 18:10", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "2 May 2026"  ],
            ["jasmine", "May", 2026, "04-05-2026", "04-05-2026 09:00", "04-05-2026 18:00", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Bangalore", "Bangalore, Karnataka", "5 May 2026"  ],
            ["jasmine", "May", 2026, "05-05-2026", "05-05-2026 09:10", "05-05-2026 17:55", "8h 45m", "WFO", "Present", "0h", "8h 45m", "India – Bangalore", "Bangalore, Karnataka", "6 May 2026"  ],
            ["jasmine", "May", 2026, "06-05-2026", "06-05-2026 09:20", "06-05-2026 18:40", "9h 20m", "WFH", "Present", "0h", "9h 20m", "India – Bangalore", "Bangalore, Karnataka", "7 May 2026"  ],
            ["jasmine", "May", 2026, "07-05-2026", "07-05-2026 09:00", "07-05-2026 18:30", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Bangalore", "Bangalore, Karnataka", "8 May 2026"  ],
            ["jasmine", "May", 2026, "08-05-2026", "08-05-2026 09:05", "08-05-2026 18:05", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Bangalore", "Bangalore, Karnataka", "9 May 2026"  ],
            ["jasmine", "May", 2026, "11-05-2026", "11-05-2026 09:00", "11-05-2026 18:15", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "12 May 2026" ],
            ["jasmine", "May", 2026, "12-05-2026", "12-05-2026 09:30", "12-05-2026 18:00", "8h 30m", "WFH", "Present", "0h", "8h 30m", "India – Bangalore", "Bangalore, Karnataka", "13 May 2026" ],
            ["jasmine", "May", 2026, "13-05-2026", "13-05-2026 09:10", "13-05-2026 18:20", "9h 10m", "WFO", "Present", "0h", "9h 10m", "India – Bangalore", "Bangalore, Karnataka", "14 May 2026" ],
            ["jasmine", "May", 2026, "14-05-2026", "14-05-2026 09:00", "14-05-2026 18:25", "9h 25m", "WFO", "Present", "0h", "9h 25m", "India – Bangalore", "Bangalore, Karnataka", "15 May 2026" ],
            ["jasmine", "May", 2026, "15-05-2026", "15-05-2026 09:05", "15-05-2026 18:20", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "16 May 2026" ],
            ["jasmine", "May", 2026, "18-05-2026", "-",                "-",                "-",       "WFO", "Absent",  null, null,     null,                null,                  null          ],
            ["jasmine", "May", 2026, "19-05-2026", "-",                "-",                "-",       "WFH", "Leave",   null, null,     null,                null,                  null          ],
            ["jasmine", "May", 2026, "20-05-2026", "20-05-2026 09:15", "20-05-2026 18:00", "8h 45m", "WFH", "Present", "0h", "8h 45m", "India – Bangalore", "Bangalore, Karnataka", "21 May 2026" ],
            ["jasmine", "May", 2026, "21-05-2026", "21-05-2026 09:30", "21-05-2026 19:00", "9h 30m", "WFO", "Present", "0h", "9h 30m", "India – Bangalore", "Bangalore, Karnataka", "22 May 2026" ],
            ["jasmine", "May", 2026, "22-05-2026", "22-05-2026 09:00", "22-05-2026 18:00", "9h 00m", "WFO", "Present", "0h", "9h 00m", "India – Bangalore", "Bangalore, Karnataka", "23 May 2026" ],
            ["jasmine", "May", 2026, "25-05-2026", "25-05-2026 09:00", "25-05-2026 18:15", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "26 May 2026" ],
            ["jasmine", "May", 2026, "26-05-2026", "26-05-2026 09:10", "26-05-2026 18:00", "8h 50m", "WFH", "Present", "0h", "8h 50m", "India – Bangalore", "Bangalore, Karnataka", "27 May 2026" ],
            ["jasmine", "May", 2026, "27-05-2026", "27-05-2026 09:20", "27-05-2026 18:40", "9h 20m", "WFO", "Present", "0h", "9h 20m", "India – Bangalore", "Bangalore, Karnataka", "28 May 2026" ],
            ["jasmine", "May", 2026, "28-05-2026", "28-05-2026 09:00", "28-05-2026 17:45", "8h 45m", "WFO", "Present", "0h", "8h 45m", "India – Bangalore", "Bangalore, Karnataka", "29 May 2026" ],
            ["jasmine", "May", 2026, "29-05-2026", "29-05-2026 09:05", "29-05-2026 18:20", "9h 15m", "WFO", "Present", "0h", "9h 15m", "India – Bangalore", "Bangalore, Karnataka", "30 May 2026" ],
        ]) {
            await db.run(
                `INSERT OR IGNORE INTO attendance_records
                 (username, month, year, date, first_activity, last_activity, working_hours, type, status,
                  non_working_hours, total_session, office_location, system_tracked_location, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ...row
            );
        }

        await db.run(
            `INSERT OR IGNORE INTO attendance_summary
             (username, month, year, working_days, present_days, present_pct, absent_days, absent_pct, leave_days, avg_working_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            "jasmine", "May", 2026, 21, 19, "95.0%", 1, "5.0%", 1, 9.1
        );

        await db.run("COMMIT");
        console.log("DB seeded: May 2026 (21 days) + Jun 2026 (through Jun 12)");
    } catch (err) {
        await db.run("ROLLBACK");
        throw err;
    }
}

module.exports = { getDb };
