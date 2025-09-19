import express from "express";

const router = express.Router();

// Hardcoded account: admin / 1234
const USER = { username: "admin", password: "1234" };

// POST /auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    return res.json({ message: "Login successful" });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

export default router;
