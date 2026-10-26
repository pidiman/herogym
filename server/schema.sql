CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_codes_user_idx ON password_reset_codes(user_id);

CREATE TABLE IF NOT EXISTS training_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'dumbbell',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_training_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow TEXT NOT NULL,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  schedule_primary TEXT NOT NULL,
  schedule_secondary TEXT NOT NULL,
  price TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL,
  valid_from_text TEXT NOT NULL DEFAULT 'Cenník platný od dátum',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_items (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  detail TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL,
  notice TEXT NOT NULL,
  opening_heading TEXT NOT NULL DEFAULT 'OTVÁRACIE HODINY',
  reception_subtitle TEXT NOT NULL DEFAULT 'Recepcia a solárium otvorené',
  fitness_subtitle TEXT NOT NULL DEFAULT 'Fitnescentrum otvorené NONSTOP',
  responsible_text TEXT NOT NULL DEFAULT 'Zodpovedný vedúci: Meno Priezvisko tel. 0000 000 000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_items (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'phone',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow TEXT NOT NULL,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iclub_section (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  url TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT 'Stiahni si appku iClub',
  app_store_url TEXT NOT NULL DEFAULT '',
  google_play_url TEXT NOT NULL DEFAULT '',
  guide_heading TEXT NOT NULL DEFAULT 'Návod pre používateľov',
  guide_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_opening_hours (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  hours TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id SERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'reset_request', 'reset_confirm')),
  identifier TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  cleared BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_attempts_ip_action_idx ON auth_attempts(ip, action, created_at);
CREATE INDEX IF NOT EXISTS auth_attempts_created_idx ON auth_attempts(created_at);

CREATE TABLE IF NOT EXISTS security_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  login_max_attempts INT NOT NULL DEFAULT 5,
  login_window_min INT NOT NULL DEFAULT 15,
  reset_max_attempts INT NOT NULL DEFAULT 5,
  reset_window_min INT NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
