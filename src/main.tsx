import { StrictMode, useEffect, useMemo, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Apple,
  ArrowUpRight,
  AtSign,
  Award,
  Bath,
  Bike,
  Brain,
  CalendarDays,
  Clock,
  Coffee,
  Droplets,
  Dumbbell,
  ExternalLink,
  Facebook,
  Flame,
  Footprints,
  Globe,
  Heart,
  HeartPulse,
  Instagram,
  Leaf,
  Link as LinkIcon,
  Linkedin,
  LockKeyhole,
  Mail,
  MailOpen,
  MapPin,
  Medal,
  Menu,
  MessageCircle,
  Mountain,
  Music,
  Navigation,
  Phone,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trash2,
  Trophy,
  Twitter,
  User,
  Users,
  Weight,
  Wind,
  X,
  Youtube,
  Zap,
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
  heart: Heart,
  heartPulse: HeartPulse,
  activity: Activity,
  bike: Bike,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  flame: Flame,
  target: Target,
  timer: Timer,
  clock: Clock,
  users: Users,
  user: User,
  zap: Zap,
  music: Music,
  coffee: Coffee,
  droplets: Droplets,
  bath: Bath,
  leaf: Leaf,
  apple: Apple,
  brain: Brain,
  shield: ShieldCheck,
  wind: Wind,
  mountain: Mountain,
  footprints: Footprints,
  weight: Weight,
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

type GroupTrainingSection = {
  eyebrow: string;
  heading: string;
  body: string;
  schedulePrimary: string;
  scheduleSecondary: string;
  price: string;
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

const contactIconMap = {
  phone: Phone,
  map: MapPin,
  calendar: CalendarDays,
  instagram: Instagram,
  facebook: Facebook,
  message: MessageCircle,
  mail: Mail,
  mailOpen: MailOpen,
  send: Send,
  globe: Globe,
  link: LinkIcon,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  atSign: AtSign,
  externalLink: ExternalLink,
  navigation: Navigation,
  clock: Clock,
  smartphone: Smartphone,
  music: Music,
} as const;

type ContactItem = {
  id?: number;
  label: string;
  href: string;
  icon: keyof typeof contactIconMap;
  sortOrder?: number;
};

type ContactSection = {
  heading: string;
  notice: string;
  items: ContactItem[];
};

type AboutSection = {
  eyebrow: string;
  heading: string;
  body: string;
};

type AdminRole = "admin" | "moderator";

type AdminUser = {
  id: number;
  username: string;
  role: AdminRole;
  createdAt?: string;
};

const iconLabels: Record<keyof typeof iconMap, string> = {
  dumbbell: "Činka",
  calendar: "Kalendár",
  sparkles: "Regenerácia",
  sun: "Slnko",
  heart: "Srdce",
  heartPulse: "Tep srdca",
  activity: "Aktivita",
  bike: "Bicykel",
  trophy: "Trofej",
  medal: "Medaila",
  award: "Ocenenie",
  flame: "Plameň",
  target: "Cieľ",
  timer: "Časomiera",
  clock: "Hodiny",
  users: "Skupina",
  user: "Osoba",
  zap: "Energia",
  music: "Hudba",
  coffee: "Káva",
  droplets: "Hydratácia",
  bath: "Wellness",
  leaf: "List",
  apple: "Výživa",
  brain: "Mozog",
  shield: "Ochrana",
  wind: "Vietor",
  mountain: "Hora",
  footprints: "Stopy",
  weight: "Závažie",
};

const contactIconLabels: Record<keyof typeof contactIconMap, string> = {
  phone: "Telefón",
  map: "Mapa",
  calendar: "Kalendár",
  instagram: "Instagram",
  facebook: "Facebook",
  message: "Správa",
  mail: "E-mail",
  mailOpen: "E-mail otvorený",
  send: "Odoslať",
  globe: "Web",
  link: "Odkaz",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  atSign: "Zavináč",
  externalLink: "Externý odkaz",
  navigation: "Navigácia",
  clock: "Hodiny",
  smartphone: "Mobil",
  music: "Hudba",
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

const defaultGroupTrainingSection: GroupTrainingSection = {
  eyebrow: "Skupinový tréning",
  heading: "Kruhový tréning pre ženy",
  body: "Kruhový intervalový tréning zameraný na problémové partie, vhodný pre každú výkonnostnú kategóriu.",
  schedulePrimary: "PON, ŠTV 17:15",
  scheduleSecondary: "NE 7:30",
  price: "Tréning 8€",
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

const defaultContactSection: ContactSection = {
  heading: "Príď si zacvičiť alebo si rezervuj tréning online.",
  notice: "Prosím, noste si vlastný visiaci zámok na skrinku.",
  items: [
    { label: "0910 171 222", href: "tel:+421910171222", icon: "phone" },
    {
      label: "Železničná 1043, Stupava",
      href: "https://maps.google.com/?q=Železničná%201043%2C%20Stupava",
      icon: "map",
    },
    { label: "Rezervačný systém", href: reservationUrl, icon: "calendar" },
    { label: "Instagram", href: "https://www.instagram.com/herogymstupava/", icon: "instagram" },
    { label: "Facebook", href: "https://www.facebook.com/herogymstupava/", icon: "facebook" },
    { label: "Napísať správu", href: "sms:+421910171222", icon: "message" },
  ],
};

const defaultAboutSection: AboutSection = {
  eyebrow: "O nás",
  heading: "HERO GYM STUPAVA",
  body: [
    "Z malého káčatka Cevagym, ktoré dovŕšilo 5 rokov sa stala dospelá labuť HERO GYM.",
    "Sme radi že Vás môžme privítať u nás „DOMA“, pretože dávame do toho všetko a vždy budeme, kým tu budete vy pre nás.",
    "Tešíme sa na každú jednu Vašu návštevu. Radi Vám spravíme voňavú kávu.",
    "Máte na výber z rôznych predtréningových ale aj potréningových nápojov.",
  ].join("\n\n"),
};

function Root() {
  const isAdminPage = window.location.pathname.replace(/\/+$/, "") === "/admin";

  if (isAdminPage) {
    return <AdminPage />;
  }

  return <MarketingSite />;
}

function getMapEmbedUrl(href: string): string | null {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href);
    if (!url.hostname.includes("google")) {
      return null;
    }
    url.searchParams.set("output", "embed");
    return url.toString();
  } catch {
    return null;
  }
}

function MarketingSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("Všetko");
  const [trainingSection, setTrainingSection] = useState<TrainingSection>(defaultTrainingSection);
  const [groupTrainingSection, setGroupTrainingSection] =
    useState<GroupTrainingSection>(defaultGroupTrainingSection);
  const [pricingSection, setPricingSection] = useState<PricingSection>(defaultPricingSection);
  const [contactSection, setContactSection] = useState<ContactSection>(defaultContactSection);
  const [aboutSection, setAboutSection] = useState<AboutSection>(defaultAboutSection);
  const tags = useMemo(() => ["Všetko", ...Array.from(new Set(gallery.map((item) => item.tag)))], []);
  const filteredGallery = activeTag === "Všetko" ? gallery : gallery.filter((item) => item.tag === activeTag);

  useEffect(() => {
    fetch("/api/training-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: TrainingSection) => setTrainingSection(data))
      .catch(() => setTrainingSection(defaultTrainingSection));
  }, []);

  useEffect(() => {
    fetch("/api/group-training-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: GroupTrainingSection) => setGroupTrainingSection(data))
      .catch(() => setGroupTrainingSection(defaultGroupTrainingSection));
  }, []);

  useEffect(() => {
    fetch("/api/pricing-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: PricingSection) => setPricingSection(data))
      .catch(() => setPricingSection(defaultPricingSection));
  }, []);

  useEffect(() => {
    fetch("/api/contact-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ContactSection) => setContactSection(data))
      .catch(() => setContactSection(defaultContactSection));
  }, []);

  useEffect(() => {
    fetch("/api/about-section")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: AboutSection) => setAboutSection(data))
      .catch(() => setAboutSection(defaultAboutSection));
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
          <a href="#o-nas">O nás</a>
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
            <p className="eyebrow">{groupTrainingSection.eyebrow}</p>
            <h2>{groupTrainingSection.heading}</h2>
            <p>{groupTrainingSection.body}</p>
          </div>
          <div className="schedule">
            <span>{groupTrainingSection.schedulePrimary}</span>
            <span>{groupTrainingSection.scheduleSecondary}</span>
            <strong>{groupTrainingSection.price}</strong>
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

        <section className="section about-section" id="o-nas">
          <div>
            <p className="eyebrow">{aboutSection.eyebrow}</p>
            <h2>{aboutSection.heading}</h2>
          </div>
          <div className="about-copy">
            {aboutSection.body
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter((paragraph) => paragraph.length > 0)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </section>

        <section className="section contact-section" id="kontakt">
          <div>
            <p className="eyebrow">Kontakt</p>
            <h2>{contactSection.heading}</h2>
            <p className="notice">{contactSection.notice}</p>
          </div>
          <div className="contact-content">
            <div className="contact-panel">
              {contactSection.items.map((item) => {
                const Icon = contactIconMap[item.icon] || Phone;
                const external = item.href.startsWith("http");
                return (
                  <a href={item.href} key={item.id || item.label} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
                    <Icon size={20} /> {item.label}
                  </a>
                );
              })}
            </div>
            {(() => {
              const mapItem = contactSection.items.find((item) => item.icon === "map");
              const mapEmbedUrl = mapItem ? getMapEmbedUrl(mapItem.href) : null;
              if (!mapEmbedUrl) {
                return null;
              }
              return (
                <div className="contact-map">
                  <iframe
                    src={mapEmbedUrl}
                    title={mapItem?.label || "Mapa"}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              );
            })()}
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
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");
  const [adminId, setAdminId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [trainingDraft, setTrainingDraft] = useState<TrainingSection>(defaultTrainingSection);
  const [groupTrainingDraft, setGroupTrainingDraft] =
    useState<GroupTrainingSection>(defaultGroupTrainingSection);
  const [pricingDraft, setPricingDraft] = useState<PricingSection>(defaultPricingSection);
  const [contactDraft, setContactDraft] = useState<ContactSection>(defaultContactSection);
  const [aboutDraft, setAboutDraft] = useState<AboutSection>(defaultAboutSection);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<AdminRole>("moderator");
  const [userPasswords, setUserPasswords] = useState<Record<number, string>>({});
  const [usersMessage, setUsersMessage] = useState("");
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [activeAdminSection, setActiveAdminSection] =
    useState<"training" | "groupTraining" | "pricing" | "contact" | "about" | "users" | null>(null);
  const [trainingMessage, setTrainingMessage] = useState("");
  const [groupTrainingMessage, setGroupTrainingMessage] = useState("");
  const [pricingMessage, setPricingMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [aboutMessage, setAboutMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainingLoading, setIsTrainingLoading] = useState(false);
  const [isTrainingSaving, setIsTrainingSaving] = useState(false);
  const [isGroupTrainingLoading, setIsGroupTrainingLoading] = useState(false);
  const [isGroupTrainingSaving, setIsGroupTrainingSaving] = useState(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPricingSaving, setIsPricingSaving] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isContactSaving, setIsContactSaving] = useState(false);
  const [isAboutLoading, setIsAboutLoading] = useState(false);
  const [isAboutSaving, setIsAboutSaving] = useState(false);

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
      .then((data: { username: string; role: AdminRole; id?: number }) => {
        setAdminName(data.username);
        setAdminRole(data.role);
        if (typeof data.id === "number") {
          setAdminId(data.id);
        }
      })
      .catch(() => localStorage.removeItem("herogym_admin_token"));
  }, []);

  useEffect(() => {
    if (adminName) {
      void loadTrainingSection();
      void loadGroupTrainingSection();
      void loadPricingSection();
      void loadContactSection();
      void loadAboutSection();
      if (adminRole === "admin") {
        void loadUsers();
      }
    }
  }, [adminName, adminRole]);

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

  async function loadGroupTrainingSection() {
    setIsGroupTrainingLoading(true);
    setGroupTrainingMessage("");

    try {
      const response = await fetch("/api/admin/group-training-section", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Skupinový tréning sa nepodarilo načítať.");
      }

      setGroupTrainingDraft(data);
    } catch (error) {
      setGroupTrainingMessage(error instanceof Error ? error.message : "Skupinový tréning sa nepodarilo načítať.");
    } finally {
      setIsGroupTrainingLoading(false);
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

  async function loadContactSection() {
    setIsContactLoading(true);
    setContactMessage("");

    try {
      const response = await fetch("/api/admin/contact-section", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kontakt sa nepodarilo načítať.");
      }

      setContactDraft(data);
    } catch (error) {
      setContactMessage(error instanceof Error ? error.message : "Kontakt sa nepodarilo načítať.");
    } finally {
      setIsContactLoading(false);
    }
  }

  async function loadAboutSection() {
    setIsAboutLoading(true);
    setAboutMessage("");

    try {
      const response = await fetch("/api/admin/about-section", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sekciu O nás sa nepodarilo načítať.");
      }

      setAboutDraft(data);
    } catch (error) {
      setAboutMessage(error instanceof Error ? error.message : "Sekciu O nás sa nepodarilo načítať.");
    } finally {
      setIsAboutLoading(false);
    }
  }

  async function loadUsers() {
    setIsUsersLoading(true);
    setUsersMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Používateľov sa nepodarilo načítať.");
      }

      setUsers(data);
    } catch (error) {
      setUsersMessage(error instanceof Error ? error.message : "Používateľov sa nepodarilo načítať.");
    } finally {
      setIsUsersLoading(false);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingUser(true);
    setUsersMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUserName, password: newUserPassword, role: newUserRole }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Používateľa sa nepodarilo vytvoriť.");
      }

      setUsers((current) => [...current, data]);
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("moderator");
      setUsersMessage(`Používateľ ${data.username} bol vytvorený.`);
    } catch (error) {
      setUsersMessage(error instanceof Error ? error.message : "Používateľa sa nepodarilo vytvoriť.");
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function updateUser(id: number, payload: { password?: string; role?: AdminRole }) {
    setUpdatingUserId(id);
    setUsersMessage("");

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Používateľa sa nepodarilo upraviť.");
      }

      setUsers((current) => current.map((user) => (user.id === id ? data : user)));
      setUserPasswords((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setUsersMessage(`Používateľ ${data.username} bol upravený.`);
    } catch (error) {
      setUsersMessage(error instanceof Error ? error.message : "Používateľa sa nepodarilo upraviť.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function deleteUser(id: number) {
    if (!window.confirm("Naozaj zmazať tohto používateľa?")) {
      return;
    }

    setUpdatingUserId(id);
    setUsersMessage("");

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = response.status === 204 ? { ok: true } : await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Používateľa sa nepodarilo zmazať.");
      }

      setUsers((current) => current.filter((user) => user.id !== id));
      setUserPasswords((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setUsersMessage("Používateľ bol zmazaný.");
    } catch (error) {
      setUsersMessage(error instanceof Error ? error.message : "Používateľa sa nepodarilo zmazať.");
    } finally {
      setUpdatingUserId(null);
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
      setAdminRole(data.role);
      if (typeof data.id === "number") {
        setAdminId(data.id);
      }
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
    setAdminRole("moderator");
    setAdminId(null);
    setUsername("");
    setPassword("");
    setActiveAdminSection(null);
    setUsers([]);
    setUserPasswords({});
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

  async function saveGroupTrainingSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGroupTrainingSaving(true);
    setGroupTrainingMessage("");

    try {
      const response = await fetch("/api/admin/group-training-section", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupTrainingDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Skupinový tréning sa nepodarilo uložiť.");
      }

      setGroupTrainingDraft(data);
      setGroupTrainingMessage("Skupinový tréning je uložený.");
    } catch (error) {
      setGroupTrainingMessage(error instanceof Error ? error.message : "Skupinový tréning sa nepodarilo uložiť.");
    } finally {
      setIsGroupTrainingSaving(false);
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

  function updateContactItem(index: number, nextItem: ContactItem) {
    setContactDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)),
    }));
  }

  function addContactItem() {
    setContactDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          label: "Nový kontakt",
          href: "https://",
          icon: "phone",
        },
      ],
    }));
  }

  function removeContactItem(index: number) {
    setContactDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function saveContactSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsContactSaving(true);
    setContactMessage("");

    try {
      const response = await fetch("/api/admin/contact-section", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kontakt sa nepodarilo uložiť.");
      }

      setContactDraft(data);
      setContactMessage("Kontakt je uložený.");
    } catch (error) {
      setContactMessage(error instanceof Error ? error.message : "Kontakt sa nepodarilo uložiť.");
    } finally {
      setIsContactSaving(false);
    }
  }

  async function saveAboutSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAboutSaving(true);
    setAboutMessage("");

    try {
      const response = await fetch("/api/admin/about-section", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aboutDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sekciu O nás sa nepodarilo uložiť.");
      }

      setAboutDraft(data);
      setAboutMessage("Sekcia O nás je uložená.");
    } catch (error) {
      setAboutMessage(error instanceof Error ? error.message : "Sekciu O nás sa nepodarilo uložiť.");
    } finally {
      setIsAboutSaving(false);
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
                className={activeAdminSection === "groupTraining" ? "is-active" : ""}
                type="button"
                onClick={() =>
                  setActiveAdminSection((current) => (current === "groupTraining" ? null : "groupTraining"))
                }
              >
                Skupinový tréning
              </button>
              <button
                className={activeAdminSection === "pricing" ? "is-active" : ""}
                type="button"
                onClick={() => setActiveAdminSection((current) => (current === "pricing" ? null : "pricing"))}
              >
                Cenník
              </button>
              <button
                className={activeAdminSection === "contact" ? "is-active" : ""}
                type="button"
                onClick={() => setActiveAdminSection((current) => (current === "contact" ? null : "contact"))}
              >
                Kontakt
              </button>
              <button
                className={activeAdminSection === "about" ? "is-active" : ""}
                type="button"
                onClick={() => setActiveAdminSection((current) => (current === "about" ? null : "about"))}
              >
                O nás
              </button>
              {adminRole === "admin" ? (
                <button
                  className={activeAdminSection === "users" ? "is-active" : ""}
                  type="button"
                  onClick={() => setActiveAdminSection((current) => (current === "users" ? null : "users"))}
                >
                  Používatelia
                </button>
              ) : null}
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

            {activeAdminSection === "groupTraining" ? (
              <form className="admin-editor-form" onSubmit={saveGroupTrainingSection}>
                <label>
                  Malý nadpis
                  <input
                    value={groupTrainingDraft.eyebrow}
                    onChange={(event) =>
                      setGroupTrainingDraft((current) => ({ ...current, eyebrow: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Hlavný nadpis
                  <input
                    value={groupTrainingDraft.heading}
                    onChange={(event) =>
                      setGroupTrainingDraft((current) => ({ ...current, heading: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Text
                  <textarea
                    value={groupTrainingDraft.body}
                    onChange={(event) =>
                      setGroupTrainingDraft((current) => ({ ...current, body: event.target.value }))
                    }
                    rows={4}
                  />
                </label>
                <div className="admin-cards-editor">
                  <label>
                    Prvý čas
                    <input
                      value={groupTrainingDraft.schedulePrimary}
                      onChange={(event) =>
                        setGroupTrainingDraft((current) => ({ ...current, schedulePrimary: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Druhý čas
                    <input
                      value={groupTrainingDraft.scheduleSecondary}
                      onChange={(event) =>
                        setGroupTrainingDraft((current) => ({ ...current, scheduleSecondary: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <label>
                  Cena
                  <input
                    value={groupTrainingDraft.price}
                    onChange={(event) => setGroupTrainingDraft((current) => ({ ...current, price: event.target.value }))}
                  />
                </label>
                {groupTrainingMessage ? <p className="admin-message">{groupTrainingMessage}</p> : null}
                <button
                  className="button primary"
                  disabled={isGroupTrainingSaving || isGroupTrainingLoading}
                  type="submit"
                >
                  <Save size={18} /> {isGroupTrainingSaving ? "Ukladám..." : "Uložiť skupinový tréning"}
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

            {activeAdminSection === "contact" ? (
              <form className="admin-editor-form" onSubmit={saveContactSection}>
                <label>
                  Hlavný text
                  <input
                    value={contactDraft.heading}
                    onChange={(event) => setContactDraft((current) => ({ ...current, heading: event.target.value }))}
                  />
                </label>
                <label>
                  Poznámka
                  <input
                    value={contactDraft.notice}
                    onChange={(event) => setContactDraft((current) => ({ ...current, notice: event.target.value }))}
                  />
                </label>
                <div className="admin-editor-heading">
                  <h2>Bunky</h2>
                  <button className="button ghost" type="button" onClick={addContactItem}>
                    <Plus size={18} /> Pridať bunku
                  </button>
                </div>
                <div className="admin-cards-editor">
                  {contactDraft.items.map((item, index) => (
                    <article className="admin-card-editor" key={item.id || index}>
                      <div className="admin-card-editor-head">
                        <strong>Bunka {index + 1}</strong>
                        <button type="button" onClick={() => removeContactItem(index)} aria-label="Odstrániť bunku">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <label>
                        Text
                        <input
                          value={item.label}
                          onChange={(event) => updateContactItem(index, { ...item, label: event.target.value })}
                        />
                      </label>
                      <label>
                        Odkaz
                        <input
                          value={item.href}
                          onChange={(event) => updateContactItem(index, { ...item, href: event.target.value })}
                        />
                      </label>
                      <label>
                        Ikona
                        <select
                          value={item.icon}
                          onChange={(event) =>
                            updateContactItem(index, { ...item, icon: event.target.value as keyof typeof contactIconMap })
                          }
                        >
                          {Object.entries(contactIconLabels).map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
                {contactMessage ? <p className="admin-message">{contactMessage}</p> : null}
                <button className="button primary" disabled={isContactSaving || isContactLoading} type="submit">
                  <Save size={18} /> {isContactSaving ? "Ukladám..." : "Uložiť kontakt"}
                </button>
              </form>
            ) : null}

            {activeAdminSection === "about" ? (
              <form className="admin-editor-form" onSubmit={saveAboutSection}>
                <label>
                  Malý nadpis
                  <input
                    value={aboutDraft.eyebrow}
                    onChange={(event) => setAboutDraft((current) => ({ ...current, eyebrow: event.target.value }))}
                  />
                </label>
                <label>
                  Hlavný nadpis
                  <input
                    value={aboutDraft.heading}
                    onChange={(event) => setAboutDraft((current) => ({ ...current, heading: event.target.value }))}
                  />
                </label>
                <label>
                  Text
                  <textarea
                    value={aboutDraft.body}
                    onChange={(event) => setAboutDraft((current) => ({ ...current, body: event.target.value }))}
                    rows={10}
                  />
                </label>
                {aboutMessage ? <p className="admin-message">{aboutMessage}</p> : null}
                <button className="button primary" disabled={isAboutSaving || isAboutLoading} type="submit">
                  <Save size={18} /> {isAboutSaving ? "Ukladám..." : "Uložiť O nás"}
                </button>
              </form>
            ) : null}

            {activeAdminSection === "users" && adminRole === "admin" ? (
              <div className="admin-editor-form">
                <form className="admin-editor-form" onSubmit={createUser}>
                  <div className="admin-editor-heading">
                    <h2>Pridať používateľa</h2>
                  </div>
                  <label>
                    Meno
                    <input
                      value={newUserName}
                      onChange={(event) => setNewUserName(event.target.value)}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Heslo
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(event) => setNewUserPassword(event.target.value)}
                      autoComplete="new-password"
                    />
                  </label>
                  <label>
                    Rola
                    <select
                      value={newUserRole}
                      onChange={(event) => setNewUserRole(event.target.value as AdminRole)}
                    >
                      <option value="moderator">Moderátor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <button className="button primary" disabled={isCreatingUser} type="submit">
                    <Plus size={18} /> {isCreatingUser ? "Pridávam..." : "Pridať používateľa"}
                  </button>
                </form>

                <div className="admin-editor-heading">
                  <h2>Existujúci používatelia</h2>
                </div>
                {usersMessage ? <p className="admin-message">{usersMessage}</p> : null}
                <div className="admin-cards-editor">
                  {isUsersLoading && users.length === 0 ? <p>Načítavam...</p> : null}
                  {users.map((user) => {
                    const isSelf = adminId === user.id;
                    const isBusy = updatingUserId === user.id;
                    return (
                      <article className="admin-card-editor" key={user.id}>
                        <div className="admin-card-editor-head">
                          <strong>
                            {user.username} {isSelf ? "(ja)" : null}
                          </strong>
                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            aria-label="Zmazať používateľa"
                            disabled={isSelf || isBusy}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <label>
                          Rola
                          <select
                            value={user.role}
                            disabled={isSelf || isBusy}
                            onChange={(event) =>
                              updateUser(user.id, { role: event.target.value as AdminRole })
                            }
                          >
                            <option value="moderator">Moderátor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                        <label>
                          Nové heslo
                          <input
                            type="password"
                            value={userPasswords[user.id] || ""}
                            onChange={(event) =>
                              setUserPasswords((current) => ({ ...current, [user.id]: event.target.value }))
                            }
                            autoComplete="new-password"
                          />
                        </label>
                        <button
                          className="button primary"
                          type="button"
                          disabled={isBusy || !(userPasswords[user.id] || "").trim()}
                          onClick={() =>
                            updateUser(user.id, { password: userPasswords[user.id] || "" })
                          }
                        >
                          <Save size={18} /> {isBusy ? "Ukladám..." : "Zmeniť heslo"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
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
