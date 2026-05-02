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

## GitHub prepojenie

Repozitár je lokálne inicializovaný cez git. Na prepojenie s GitHubom treba pridať remote:

```bash
git remote add origin https://github.com/TVOUZIVATELSKE-MENO/hero-gym-stupava.git
git branch -M main
git add .
git commit -m "Create Hero Gym website"
git push -u origin main
```

Pre deploy cez GitHub Pages nastav v repozitári GitHub Pages na zdroj `GitHub Actions` a pridaj workflow
pre build priečinka `dist`, alebo nahraj statický export z `npm run build`.
