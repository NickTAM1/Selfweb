# Chi Lek (Nick) Tam — Portfolio

Personal portfolio site for a Software Developer / Game Systems Programmer. Built with React and a custom "liquid glass" design system, live at **[nicktam1.github.io/Selfweb](https://nicktam1.github.io/Selfweb/)**.

[![Deploy to GitHub Pages](https://github.com/NickTAM1/Selfweb/actions/workflows/deploy.yml/badge.svg)](https://github.com/NickTAM1/Selfweb/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

## What it is

A four-page portfolio (Home, Background, Projects, Contact) showcasing five real projects — UE5 physics and AI systems, a Unity combat prototype, an FFT ocean-wave simulator, a Rust desktop dev tool, and a full-stack shopping platform. Instead of a generic template, it has a few things built by hand:

- A custom **WebGL background** that reacts to the cursor
- **In-page project modals** (native `<dialog>`, not a popup) with a video + image gallery per project
- A glass UI with cursor-tracking hover glow, bidirectional scroll reveals, and spring-based open/close and page-transition animations (via [Motion](https://motion.dev))
- A working **contact form** ([Web3Forms](https://web3forms.com)) that falls back to a `mailto:` link if not configured — never silently broken

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

## Configuration (optional)

The contact form sends directly via Web3Forms if configured, otherwise it opens the visitor's email client. To enable direct sending, copy `frontend/.env.example` to `frontend/.env` and add a free access key from [web3forms.com](https://web3forms.com) (or set `VITE_WEB3FORMS_ACCESS_KEY` as a GitHub Actions repo secret for the deployed build).

## Deploying

Deployment is automatic: pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages. No manual steps needed.

## Project structure

```
frontend/   React + Vite app (the actual site)
  src/pages/       Home, Background, Projects, Contact
  src/components/  ProjectModal, MediaGallery, WaveBackground, IconPopover, etc.
```

## License

The code in this repository is licensed under the [MIT License](LICENSE). This does not extend to Chi Lek Tam's name, résumé, project write-ups, or the screenshots/video in `frontend/public/media/` — that content is personal and shown here for portfolio purposes, not for reuse.
