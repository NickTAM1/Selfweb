import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import WaveBackground from "./components/WaveBackground.jsx";
import "./App.css";

function navLinkClass({ isActive }) {
  return isActive ? "active" : "";
}

export default function App() {
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/background" element={<Background />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://github.com/NickTAM1" target="_blank" rel="noreferrer">
            github.com/NickTAM1
          </a>
          <a href="https://github.com/HUKLIA" target="_blank" rel="noreferrer">
            github.com/HUKLIA
          </a>
          <a
            href="https://www.linkedin.com/in/chilek-tam-huzi"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/chilek-tam-huzi
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} Chi Lek (Nick) Tam</p>
      </footer>
    </HashRouter>
  );
}
