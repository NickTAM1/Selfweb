import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import StatStrip from "../components/StatStrip.jsx";
import Marquee from "../components/Marquee.jsx";

const LOOKING_FOR = [
  "Backend Development",
  "Web Development",
  "App Development",
  "Software Development",
  "Gameplay Development",
  "Simulation Development",
  "Computer Graphics Development",
];

const SKILL_GROUPS = [
  {
    title: "Languages",
    skills: ["C++", "C#", "Java", "Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  },
  {
    title: "Engines & App Dev",
    skills: ["Unreal Engine (UE5)", "Unity", "UE5 State Tree", "Mobile App Development", "Firebase / REST APIs"],
  },
  {
    title: "Tools & Systems",
    skills: [
      "Git",
      "VS Code",
      "Rider",
      "IntelliJ IDEA",
      "Visual Studio",
      "Physics Simulation",
      "FFT & Phillips Spectrum",
      "Data Analysis",
    ],
  },
];

const STATS = [
  { value: "4", label: "LANGUAGES SPOKEN" },
  { value: "3", label: "SHIPPED PROJECTS" },
  { value: "N1", label: "JLPT (JAPANESE)" },
  { value: "BSc", label: "COMPUTING" },
];

const ALL_SKILLS = SKILL_GROUPS.flatMap((group) => group.skills);
const MARQUEE_SPLIT = Math.ceil(ALL_SKILLS.length / 2);
const MARQUEE_ROW_1 = ALL_SKILLS.slice(0, MARQUEE_SPLIT);
const MARQUEE_ROW_2 = ALL_SKILLS.slice(MARQUEE_SPLIT);

const LANGUAGES = [
  { name: "Cantonese", level: "Native" },
  { name: "Mandarin", level: "Fluent" },
  {
    name: "English",
    level: "Professional working proficiency",
    detail: "VFS ECA Program · GPA 79.52/100",
  },
  {
    name: "Japanese",
    level: "Proficient",
    detail: "JET Academy 2023–2024 · JLPT N1, score 119",
  },
];

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <span className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          <span className="mono-label accent">Open to work &middot; Remote worldwide</span>
        </span>
        <span className="hero-eyebrow">Junior Software Developer</span>
        <h1>Chi Lek (Nick) Tam</h1>
        <p className="hero-pitch">
          Full-stack developer who also builds game systems &mdash; UE5 physics
          and AI, plus web, mobile, and backend. I build the parts under the
          hood and figure out why they break.
        </p>
        <div className="hero-cta">
          <Link className="btn-glass btn-primary" to="/projects">
            View Projects
          </Link>
          <a className="btn-glass" href="/Selfweb/resume.pdf" target="_blank" rel="noreferrer">
            Résumé
          </a>
          <Link className="btn-glass" to="/contact">
            Contact
          </Link>
        </div>
        <p className="hero-status">
          Based in Macau &middot; Open to remote software roles worldwide
        </p>
      </div>

      <Reveal index={0}>
        <StatStrip stats={STATS} />
      </Reveal>

      <Reveal className="box" index={1}>
        <h2>About</h2>
        <p>
          Junior Software Developer with a BSc in Computing (Macao Polytechnic
          University) and recent full-stack training from Vancouver Film
          School, comfortable across multiple languages and platforms. Brings
          enterprise IT experience from the gaming industry (Melco Resorts,
          casino floor systems), plus standout engine-level work: UE5 boat
          buoyancy and fluid physics, C++ State Tree AI, and FFT ocean-wave
          simulation. Open to remote software development roles worldwide.
        </p>
      </Reveal>

      <Reveal className="box" index={2}>
        <h2>Looking For</h2>
        <div className="badge-row">
          {LOOKING_FOR.map((role) => (
            <span className="badge-emerald" key={role}>
              {role}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal className="box" index={3}>
        <span className="mono-label">Technical Ecosystem</span>
        <h2>Skills</h2>
        <div className="marquee-section">
          <Marquee items={MARQUEE_ROW_1} />
          <Marquee items={MARQUEE_ROW_2} reverse />
        </div>
      </Reveal>

      <Reveal className="box specialty-node" index={4}>
        <span className="mono-label accent">SYSTEMS_NODE</span>
        <h2>Game Systems &amp; Simulation</h2>
        <p>
          Engine-level physics is where I do my deepest work: custom boat
          buoyancy and fluid dynamics in UE5, C++ State Tree AI, and an FFT
          ocean-wave simulation taken from O(N&#8308;) down to O(N log N).
        </p>
        <div className="node-rows">
          <div className="node-row">
            <span className="mono-label accent">PHYSICS</span>
            <span className="node-detail">Buoyancy &amp; Fluid Dynamics</span>
          </div>
          <div className="node-row">
            <span className="mono-label accent">ALGORITHMS</span>
            <span className="node-detail">
              FFT &middot; Phillips Spectrum &middot; O(N log N)
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal className="box" index={5}>
        <h2>Languages</h2>
        <div className="lang-list">
          {LANGUAGES.map((lang) => (
            <div className="lang-row" key={lang.name}>
              <span className="lang-name">{lang.name}</span>
              <span className="lang-level">{lang.level}</span>
              {lang.detail ? <span className="lang-detail">{lang.detail}</span> : null}
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
