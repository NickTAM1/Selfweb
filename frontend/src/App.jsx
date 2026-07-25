import { useEffect } from "react";
import { HashRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import WaveBackground from "./components/WaveBackground.jsx";
import IconPopover from "./components/IconPopover.jsx";
import { GithubIcon, LinkedinIcon } from "./components/icons.jsx";
import useCardGlow from "./hooks/useCardGlow.js";
import useRipple from "./hooks/useRipple.js";
import useScrollDirection from "./hooks/useScrollDirection.js";
import "./App.css";

const GITHUB_ACCOUNTS = [
  { label: "NickTAM1", href: "https://github.com/NickTAM1" },
  { label: "HUKLIA", href: "https://github.com/HUKLIA" },
];

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

  const initial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 };
  const animate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const exit = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 };
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

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
  // Hides the nav on scroll-down (past a small threshold), reveals it again
  // on any scroll-up, and always shows it near the top of the page. Purely a
  // window.scrollY watcher -- see the hook for why it never interacts with
  // ProjectModal's body scroll-lock.
  const navHidden = useScrollDirection();

  return (
    <HashRouter>
      <WaveBackground />
      <motion.nav
        animate={{ y: navHidden ? "-140%" : "0%", opacity: navHidden ? 0 : 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
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
      </motion.nav>
      <AnimatedRoutes />
      <footer className="site-footer">
        <div className="footer-links">
          <IconPopover icon={<GithubIcon />} label="GitHub" items={GITHUB_ACCOUNTS} />
          <motion.a
            className="btn-glass btn-link btn-icon"
            href="https://www.linkedin.com/in/chilek-tam-huzi"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            data-tooltip="LinkedIn"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
          >
            <LinkedinIcon />
          </motion.a>
        </div>
        <p>&copy; {new Date().getFullYear()} Chi Lek (Nick) Tam</p>
      </footer>
    </HashRouter>
  );
}
