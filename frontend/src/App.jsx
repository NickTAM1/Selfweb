import { HashRouter, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"
import Button from 'react-bootstrap/Button'
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Git from "./pages/Git.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/background">Background</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/git">Git</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/background" element={<Background />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/git" element={<Git />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}
