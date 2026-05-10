import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pg from "pg";

const { Pool } = pg;

const port = Number(process.env.PORT || 3078);
const jwtSecret = process.env.JWT_SECRET;
const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;
const mailFrom = process.env.MAIL_FROM || "noreply@localhost";

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

const smtpAuthEnabled = String(process.env.SMTP_AUTH || "false").toLowerCase() === "true";
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay",
  port: Number(process.env.SMTP_PORT || 25),
  secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  ...(smtpAuthEnabled
    ? {
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      }
    : {}),
});

const RESET_CODE_TTL_MIN = 30;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const defaultGroupTrainingSection = {
  eyebrow: "Skupinový tréning",
  heading: "Kruhový tréning pre ženy",
  body: "Kruhový intervalový tréning zameraný na problémové partie, vhodný pre každú výkonnostnú kategóriu.",
  schedulePrimary: "PON, ŠTV 17:15",
  scheduleSecondary: "NE 7:30",
  price: "Tréning 8€",
};

const defaultPricingSection = {
  heading: "Jasné vstupy bez hľadania v tabuľkách.",
  items: [
    { label: "Jednorazový vstup", value: "7€", detail: "Fitnes", sort_order: 0 },
    { label: "10 vstupov", value: "45€", detail: "Vstupová karta", sort_order: 1 },
    { label: "25 vstupov", value: "100€", detail: "Vstupová karta", sort_order: 2 },
    { label: "1 mesiac", value: "42€", detail: "Permanentka", sort_order: 3 },
    { label: "1 mesiac do 18 rokov", value: "38€", detail: "Zvýhodnená permanentka", sort_order: 4 },
    { label: "3 mesiace", value: "117€", detail: "Permanentka", sort_order: 5 },
  ],
};

const defaultContactSection = {
  heading: "Príď si zacvičiť alebo si rezervuj tréning online.",
  notice: "Prosím, noste si vlastný visiaci zámok na skrinku.",
  items: [
    { label: "0910 171 222", href: "tel:+421910171222", icon: "phone", sort_order: 0 },
    {
      label: "Železničná 1043, Stupava",
      href: "https://maps.google.com/?q=Železničná%201043%2C%20Stupava",
      icon: "map",
      sort_order: 1,
    },
    { label: "Rezervačný systém", href: "https://herogym.isportsystem.sk/", icon: "calendar", sort_order: 2 },
    { label: "Instagram", href: "https://www.instagram.com/herogymstupava/", icon: "instagram", sort_order: 3 },
    { label: "Facebook", href: "https://www.facebook.com/herogymstupava/", icon: "facebook", sort_order: 4 },
    { label: "Napísať správu", href: "sms:+421910171222", icon: "message", sort_order: 5 },
  ],
};

