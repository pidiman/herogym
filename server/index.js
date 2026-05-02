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

const defaultTrainingSection = {
  heading: "Vyber si tréning, ktorý sedí tvojmu rytmu.",
  body:
    "HERO GYM spája fitnes, skupinové tréningy, regeneráciu a recepčné zázemie v jednom priestore. Skupinové hodiny sa prihlasujú cez rezervačný systém.",
  cards: [
    {
      title: "Osobné tréningy",
      body: "Konzultácie, ceny a časové možnosti poskytuje recepcia alebo správy.",
      icon: "dumbbell",
      sort_order: 0,
    },
    {
      title: "Skupinové tréningy",
      body: "Na skupinové tréningy je potrebné prihlásenie cez rezervačný systém.",
      icon: "calendar",
      sort_order: 1,
    },
    {
      title: "Masáže",
      body: "Klasická 60 min. 40€, klasická 90 min. 55€, športová 60 min. 40€.",
      icon: "sparkles",
      sort_order: 2,
    },
    {
      title: "Solárium",
      body: "Cena 0,60€ za minútu.",
      icon: "sun",
      sort_order: 3,
    },
  ],
};

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS training_section (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      heading TEXT NOT NULL,
      body TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS training_cards (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'dumbbell',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [adminUser]);
  if (existing.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await pool.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", [adminUser, passwordHash]);
  }

  const section = await pool.query("SELECT id FROM training_section WHERE id = 1");
  if (section.rowCount === 0) {
    await pool.query("INSERT INTO training_section (id, heading, body) VALUES (1, $1, $2)", [
      defaultTrainingSection.heading,
      defaultTrainingSection.body,
    ]);
  }

  const cards = await pool.query("SELECT id FROM training_cards LIMIT 1");
  if (cards.rowCount === 0) {
    for (const card of defaultTrainingSection.cards) {
      await pool.query(
        "INSERT INTO training_cards (title, body, icon, sort_order) VALUES ($1, $2, $3, $4)",
        [card.title, card.body, card.icon, card.sort_order],
      );
    }
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

async function getTrainingSection() {
  const sectionResult = await pool.query("SELECT heading, body FROM training_section WHERE id = 1");
  const cardsResult = await pool.query(
    "SELECT id, title, body, icon, sort_order FROM training_cards ORDER BY sort_order ASC, id ASC",
  );
  const section = sectionResult.rows[0] || defaultTrainingSection;

  return {
    heading: section.heading,
    body: section.body,
    cards: cardsResult.rows.map((card) => ({
      id: card.id,
      title: card.title,
      body: card.body,
      icon: card.icon,
      sortOrder: card.sort_order,
    })),
  };
}

app.get("/api/training-section", async (_req, res) => {
  res.json(await getTrainingSection());
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

app.get("/api/admin/training-section", authenticate, async (_req, res) => {
  res.json(await getTrainingSection());
});

app.put("/api/admin/training-section", authenticate, async (req, res) => {
  const heading = String(req.body?.heading || "").trim();
  const body = String(req.body?.body || "").trim();
  const cards = Array.isArray(req.body?.cards) ? req.body.cards : [];

  if (!heading || !body) {
    return res.status(400).json({ message: "Hlavný a vedľajší text sú povinné." });
  }

  if (cards.length === 0) {
    return res.status(400).json({ message: "Pridaj aspoň jednu bunku." });
  }

  const normalizedCards = cards.map((card, index) => ({
    id: Number.isInteger(card.id) && card.id > 0 ? card.id : null,
    title: String(card.title || "").trim(),
    body: String(card.body || "").trim(),
    icon: String(card.icon || "dumbbell").trim(),
    sortOrder: Number.isInteger(card.sortOrder) ? card.sortOrder : index,
  }));

  if (normalizedCards.some((card) => !card.title || !card.body)) {
    return res.status(400).json({ message: "Každá bunka musí mať názov a text." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO training_section (id, heading, body) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET heading = EXCLUDED.heading, body = EXCLUDED.body, updated_at = NOW()",
      [heading, body],
    );

    const keptIds = [];
    for (const [index, card] of normalizedCards.entries()) {
      if (card.id) {
        const result = await client.query(
          "UPDATE training_cards SET title = $1, body = $2, icon = $3, sort_order = $4, updated_at = NOW() WHERE id = $5 RETURNING id",
          [card.title, card.body, card.icon, index, card.id],
        );
        if (result.rows[0]) {
          keptIds.push(result.rows[0].id);
          continue;
        }
      }

      const result = await client.query(
        "INSERT INTO training_cards (title, body, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
        [card.title, card.body, card.icon, index],
      );
      keptIds.push(result.rows[0].id);
    }

    await client.query("DELETE FROM training_cards WHERE NOT (id = ANY($1::int[]))", [keptIds]);
    await client.query("COMMIT");
    res.json(await getTrainingSection());
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Sekciu sa nepodarilo uložiť." });
  } finally {
    client.release();
  }
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
