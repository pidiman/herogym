# HERO GYM STUPAVA

Moderná responzívna web stránka pre fitness centrum HERO GYM Stupava.

## Technológie

- Vite
- React
- TypeScript
- Moderné CSS s responzívnym layoutom
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
Adminer nie je súčasťou tohto compose, počíta sa so spoločným Adminer kontajnerom na externej sieti.

```bash
cp .env.example .env
docker network create adminer
docker compose up -d --build
```

Web bude dostupný na porte z `APP_PORT`, predvolene `8091`.
V spoločnom Admineri použi server `herogym-db`, používateľa a heslo z `.env`.

## GitHub

Repozitár je pripojený na `https://github.com/pidiman/herogym.git`.