const defaultAboutSection = {
  eyebrow: "O nás",
  heading: "HERO GYM STUPAVA",
  body: [
    "Z malého káčatka Cevagym, ktoré dovŕšilo 5 rokov sa stala dospelá labuť HERO GYM.",
    "Sme radi že Vás môžme privítať u nás „DOMA“, pretože dávame do toho všetko a vždy budeme, kým tu budete vy pre nás.",
    "Tešíme sa na každú jednu Vašu návštevu. Radi Vám spravíme voňavú kávu.",
    "Máte na výber z rôznych predtréningových ale aj potréningových nápojov.",
  ].join("\n\n"),
};

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'");
  await pool.query("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email TEXT");
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'admin_users' AND constraint_name = 'admin_users_role_check'
      ) THEN
        ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'moderator'));
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'admin_users' AND constraint_name = 'admin_users_email_unique'
      ) THEN
        ALTER TABLE admin_users ADD CONSTRAINT admin_users_email_unique UNIQUE (email);
      END IF;
    END$$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS password_reset_codes_user_idx ON password_reset_codes(user_id)");

  await pool.query(
    "UPDATE admin_users SET email = $1 WHERE username = 'admin' AND (email IS NULL OR email = '')",
    ["jakub.demeter@gmail.com"],
  );
  await pool.query(
    "UPDATE admin_users SET email = $1 WHERE username = 'lubenko.holoska' AND (email IS NULL OR email = '')",
    ["pidiman@gmail.com"],
  );

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_training_section (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      eyebrow TEXT NOT NULL,
      heading TEXT NOT NULL,
      body TEXT NOT NULL,
      schedule_primary TEXT NOT NULL,
      schedule_secondary TEXT NOT NULL,
      price TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pricing_section (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      heading TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pricing_items (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      detail TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_section (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      heading TEXT NOT NULL,
      notice TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_items (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'phone',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS about_section (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      eyebrow TEXT NOT NULL,
      heading TEXT NOT NULL,
      body TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [adminUser]);
  if (existing.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await pool.query("INSERT INTO admin_users (username, password_hash, role) VALUES ($1, $2, 'admin')", [
      adminUser,
      passwordHash,
    ]);
  } else {
    await pool.query("UPDATE admin_users SET role = 'admin' WHERE username = $1", [adminUser]);
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

  const groupTrainingSection = await pool.query("SELECT id FROM group_training_section WHERE id = 1");
  if (groupTrainingSection.rowCount === 0) {
    await pool.query(
      "INSERT INTO group_training_section (id, eyebrow, heading, body, schedule_primary, schedule_secondary, price) VALUES (1, $1, $2, $3, $4, $5, $6)",
      [
        defaultGroupTrainingSection.eyebrow,
        defaultGroupTrainingSection.heading,
        defaultGroupTrainingSection.body,
        defaultGroupTrainingSection.schedulePrimary,
        defaultGroupTrainingSection.scheduleSecondary,
        defaultGroupTrainingSection.price,
      ],
    );
  }

  const pricingSection = await pool.query("SELECT id FROM pricing_section WHERE id = 1");
  if (pricingSection.rowCount === 0) {
    await pool.query("INSERT INTO pricing_section (id, heading) VALUES (1, $1)", [defaultPricingSection.heading]);
  }

  const pricingItems = await pool.query("SELECT id FROM pricing_items LIMIT 1");
  if (pricingItems.rowCount === 0) {
    for (const item of defaultPricingSection.items) {
      await pool.query("INSERT INTO pricing_items (label, value, detail, sort_order) VALUES ($1, $2, $3, $4)", [
        item.label,
        item.value,
        item.detail,
        item.sort_order,
      ]);
    }
  }

  const contactSection = await pool.query("SELECT id FROM contact_section WHERE id = 1");
  if (contactSection.rowCount === 0) {
    await pool.query("INSERT INTO contact_section (id, heading, notice) VALUES (1, $1, $2)", [
      defaultContactSection.heading,
      defaultContactSection.notice,
    ]);
  }

  const contactItems = await pool.query("SELECT id FROM contact_items LIMIT 1");
  if (contactItems.rowCount === 0) {
    for (const item of defaultContactSection.items) {
      await pool.query("INSERT INTO contact_items (label, href, icon, sort_order) VALUES ($1, $2, $3, $4)", [
        item.label,
        item.href,
        item.icon,
        item.sort_order,
      ]);
    }
  }

  const aboutSection = await pool.query("SELECT id FROM about_section WHERE id = 1");
  if (aboutSection.rowCount === 0) {
    await pool.query("INSERT INTO about_section (id, eyebrow, heading, body) VALUES (1, $1, $2, $3)", [
      defaultAboutSection.eyebrow,
      defaultAboutSection.heading,
      defaultAboutSection.body,
    ]);
  }
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await pool.query("SELECT id, username, role FROM admin_users WHERE id = $1", [payload.sub]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.admin = { sub: user.id, username: user.username, role: user.role };
  return next();
}

function requireAdmin(req, res, next) {
  if (req.admin?.role !== "admin") {
    return res.status(403).json({ message: "Iba admin môže vykonať túto akciu." });
  }
  return next();
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

async function getGroupTrainingSection() {
  const result = await pool.query(
    "SELECT eyebrow, heading, body, schedule_primary, schedule_secondary, price FROM group_training_section WHERE id = 1",
  );
  const section = result.rows[0];

  if (!section) {
    return defaultGroupTrainingSection;
  }

  return {
    eyebrow: section.eyebrow,
    heading: section.heading,
    body: section.body,
    schedulePrimary: section.schedule_primary,
    scheduleSecondary: section.schedule_secondary,
    price: section.price,
  };
}

app.get("/api/group-training-section", async (_req, res) => {
  res.json(await getGroupTrainingSection());
});

async function getPricingSection() {
  const sectionResult = await pool.query("SELECT heading FROM pricing_section WHERE id = 1");
  const itemsResult = await pool.query(
    "SELECT id, label, value, detail, sort_order FROM pricing_items ORDER BY sort_order ASC, id ASC",
  );
  const section = sectionResult.rows[0] || defaultPricingSection;

  return {
    heading: section.heading,
    items: itemsResult.rows.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      detail: item.detail,
      sortOrder: item.sort_order,
    })),
  };
}

app.get("/api/pricing-section", async (_req, res) => {
  res.json(await getPricingSection());
});

async function getContactSection() {
  const sectionResult = await pool.query("SELECT heading, notice FROM contact_section WHERE id = 1");
  const itemsResult = await pool.query(
    "SELECT id, label, href, icon, sort_order FROM contact_items ORDER BY sort_order ASC, id ASC",
  );
  const section = sectionResult.rows[0] || defaultContactSection;

  return {
    heading: section.heading,
    notice: section.notice,
    items: itemsResult.rows.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon,
      sortOrder: item.sort_order,
    })),
  };
}

app.get("/api/contact-section", async (_req, res) => {
  res.json(await getContactSection());
});

async function getAboutSection() {
  const result = await pool.query("SELECT eyebrow, heading, body FROM about_section WHERE id = 1");
  const section = result.rows[0];

  if (!section) {
    return defaultAboutSection;
  }

  return {
    eyebrow: section.eyebrow,
    heading: section.heading,
    body: section.body,
  };
}

app.get("/api/about-section", async (_req, res) => {
  res.json(await getAboutSection());
});

app.post("/api/admin/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Meno a heslo sú povinné." });
  }

  const result = await pool.query(
    "SELECT id, username, password_hash, role FROM admin_users WHERE username = $1",
    [username],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Nesprávne meno alebo heslo." });
  }

  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, {
    expiresIn: "8h",
  });
  return res.json({ token, id: user.id, username: user.username, role: user.role });
});

