import { StrictMode, useEffect, useMemo, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Facebook,
  Instagram,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import "./styles.css";

const reservationUrl = "https://herogym.isportsystem.sk/";

const gallery = [
  { src: "/assets/gallery/vchod.jpg", title: "Vchod", tag: "Vchod", shape: "wide" },
  { src: "/assets/gallery/recepcia.jpg", title: "Recepcia", tag: "Recepcia", shape: "tall" },
  { src: "/assets/gallery/fitnes-1.jpg", title: "Fitnes zóna", tag: "Fitnes", shape: "tall" },
  { src: "/assets/gallery/fitnes-2.jpg", title: "Silový priestor", tag: "Fitnes", shape: "wide" },
  { src: "/assets/gallery/solarium.jpg", title: "Solárium", tag: "Solárium", shape: "tall" },
  { src: "/assets/gallery/satne.jpg", title: "Šatne", tag: "Šatne", shape: "tall" },
  { src: "/assets/gallery/maserna.jpg", title: "Masérňa", tag: "Masérňa", shape: "tall" },
  { src: "/assets/gallery/detail.jpg", title: "Detail priestoru", tag: "Fitnes", shape: "wide" },
] as const;

const priceItems = [
  { label: "Jednorazový vstup", value: "7€", detail: "Fitnes" },
  { label: "10 vstupov", value: "45€", detail: "Vstupová karta" },
  { label: "25 vstupov", value: "100€", detail: "Vstupová karta" },
  { label: "1 mesiac", value: "42€", detail: "Permanentka" },
  { label: "1 mesiac do 18 rokov", value: "38€", detail: "Zvýhodnená permanentka" },
  { label: "3 mesiace", value: "117€", detail: "Permanentka" },
];

const services = [
  {
    icon: Dumbbell,
    title: "Osobné tréningy",
    text: "Konzultácie, ceny a časové možnosti poskytuje recepcia alebo správy.",
  },
  {
    icon: CalendarDays,
    title: "Skupinové tréningy",
    text: "Na skupinové tréningy je potrebné prihlásenie cez rezervačný systém.",
  },
  {
    icon: Sparkles,
    title: "Masáže",
    text: "Klasická 60 min. 40€, klasická 90 min. 55€, športová 60 min. 40€.",
  },
  {
    icon: Sun,
    title: "Solárium",
    text: "Cena 0,60€ za minútu.",
  },
];

function Root() {
  const isAdminPage = window.location.pathname.replace(/\/+$/, "") === "/admin";

  if (isAdminPage) {
    return <AdminPage />;
  }

  return <MarketingSite />;
}

function MarketingSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("Všetko");
  const tags = useMemo(() => ["Všetko", ...Array.from(new Set(gallery.map((item) => item.tag)))], []);
  const filteredGallery = activeTag === "Všetko" ? gallery : gallery.filter((item) => item.tag === activeTag);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="HERO GYM STUPAVA">
          <img src="/assets/brand/hero-gym-logo.png" alt="HERO GYM STUPAVA" />
          <small>Najväčší gym v Stupave</small>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? "nav is-open" : "nav"} onClick={() => setMenuOpen(false)}>
          <a href="#treningy">Tréningy</a>
          <a href="#cennik">Cenník</a>
          <a href="#galeria">Galéria</a>
          <a href="#kontakt">Kontakt</a>
          <a className="nav-cta" href={reservationUrl} target="_blank" rel="noreferrer">
            Rezervovať
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true">
            <img src="/assets/gallery/fitnes-2.jpg" alt="" />
            <img src="/assets/gallery/recepcia.jpg" alt="" />
            <img src="/assets/gallery/vchod.jpg" alt="" />
          </div>
          <div className="hero-content">
            <img className="hero-logo" src="/assets/brand/hero-gym-logo-tight.png" alt="" />
            <h1 id="hero-title">HERO GYM STUPAVA</h1>
            <p className="hero-copy">
              Moderný priestor pre silový tréning, osobné tréningy, skupinové hodiny, masáže a solárium.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={reservationUrl} target="_blank" rel="noreferrer">
                Rezervovať tréning <ArrowUpRight size={18} />
              </a>
              <a className="button ghost" href="tel:+421910171222">
                <Phone size={18} /> 0910 171 222
              </a>
            </div>
          </div>
        </section>

        <section className="quick-strip" aria-label="Základné informácie">
          <article>
            <MapPin size={22} />
            <span>Železničná 1043, Stupava</span>
          </article>
          <article>
            <CalendarDays size={22} />
            <span>Po - Pia 8:00 - 20:00</span>
          </article>
          <article>
            <LockKeyhole size={22} />
            <span>Víkend nonstop pre permanentky a Multisport</span>
          </article>
        </section>

        <section className="section split" id="treningy">
          <div>
            <p className="eyebrow">Tréningy a služby</p>
            <h2>Vyber si tréning, ktorý sedí tvojmu rytmu.</h2>
            <p>
              HERO GYM spája fitnes, skupinové tréningy, regeneráciu a recepčné zázemie v jednom priestore.
              Skupinové hodiny sa prihlasujú cez rezervačný systém.
            </p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <service.icon size={26} />
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="training-band">
          <div>
            <p className="eyebrow">Skupinový tréning</p>
            <h2>Kruhový tréning pre ženy</h2>
            <p>Kruhový intervalový tréning zameraný na problémové partie, vhodný pre každú výkonnostnú kategóriu.</p>
          </div>
          <div className="schedule">
            <span>PON, ŠTV 17:15</span>
            <span>NE 7:30</span>
            <strong>Tréning 8€</strong>
          </div>
        </section>

        <section className="section" id="cennik">
          <div className="section-heading">
            <p className="eyebrow">Cenník fitnes</p>
            <h2>Jasné vstupy bez hľadania v tabuľkách.</h2>
          </div>
          <div className="price-grid">
            {priceItems.map((item) => (
              <article className="price-card" key={item.label}>
                <span>{item.detail}</span>
                <h3>{item.label}</h3>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section gallery-section" id="galeria">
          <div className="section-heading row">
            <div>
              <p className="eyebrow">Galéria</p>
              <h2>Reálne priestory HERO GYM.</h2>
            </div>
            <div className="filters" aria-label="Filtrovať galériu">
              {tags.map((tag) => (
                <button
                  className={activeTag === tag ? "is-active" : ""}
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <figure className={item.shape === "wide" ? "gallery-item wide" : "gallery-item"} key={item.src}>
                <img src={item.src} alt={item.title} loading="lazy" />
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section contact-section" id="kontakt">
          <div>
            <p className="eyebrow">Kontakt</p>
            <h2>Príď si zacvičiť alebo si rezervuj tréning online.</h2>
            <p className="notice">Prosím, noste si vlastný visiaci zámok na skrinku.</p>
          </div>
          <div className="contact-panel">
            <a href="tel:+421910171222">
              <Phone size={20} /> 0910 171 222
            </a>
            <a href="https://maps.google.com/?q=Železničná%201043%2C%20Stupava" target="_blank" rel="noreferrer">
              <MapPin size={20} /> Železničná 1043, Stupava
            </a>
            <a href={reservationUrl} target="_blank" rel="noreferrer">
              <CalendarDays size={20} /> Rezervačný systém
            </a>
            <a href="https://www.instagram.com/herogymstupava/" target="_blank" rel="noreferrer">
              <Instagram size={20} /> Instagram
            </a>
            <a href="https://www.facebook.com/herogymstupava/" target="_blank" rel="noreferrer">
              <Facebook size={20} /> Facebook
            </a>
            <a href="sms:+421910171222">
              <MessageCircle size={20} /> Napísať správu
            </a>
          </div>
        </section>
      </main>

      <footer>
        <span>HERO GYM STUPAVA</span>
        <span>Obsah a fotografie spracované z herogymstupava.sk</span>
      </footer>
    </>
  );
}

function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("herogym_admin_token");
    if (!token) {
      return;
    }

    fetch("/api/admin/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { username: string }) => setAdminName(data.username))
      .catch(() => localStorage.removeItem("herogym_admin_token"));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Prihlásenie sa nepodarilo.");
      }

      localStorage.setItem("herogym_admin_token", data.token);
      setAdminName(data.username);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Prihlásenie sa nepodarilo.");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("herogym_admin_token");
    setAdminName("");
    setUsername("");
    setPassword("");
  }

  return (
    <main className="admin-page">
      <div className="admin-bg" aria-hidden="true">
        <img src="/assets/gallery/fitnes-2.jpg" alt="" />
      </div>
      <section className="admin-card" aria-labelledby="admin-title">
        <img className="admin-logo" src="/assets/brand/hero-gym-logo.png" alt="HERO GYM STUPAVA" />
        <p className="eyebrow">Admin sekcia</p>
        {adminName ? (
          <div className="admin-dashboard">
            <h1 id="admin-title">Prihlásený</h1>
            <p>Vitaj, {adminName}. Admin rozhranie je pripravené na budúce funkcie.</p>
            <button className="button primary" type="button" onClick={logout}>
              Odhlásiť
            </button>
          </div>
        ) : (
          <>
            <h1 id="admin-title">Prihlásenie</h1>
            <p className="admin-copy">Zadaj meno a heslo uložené v databáze.</p>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                Meno
                <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
              </label>
              <label>
                Heslo
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                />
              </label>
              {message ? <p className="admin-message">{message}</p> : null}
              <button className="button primary" disabled={isLoading} type="submit">
                {isLoading ? "Overujem..." : "Prihlásiť"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
