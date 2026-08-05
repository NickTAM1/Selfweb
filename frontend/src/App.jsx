import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import WaveBackground from "./components/WaveBackground.jsx";
import useCardGlow from "./hooks/useCardGlow.js";
import useRipple from "./hooks/useRipple.js";
import useScrollDirection from "./hooks/useScrollDirection.js";
import "./App.css";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/background", label: "Background" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

function SegmentedNav({ hidden }) {
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();
  const visibleHoverPath = location.pathname === hoveredPath ? hoveredPath : null;

  return (
    <motion.nav
      aria-label="Primary navigation"
      animate={{ y: hidden ? "-140%" : "0%", opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={() => setHoveredPath(null)}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onMouseEnter={() => setHoveredPath(item.to)}
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <motion.span
                  className="nav-active-pill"
                  layoutId="nav-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              {!isActive && visibleHoverPath === item.to ? (
                <motion.span
                  className="nav-hover-pill"
                  layoutId="nav-hover-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="nav-label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
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
      <SegmentedNav hidden={navHidden} />
      <AnimatedRoutes />
      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Chi Lek (Nick) Tam</p>
      </footer>
    </HashRouter>
  );
}
