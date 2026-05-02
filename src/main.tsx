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
  Plus,
  Save,
  Sparkles,
  Sun,
  Trash2,
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

const iconMap = {
  dumbbell: Dumbbell,
  calendar: CalendarDays,
  sparkles: Sparkles,
  sun: Sun,
} as const;

type TrainingCard = {
  id?: number;
  title: string;
  body: string;
  icon: keyof typeof iconMap;
  sortOrder?: number;
};

type TrainingSection = {
  heading: string;
  body: string;
  cards: TrainingCard[];
};

type PricingItem = {
  id?: number;
  label: string;
  value: string;
  detail: string;
  sortOrder?: number;
};

type PricingSection = {
  heading: string;
  items: PricingItem[];
};

const iconLabels: Record<keyof typeof iconMap, string> = {
  dumbbell: "Činka",
  calendar: "Kalendár",
  sparkles: "Regenerácia",
  sun: "Slnko",
};

const defaultTrainingSection: TrainingSection = {
  heading: "Vyber si tréning, ktorý sedí tvojmu rytmu.",
  body:
    "HERO GYM spája fitnes, skupinové tréningy, regeneráciu a recepčné zázemie v jednom priestore. Skupinové hodiny sa prihlasujú cez rezervačný systém.",
  cards: [
    {
      title: "Osobné tréningy",
      body: "Konzultácie, ceny a časové možnosti poskytuje recepcia alebo správy.",
      icon: "dumbbell",
    },
    {
      title: "Skupinové tréningy",
      body: "Na skupinové tréningy je potrebné prihlásenie cez rezervačný systém.",
      icon: "calendar",
    },
    {
      title: "Masáže",
      body: "Klasická 60 min. 40€, klasická 90 min. 55€, športová 60 min. 40€.",
      icon: "sparkles",
    },
    {
      title: "Solárium",
      body: "Cena 0,60€ za minútu.",
      icon: "sun",
    },
  ],
};

