const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// Fake users (same as frontend)
const users = [
    { username: "samira", role: "employee" },
    { username: "john", role: "user" },
    { username: "jasmine", role: "admin" },
];

// Login API
app.post("/login", (req, res) => {
    const { username } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    // Create JWT
    const token = jwt.sign(user, SECRET, { expiresIn: "1h" });

    res.json({ token });
});

// Protected API
app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(403);

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        res.json({ user });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));