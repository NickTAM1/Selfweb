# Chi Lek (Nick) Tam — Portfolio

Personal portfolio site for a Software Developer / Game Systems Programmer. Built with React and a custom "liquid glass" design system, live at **[nicktam1.github.io/Selfweb](https://nicktam1.github.io/Selfweb/)**.

[![Deploy to GitHub Pages](https://github.com/NickTAM1/Selfweb/actions/workflows/deploy.yml/badge.svg)](https://github.com/NickTAM1/Selfweb/actions/workflows/deploy.yml)

## What it is

A four-page portfolio (Home, Background, Projects, Contact) showing real engineering work: UE5 physics and AI systems, a Unity combat prototype, and an FFT ocean-wave simulator. Instead of a generic template, it has a few things built by hand:

- A custom **WebGL background** that reacts to the cursor
- **In-page project modals** (native `<dialog>`, not a popup) with a video + image gallery for each project
- A glass UI with cursor-tracking hover glow and spring-based open/close animations (via [Motion](https://motion.dev))

## Tech stack

React 19 · Vite 8 · React Router · Motion — deployed as a static site to GitHub Pages via GitHub Actions on every push to `main`.

## Running it locally

Requires [Node.js](https://nodejs.org) 20+.

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173/Selfweb/`.

## Other commands

```bash
npm run build     # production build -> frontend/dist
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

## Deploying

Deployment is automatic: pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages. No manual steps needed.

## Project structure

```
frontend/   React + Vite app (the actual site)
  src/pages/       Home, Background, Projects, Contact
  src/components/  ProjectModal, MediaGallery, WaveBackground, etc.
```
