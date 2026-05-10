# HERO GYM STUPAVA

Moderná responzívna web stránka pre fitness centrum HERO GYM Stupava.

## Technológie

- Vite
- React
- TypeScript
- Moderné CSS s responzívnym layoutom
- Skrytá admin sekcia na `/admin`
- Lokálne assety z galérie `herogymstupava.sk`

## Lokálne spustenie

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker

Projekt obsahuje samostatný web server a samostatný PostgreSQL server pripravený na budúce funkcie.
Admin login používa samostatný API kontajner a PostgreSQL tabuľku `admin_users`.
Adminer nie je súčasťou tohto compose, počíta sa so spoločným Adminer kontajnerom na externej sieti.

```bash
cp .env.example .env
docker network create db-shared
docker compose up -d --build
```

Web bude dostupný na porte z `APP_PORT`, predvolene `8091`.
V spoločnom Admineri použi server `herogym-db`, používateľa a heslo z `.env`.
Admin sekcia je dostupná iba priamou URL `https://hg.pidiman.sk/admin`; vo verejnej stránke nie je prelinkovaná.
Po prihlásení vie upravovať sekcie `Tréningy`, `Skupinový tréning`, `Cenník`, `Kontakt` a `O nás`.

Ak už máš `.env` vytvorený zo staršej verzie projektu, doplň:

```env
JWT_SECRET=nahodny_retazec_minimalne_32_znakov
ADMIN_USER=admin
ADMIN_PASSWORD=sem_daj_silne_admin_heslo
```

Prvý admin používateľ sa vytvorí automaticky pri štarte API, ak ešte neexistuje.

## Nginx Proxy Manager

Produkčná adresa webu:

```text
https://hg.pidiman.sk
```

Na Docker hoste nechaj publikovaný port z `.env`, napríklad:

```text
APP_PORT=8091
SITE_URL=https://hg.pidiman.sk
```

V Nginx Proxy Manageri na druhej mašine nastav Proxy Host:

```text
Domain Names: hg.pidiman.sk
Scheme: http
Forward Hostname / IP: IP adresa Docker hosta
Forward Port: 8091
SSL: zapnúť certifikát pre hg.pidiman.sk
Force SSL: zapnúť
HTTP/2 Support: zapnúť
```

Databáza sa von nepublikuje. Je dostupná iba v Docker sieťach ako `herogym-db`.
Spoločný Adminer musí byť na rovnakej Docker mašine alebo pripojený do siete nastavenej cez `ADMINER_NETWORK`, predvolene `db-shared`.

## GitHub

Repozitár je pripojený na `https://github.com/pidiman/herogym.git`.
