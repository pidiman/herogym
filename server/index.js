import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;

const port = Number(process.env.PORT || 3078);
const jwtSecret = process.env.JWT_SECRET;
const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

if (!adminUser || !adminPassword) {
  throw new Error("ADMIN_USER and ADMIN_PASSWORD are required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(express.json());

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [adminUser]);
  if (existing.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await pool.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", [adminUser, passwordHash]);
  }
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.admin = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

app.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});

app.post("/api/admin/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Meno a heslo sú povinné." });
  }

  const result = await pool.query("SELECT id, username, password_hash FROM admin_users WHERE username = $1", [username]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Nesprávne meno alebo heslo." });
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: "8h" });
  return res.json({ token, username: user.username });
});

app.get("/api/admin/me", authenticate, (req, res) => {
  res.json({ username: req.admin.username });
});

initDatabase()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Hero Gym API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