const defaultPricingSection: PricingSection = {
  heading: "Jasné vstupy bez hľadania v tabuľkách.",
  items: [
    { label: "Jednorazový vstup", value: "7€", detail: "Fitnes" },
    { label: "10 vstupov", value: "45€", detail: "Vstupová karta" },
    { label: "25 vstupov", value: "100€", detail: "Vstupová karta" },
    { label: "1 mesiac", value: "42€", detail: "Permanentka" },
    { label: "1 mesiac do 18 rokov", value: "38€", detail: "Zvýhodnená permanentka" },
    { label: "3 mesiace", value: "117€", detail: "Permanentka" },
  ],
};

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
  const [trainingSection, setTrainingSection] = useState<TrainingSection>(defaultTrainingSection);
  const [pricingSection, setPricingSection] = useState<PricingSection>(defaultPricingSection);
  const tags = useMemo(() => ["Všetko", ...Array.from(new Set(gallery.map((item) => item.tag)))], []);
  const filteredGallery = activeTag === "Všetko" ? gallery : gallery.filter((item) => item.tag === activeTag);

  useEffect(() => {
    fetch("/api/training-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: TrainingSection) => setTrainingSection(data))
      .catch(() => setTrainingSection(defaultTrainingSection));
  }, []);

  useEffect(() => {
    fetch("/api/pricing-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: PricingSection) => setPricingSection(data))
      .catch(() => setPricingSection(defaultPricingSection));
  }, []);

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
            <h2>{trainingSection.heading}</h2>
            <p>{trainingSection.body}</p>
          </div>
          <div className="service-grid">
            {trainingSection.cards.map((service) => {
              const Icon = iconMap[service.icon] || Dumbbell;
              return (
                <article className="service-card" key={service.id || service.title}>
                  <Icon size={26} />
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </article>
              );
            })}
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
            <h2>{pricingSection.heading}</h2>
          </div>
          <div className="price-grid">
            {pricingSection.items.map((item) => (
              <article className="price-card" key={item.id || item.label}>
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
  const [trainingDraft, setTrainingDraft] = useState<TrainingSection>(defaultTrainingSection);
  const [pricingDraft, setPricingDraft] = useState<PricingSection>(defaultPricingSection);
  const [activeAdminSection, setActiveAdminSection] = useState<"training" | "pricing" | null>(null);
  const [trainingMessage, setTrainingMessage] = useState("");
  const [pricingMessage, setPricingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainingLoading, setIsTrainingLoading] = useState(false);
  const [isTrainingSaving, setIsTrainingSaving] = useState(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPricingSaving, setIsPricingSaving] = useState(false);

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

  useEffect(() => {
    if (adminName) {
      void loadTrainingSection();
      void loadPricingSection();
    }
  }, [adminName]);

  function getToken() {
    return localStorage.getItem("herogym_admin_token") || "";
  }

  async function loadTrainingSection() {
    setIsTrainingLoading(true);
    setTrainingMessage("");

    try {
      const response = await fetch("/api/admin/training-section", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sekciu sa nepodarilo načítať.");
      }

      setTrainingDraft(data);
    } catch (error) {
      setTrainingMessage(error instanceof Error ? error.message : "Sekciu sa nepodarilo načítať.");
    } finally {
      setIsTrainingLoading(false);
    }
  }

  async function loadPricingSection() {
    setIsPricingLoading(true);
    setPricingMessage("");

    try {
      const response = await fetch("/api/admin/pricing-section", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cenník sa nepodarilo načítať.");
      }

      setPricingDraft(data);
    } catch (error) {
      setPricingMessage(error instanceof Error ? error.message : "Cenník sa nepodarilo načítať.");
    } finally {
      setIsPricingLoading(false);
    }
  }

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
    setActiveAdminSection(null);
  }

  function updateCard(index: number, nextCard: TrainingCard) {
    setTrainingDraft((current) => ({
      ...current,
      cards: current.cards.map((card, cardIndex) => (cardIndex === index ? nextCard : card)),
    }));
  }

  function addCard() {
    setTrainingDraft((current) => ({
      ...current,
      cards: [
        ...current.cards,
        {
          title: "Nová bunka",
          body: "Doplň text bunky.",
          icon: "dumbbell",
        },
      ],
    }));
  }

  function removeCard(index: number) {
    setTrainingDraft((current) => ({
      ...current,
      cards: current.cards.filter((_, cardIndex) => cardIndex !== index),
    }));
  }

  async function saveTrainingSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsTrainingSaving(true);
    setTrainingMessage("");

    try {
      const response = await fetch("/api/admin/training-section", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sekciu sa nepodarilo uložiť.");
      }

      setTrainingDraft(data);
      setTrainingMessage("Sekcia tréningy je uložená.");
    } catch (error) {
      setTrainingMessage(error instanceof Error ? error.message : "Sekciu sa nepodarilo uložiť.");
    } finally {
      setIsTrainingSaving(false);
    }
  }

  function updatePricingItem(index: number, nextItem: PricingItem) {
    setPricingDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)),
    }));
  }

  function addPricingItem() {
    setPricingDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          label: "Nová položka",
          value: "0€",
          detail: "Typ",
        },
      ],
    }));
  }

  function removePricingItem(index: number) {
    setPricingDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function savePricingSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPricingSaving(true);
    setPricingMessage("");

    try {
      const response = await fetch("/api/admin/pricing-section", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cenník sa nepodarilo uložiť.");
      }

      setPricingDraft(data);
      setPricingMessage("Cenník je uložený.");
    } catch (error) {
      setPricingMessage(error instanceof Error ? error.message : "Cenník sa nepodarilo uložiť.");
    } finally {
      setIsPricingSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-bg" aria-hidden="true">
        <img src="/assets/gallery/fitnes-2.jpg" alt="" />
      </div>
      <section className={adminName ? "admin-card admin-editor" : "admin-card"} aria-labelledby="admin-title">
        <img className="admin-logo" src="/assets/brand/hero-gym-logo.png" alt="HERO GYM STUPAVA" />
        <p className="eyebrow">Admin sekcia</p>
        {adminName ? (
          <div className="admin-dashboard">
            <div className="admin-toolbar">
              <div>
                <h1 id="admin-title">Obsah</h1>
                <p>Vitaj, {adminName}. Vyber sekciu, ktorú chceš upraviť.</p>
              </div>
              <button className="button ghost" type="button" onClick={logout}>
                Odhlásiť
              </button>
            </div>
            <div className="admin-section-menu">
              <button
                className={activeAdminSection === "training" ? "is-active" : ""}
                type="button"
                onClick={() => setActiveAdminSection((current) => (current === "training" ? null : "training"))}
              >
                Tréningy
              </button>
              <button
                className={activeAdminSection === "pricing" ? "is-active" : ""}
                type="button"
                onClick={() => setActiveAdminSection((current) => (current === "pricing" ? null : "pricing"))}
              >
                Cenník
              </button>
            </div>

            {activeAdminSection === "training" ? (
              <form className="admin-editor-form" onSubmit={saveTrainingSection}>
                <label>
                  Hlavný text
                  <input
                    value={trainingDraft.heading}
                    onChange={(event) => setTrainingDraft((current) => ({ ...current, heading: event.target.value }))}
                  />
                </label>
                <label>
                  Vedľajší text
                  <textarea
                    value={trainingDraft.body}
                    onChange={(event) => setTrainingDraft((current) => ({ ...current, body: event.target.value }))}
                    rows={4}
                  />
                </label>
                <div className="admin-editor-heading">
                  <h2>Bunky</h2>
                  <button className="button ghost" type="button" onClick={addCard}>
                    <Plus size={18} /> Pridať bunku
                  </button>
                </div>
                <div className="admin-cards-editor">
                  {trainingDraft.cards.map((card, index) => (
                    <article className="admin-card-editor" key={card.id || index}>
                      <div className="admin-card-editor-head">
                        <strong>Bunka {index + 1}</strong>
                        <button type="button" onClick={() => removeCard(index)} aria-label="Odstrániť bunku">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <label>
                        Názov
                        <input
                          value={card.title}
                          onChange={(event) => updateCard(index, { ...card, title: event.target.value })}
                        />
                      </label>
                      <label>
                        Text
                        <textarea
                          value={card.body}
                          onChange={(event) => updateCard(index, { ...card, body: event.target.value })}
                          rows={4}
                        />
                      </label>
                      <label>
                        Ikona
                        <select
                          value={card.icon}
                          onChange={(event) =>
                            updateCard(index, { ...card, icon: event.target.value as keyof typeof iconMap })
                          }
                        >
                          {Object.entries(iconLabels).map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
                {trainingMessage ? <p className="admin-message">{trainingMessage}</p> : null}
                <button className="button primary" disabled={isTrainingSaving || isTrainingLoading} type="submit">
                  <Save size={18} /> {isTrainingSaving ? "Ukladám..." : "Uložiť tréningy"}
                </button>
              </form>
            ) : null}

            {activeAdminSection === "pricing" ? (
              <form className="admin-editor-form" onSubmit={savePricingSection}>
                <label>
                  Hlavný text
                  <input
                    value={pricingDraft.heading}
                    onChange={(event) => setPricingDraft((current) => ({ ...current, heading: event.target.value }))}
                  />
                </label>
                <div className="admin-editor-heading">
                  <h2>Bunky</h2>
                  <button className="button ghost" type="button" onClick={addPricingItem}>
                    <Plus size={18} /> Pridať bunku
                  </button>
                </div>
                <div className="admin-cards-editor">
                  {pricingDraft.items.map((item, index) => (
                    <article className="admin-card-editor" key={item.id || index}>
                      <div className="admin-card-editor-head">
                        <strong>Bunka {index + 1}</strong>
                        <button type="button" onClick={() => removePricingItem(index)} aria-label="Odstrániť bunku">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <label>
                        Typ
                        <input
                          value={item.detail}
                          onChange={(event) => updatePricingItem(index, { ...item, detail: event.target.value })}
                        />
                      </label>
                      <label>
                        Názov
                        <input
                          value={item.label}
                          onChange={(event) => updatePricingItem(index, { ...item, label: event.target.value })}
                        />
                      </label>
                      <label>
                        Hodnota
                        <input
                          value={item.value}
                          onChange={(event) => updatePricingItem(index, { ...item, value: event.target.value })}
                        />
                      </label>
                    </article>
                  ))}
                </div>
                {pricingMessage ? <p className="admin-message">{pricingMessage}</p> : null}
                <button className="button primary" disabled={isPricingSaving || isPricingLoading} type="submit">
                  <Save size={18} /> {isPricingSaving ? "Ukladám..." : "Uložiť cenník"}
                </button>
              </form>
            ) : null}
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
