import { useEffect } from "react";
import { HashRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import WaveBackground from "./components/WaveBackground.jsx";
import useCardGlow from "./hooks/useCardGlow.js";
import useRipple from "./hooks/useRipple.js";
import "./App.css";

const ICON_PATHS = {
  github:
    "M12 2a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 9.75h5.15V21H2.4V9.75Zm7.9 0h4.93v1.54h.07c.69-1.24 2.37-2.55 4.87-2.55 5.2 0 6.16 3.28 6.16 7.54V21H21v-5.34c0-1.27-.02-2.9-1.85-2.9-1.85 0-2.14 1.36-2.14 2.81V21h-5.7V9.75Z",
};

function Icon({ name }) {
  return (
    <svg
      className="btn-link-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path fill="currentColor" d={ICON_PATHS[name]} />
    </svg>
  );
}

function navLinkClass({ isActive }) {
  return isActive ? "active" : "";
}

/**
 * Renders the routed page content and animates between routes with a fade +
 * slide. Must live inside <HashRouter> since it calls useLocation(). nav,
 * footer, WaveBackground and the card-glow/ripple hooks all stay outside this
 * component (see App below) so they persist untouched across navigation --
 * only the page content itself animates.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Scroll to top on every route change so a newly-navigated-to page always
  // starts at the top instead of wherever the previous page's scroll was.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const initial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 };
  const animate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };
  const exit = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 };
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.16, 1, 0.3, 1] };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="route-viewport"
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/background" element={<Background />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  // One shared pointermove listener drives the cursor-tracking glow on every
  // .box / .project-card-compact card across all pages -- see the hook for
  // why this lives at the app shell level instead of per-card.
  useCardGlow();
  // One shared pointerdown listener drives the click "bubble" ripple on every
  // glass button across all pages -- see the hook for why it's delegated
  // instead of wired per button.
  useRipple();

  return (
    <HashRouter>
      <WaveBackground />
      <nav>
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/background" className={navLinkClass}>
          Background
        </NavLink>
        <NavLink to="/projects" className={navLinkClass}>
          Projects
        </NavLink>
        <NavLink to="/contact" className={navLinkClass}>
          Contact
        </NavLink>
      </nav>
      <AnimatedRoutes />
      <footer className="site-footer">
        <div className="footer-links">
          <a
            className="btn-glass btn-link btn-icon"
            href="https://github.com/NickTAM1"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub (NickTAM1)"
            data-tooltip="GitHub (NickTAM1)"
          >
            <Icon name="github" />
          </a>
          <a
            className="btn-glass btn-link btn-icon"
            href="https://github.com/HUKLIA"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub (HUKLIA)"
            data-tooltip="GitHub (HUKLIA)"
          >
            <Icon name="github" />
          </a>
          <a
            className="btn-glass btn-link btn-icon"
            href="https://www.linkedin.com/in/chilek-tam-huzi"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            data-tooltip="LinkedIn"
          >
            <Icon name="linkedin" />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} Chi Lek (Nick) Tam</p>
      </footer>
    </HashRouter>
  );
}