app.get("/api/admin/me", authenticate, (req, res) => {
  res.json({ id: req.admin.sub, username: req.admin.username, role: req.admin.role });
});

app.get("/api/admin/users", authenticate, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    "SELECT id, username, email, role, created_at FROM admin_users ORDER BY created_at ASC, id ASC",
  );
  res.json(
    result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    })),
  );
});

app.post("/api/admin/users", authenticate, requireAdmin, async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const role = String(req.body?.role || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!username || !password) {
    return res.status(400).json({ message: "Meno a heslo sú povinné." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Heslo musí mať aspoň 8 znakov." });
  }

  if (role !== "admin" && role !== "moderator") {
    return res.status(400).json({ message: "Rola musí byť admin alebo moderator." });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Neplatný formát emailu." });
  }

  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [username]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: "Používateľ s týmto menom už existuje." });
  }

  if (email) {
    const emailExists = await pool.query("SELECT id FROM admin_users WHERE email = $1", [email]);
    if (emailExists.rowCount > 0) {
      return res.status(409).json({ message: "Používateľ s týmto emailom už existuje." });
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO admin_users (username, password_hash, role, email) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
    [username, passwordHash, role, email || null],
  );
  const row = result.rows[0];

  res.status(201).json({
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  });
});

app.put("/api/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Neplatné ID." });
  }

  const password = req.body?.password === undefined ? null : String(req.body.password);
  const role = req.body?.role === undefined ? null : String(req.body.role).trim();
  const email =
    req.body?.email === undefined ? null : String(req.body.email).trim().toLowerCase();

  if (role !== null && role !== "admin" && role !== "moderator") {
    return res.status(400).json({ message: "Rola musí byť admin alebo moderator." });
  }

  if (password !== null && password.length > 0 && password.length < 8) {
    return res.status(400).json({ message: "Heslo musí mať aspoň 8 znakov." });
  }

  if (email !== null && email.length > 0 && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Neplatný formát emailu." });
  }

  const target = await pool.query("SELECT id, role FROM admin_users WHERE id = $1", [id]);
  if (target.rowCount === 0) {
    return res.status(404).json({ message: "Používateľ neexistuje." });
  }

  if (id === req.admin.sub && role !== null && role !== "admin") {
    return res.status(400).json({ message: "Nemôžeš si zmeniť vlastnú rolu." });
  }

  if (role !== null && target.rows[0].role === "admin" && role !== "admin") {
    const adminCount = await pool.query("SELECT COUNT(*)::int AS count FROM admin_users WHERE role = 'admin'");
    if (adminCount.rows[0].count <= 1) {
      return res.status(400).json({ message: "Musí ostať aspoň jeden admin." });
    }
  }

  if (email !== null && email.length > 0) {
    const emailExists = await pool.query("SELECT id FROM admin_users WHERE email = $1 AND id <> $2", [email, id]);
    if (emailExists.rowCount > 0) {
      return res.status(409).json({ message: "Používateľ s týmto emailom už existuje." });
    }
  }

  const updates = [];
  const values = [];
  if (password !== null && password.length > 0) {
    values.push(await bcrypt.hash(password, 12));
    updates.push(`password_hash = $${values.length}`);
  }
  if (role !== null) {
    values.push(role);
    updates.push(`role = $${values.length}`);
  }
  if (email !== null) {
    values.push(email.length > 0 ? email : null);
    updates.push(`email = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Nič na uloženie." });
  }

  updates.push("updated_at = NOW()");
  values.push(id);

  const result = await pool.query(
    `UPDATE admin_users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, username, email, role, created_at`,
    values,
  );
  const row = result.rows[0];

  res.json({
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  });
});

app.delete("/api/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Neplatné ID." });
  }

  if (id === req.admin.sub) {
    return res.status(400).json({ message: "Nemôžeš zmazať sám seba." });
  }

  const target = await pool.query("SELECT role FROM admin_users WHERE id = $1", [id]);
  if (target.rowCount === 0) {
    return res.status(404).json({ message: "Používateľ neexistuje." });
  }

  if (target.rows[0].role === "admin") {
    const adminCount = await pool.query("SELECT COUNT(*)::int AS count FROM admin_users WHERE role = 'admin'");
    if (adminCount.rows[0].count <= 1) {
      return res.status(400).json({ message: "Musí ostať aspoň jeden admin." });
    }
  }

  await pool.query("DELETE FROM admin_users WHERE id = $1", [id]);
  res.json({ ok: true });
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

app.get("/api/admin/group-training-section", authenticate, async (_req, res) => {
  res.json(await getGroupTrainingSection());
});

app.put("/api/admin/group-training-section", authenticate, async (req, res) => {
  const eyebrow = String(req.body?.eyebrow || "").trim();
  const heading = String(req.body?.heading || "").trim();
  const body = String(req.body?.body || "").trim();
  const schedulePrimary = String(req.body?.schedulePrimary || "").trim();
  const scheduleSecondary = String(req.body?.scheduleSecondary || "").trim();
  const price = String(req.body?.price || "").trim();

  if (!eyebrow || !heading || !body || !schedulePrimary || !scheduleSecondary || !price) {
    return res.status(400).json({ message: "Všetky polia sú povinné." });
  }

  await pool.query(
    "INSERT INTO group_training_section (id, eyebrow, heading, body, schedule_primary, schedule_secondary, price) VALUES (1, $1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET eyebrow = EXCLUDED.eyebrow, heading = EXCLUDED.heading, body = EXCLUDED.body, schedule_primary = EXCLUDED.schedule_primary, schedule_secondary = EXCLUDED.schedule_secondary, price = EXCLUDED.price, updated_at = NOW()",
    [eyebrow, heading, body, schedulePrimary, scheduleSecondary, price],
  );

  res.json(await getGroupTrainingSection());
});

app.get("/api/admin/pricing-section", authenticate, async (_req, res) => {
  res.json(await getPricingSection());
});

app.put("/api/admin/pricing-section", authenticate, async (req, res) => {
  const heading = String(req.body?.heading || "").trim();
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!heading) {
    return res.status(400).json({ message: "Hlavný text je povinný." });
  }

  if (items.length === 0) {
    return res.status(400).json({ message: "Pridaj aspoň jednu bunku." });
  }

  const normalizedItems = items.map((item, index) => ({
    id: Number.isInteger(item.id) && item.id > 0 ? item.id : null,
    label: String(item.label || "").trim(),
    value: String(item.value || "").trim(),
    detail: String(item.detail || "").trim(),
    sortOrder: Number.isInteger(item.sortOrder) ? item.sortOrder : index,
  }));

  if (normalizedItems.some((item) => !item.label || !item.value || !item.detail)) {
    return res.status(400).json({ message: "Každá bunka musí mať typ, názov a hodnotu." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO pricing_section (id, heading) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET heading = EXCLUDED.heading, updated_at = NOW()",
      [heading],
    );

    const keptIds = [];
    for (const [index, item] of normalizedItems.entries()) {
      if (item.id) {
        const result = await client.query(
          "UPDATE pricing_items SET label = $1, value = $2, detail = $3, sort_order = $4, updated_at = NOW() WHERE id = $5 RETURNING id",
          [item.label, item.value, item.detail, index, item.id],
        );
        if (result.rows[0]) {
          keptIds.push(result.rows[0].id);
          continue;
        }
      }

      const result = await client.query(
        "INSERT INTO pricing_items (label, value, detail, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
        [item.label, item.value, item.detail, index],
      );
      keptIds.push(result.rows[0].id);
    }

    await client.query("DELETE FROM pricing_items WHERE NOT (id = ANY($1::int[]))", [keptIds]);
    await client.query("COMMIT");
    res.json(await getPricingSection());
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Cenník sa nepodarilo uložiť." });
  } finally {
    client.release();
  }
});

app.get("/api/admin/contact-section", authenticate, async (_req, res) => {
  res.json(await getContactSection());
});

app.put("/api/admin/contact-section", authenticate, async (req, res) => {
  const heading = String(req.body?.heading || "").trim();
  const notice = String(req.body?.notice || "").trim();
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!heading || !notice) {
    return res.status(400).json({ message: "Hlavný text a poznámka sú povinné." });
  }

  if (items.length === 0) {
    return res.status(400).json({ message: "Pridaj aspoň jednu kontaktnú bunku." });
  }

  const normalizedItems = items.map((item, index) => ({
    id: Number.isInteger(item.id) && item.id > 0 ? item.id : null,
    label: String(item.label || "").trim(),
    href: String(item.href || "").trim(),
    icon: String(item.icon || "phone").trim(),
    sortOrder: Number.isInteger(item.sortOrder) ? item.sortOrder : index,
  }));

  if (normalizedItems.some((item) => !item.label || !item.href)) {
    return res.status(400).json({ message: "Každá bunka musí mať text a odkaz." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO contact_section (id, heading, notice) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET heading = EXCLUDED.heading, notice = EXCLUDED.notice, updated_at = NOW()",
      [heading, notice],
    );

    const keptIds = [];
    for (const [index, item] of normalizedItems.entries()) {
      if (item.id) {
        const result = await client.query(
          "UPDATE contact_items SET label = $1, href = $2, icon = $3, sort_order = $4, updated_at = NOW() WHERE id = $5 RETURNING id",
          [item.label, item.href, item.icon, index, item.id],
        );
        if (result.rows[0]) {
          keptIds.push(result.rows[0].id);
          continue;
        }
      }

      const result = await client.query(
        "INSERT INTO contact_items (label, href, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
        [item.label, item.href, item.icon, index],
      );
      keptIds.push(result.rows[0].id);
    }

    await client.query("DELETE FROM contact_items WHERE NOT (id = ANY($1::int[]))", [keptIds]);
    await client.query("COMMIT");
    res.json(await getContactSection());
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Kontakt sa nepodarilo uložiť." });
  } finally {
    client.release();
  }
});

app.get("/api/admin/about-section", authenticate, async (_req, res) => {
  res.json(await getAboutSection());
});

app.put("/api/admin/about-section", authenticate, async (req, res) => {
  const eyebrow = String(req.body?.eyebrow || "").trim();
  const heading = String(req.body?.heading || "").trim();
  const body = String(req.body?.body || "").trim();

  if (!eyebrow || !heading || !body) {
    return res.status(400).json({ message: "Všetky polia sú povinné." });
  }

  await pool.query(
    "INSERT INTO about_section (id, eyebrow, heading, body) VALUES (1, $1, $2, $3) ON CONFLICT (id) DO UPDATE SET eyebrow = EXCLUDED.eyebrow, heading = EXCLUDED.heading, body = EXCLUDED.body, updated_at = NOW()",
    [eyebrow, heading, body],
  );

  res.json(await getAboutSection());
});

app.post("/api/admin/password-reset/request", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Zadaj platný email." });
  }

  const result = await pool.query(
    "SELECT id, username, email FROM admin_users WHERE email = $1",
    [email],
  );
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ message: "Tento email neexistuje." });
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await bcrypt.hash(code, 12);

  await pool.query(
    "UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
    [user.id],
  );
  await pool.query(
    "INSERT INTO password_reset_codes (user_id, code_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '" +
      RESET_CODE_TTL_MIN +
      " minutes')",
    [user.id, codeHash],
  );

  try {
    await smtpTransport.sendMail({
      from: mailFrom,
      to: user.email,
      subject: "Reset hesla – HERO GYM Stupava",
      text:
        `Ahoj ${user.username},\n\n` +
        `prijali sme žiadosť o reset hesla pre tvoj admin účet.\n` +
        `Tvoj jednorazový kód: ${code}\n\n` +
        `Kód platí ${RESET_CODE_TTL_MIN} minút. Ak si reset nepožiadal/a, túto správu ignoruj.\n`,
    });
  } catch (error) {
    console.error("Failed to send reset email", error);
    return res.status(500).json({ message: "Email sa nepodarilo odoslať." });
  }

  res.json({ ok: true });
});

app.post("/api/admin/password-reset/confirm", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();
  const password = String(req.body?.password || "");

  if (!email || !code || !password) {
    return res.status(400).json({ message: "Email, kód a nové heslo sú povinné." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Heslo musí mať aspoň 8 znakov." });
  }

  const userResult = await pool.query("SELECT id FROM admin_users WHERE email = $1", [email]);
  const user = userResult.rows[0];
  if (!user) {
    return res.status(400).json({ message: "Neplatný email alebo kód." });
  }

  const codesResult = await pool.query(
    "SELECT id, code_hash FROM password_reset_codes WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 5",
    [user.id],
  );

  let matched = null;
  for (const row of codesResult.rows) {
    if (await bcrypt.compare(code, row.code_hash)) {
      matched = row;
      break;
    }
  }

  if (!matched) {
    return res.status(400).json({ message: "Neplatný alebo expirovaný kód." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, user.id],
    );
    await client.query(
      "UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [user.id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Heslo sa nepodarilo zmeniť." });
  } finally {
    client.release();
  }

  res.json({ ok: true });
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
