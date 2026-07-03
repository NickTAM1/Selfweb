import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"
import Button from 'react-bootstrap/Button'
import Home from "./pages/Home.jsx";
import Background from "./pages/Background.jsx";
import Git from "./pages/Git.jsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/background">Background</Link>
        <Link to="/git">Git</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/background" element={<Background />} />
        <Route path="/git" element={<Git />} />
      </Routes>
    </BrowserRouter>
  );
}
