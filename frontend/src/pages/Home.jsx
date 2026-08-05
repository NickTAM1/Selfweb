import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import StatStrip from "../components/StatStrip.jsx";
import GitHubActivity from "../components/GitHubActivity.jsx";
import { PROJECTS } from "./Projects.jsx";

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

const SKILL_FILTERS = [
  { label: "All", value: "All" },
  { label: "Languages", value: "Languages" },
  { label: "Engines", value: "Engines & App Dev" },
  { label: "Tools", value: "Tools & Systems" },
];

const STATS = [
  { value: "4", label: "LANGUAGES SPOKEN" },
  { value: String(PROJECTS.length), label: "SHIPPED PROJECTS" },
  { value: "N1", label: "JLPT (JAPANESE)" },
  { value: "BSc", label: "COMPUTING" },
];

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
  const skillCount = SKILL_GROUPS.reduce((total, group) => total + group.skills.length, 0);
  const [activeSkillGroup, setActiveSkillGroup] = useState("All");
  const [skillQuery, setSkillQuery] = useState("");
  const normalizedSkillQuery = skillQuery.trim().toLowerCase();
  const visibleSkillGroups = SKILL_GROUPS.map((group) => ({
    ...group,
    skills: group.skills.filter((skill) =>
      !normalizedSkillQuery || skill.toLowerCase().includes(normalizedSkillQuery),
    ),
  }))
    .filter((group) => activeSkillGroup === "All" || group.title === activeSkillGroup)
    .filter((group) => group.skills.length > 0);
  const visibleSkillCount = visibleSkillGroups.reduce(
    (total, group) => total + group.skills.length,
    0,
  );

  return (
    <div className="container home-container">
      <div className="hero">
        <Reveal as="span" className="status-pill" index={0}>
          <span className="status-dot" aria-hidden="true" />
          <span className="mono-label accent">Open to work &middot; Remote worldwide</span>
        </Reveal>
        <Reveal as="span" className="hero-role" index={1}>
          Junior software developer · game systems, web &amp; backend
        </Reveal>
        <Reveal as="h1" index={2}>
          Chi Lek (Nick) Tam
        </Reveal>
        <Reveal as="p" className="hero-pitch" index={3}>
          I build game systems, web apps, and backend tools. My strongest work
          is UE5 physics and AI, and I enjoy tracing a bug all the way to the
          part underneath it.
        </Reveal>
        <Reveal as="div" className="hero-cta" index={4}>
          <Link className="btn-glass btn-primary" to="/projects">
            View Projects
          </Link>
          <a className="btn-glass" href="/Selfweb/resume.pdf" target="_blank" rel="noreferrer">
            Résumé
          </a>
          <Link className="btn-glass" to="/contact">
            Contact
          </Link>
        </Reveal>
        <Reveal as="p" className="hero-status" index={5}>
          Based in Macau &middot; Open to remote software roles worldwide
        </Reveal>
      </div>

      <StatStrip stats={STATS} />

      <GitHubActivity />

      <Reveal className="box" index={1}>
        <h2>About</h2>
        <p>
          I’m a junior software developer with a BSc in Computing and recent
          full stack training from Vancouver Film School. I work across games,
          web, mobile, and backend systems.
        </p>
        <p>
          My best work so far includes UE5 boat buoyancy, C++ State Tree AI,
          and FFT ocean wave simulation. Before software development, I worked
          in enterprise IT for the gaming industry, so I care about both the
          code and the system around it.
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

      <Reveal className="box skills-section" index={3}>
        <div className="section-heading-row">
          <div>
            <span className="mono-label accent">MY STACK</span>
            <h2>Skills</h2>
          </div>
          <span className="section-count">{skillCount} CORE SKILLS</span>
        </div>
        <p className="section-intro">
          The languages, engines, and tools I use most often across games, web apps, and backend work.
        </p>
        <div className="skill-explorer-controls">
          <div className="skill-filter-tabs" role="group" aria-label="Filter skills by area">
            {SKILL_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`skill-filter-tab${activeSkillGroup === option.value ? " active" : ""}`}
                aria-pressed={activeSkillGroup === option.value}
                onClick={() => setActiveSkillGroup(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="skill-search-wrap">
            <label className="sr-only" htmlFor="skill-search">
              Search skills
            </label>
            <input
              id="skill-search"
              type="search"
              placeholder="Find a skill..."
              value={skillQuery}
              onChange={(event) => setSkillQuery(event.target.value)}
            />
            {skillQuery ? (
              <button
                type="button"
                className="skill-search-clear"
                aria-label="Clear skill search"
                onClick={() => setSkillQuery("")}
              >
                &times;
              </button>
            ) : null}
          </div>
        </div>
        <p className="skill-filter-status" aria-live="polite">
          Showing {visibleSkillCount} of {skillCount} core skills
        </p>
        {visibleSkillGroups.length > 0 ? (
          <div className="skills-dashboard">
          {visibleSkillGroups.map((group, groupIndex) => (
            <div className="skill-cluster" key={group.title}>
              <div className="skill-cluster-heading">
                <span className="skill-cluster-index">0{groupIndex + 1}</span>
                <div>
                  <h3>{group.title}</h3>
                  <span className="mono-label">{group.skills.length} DISCIPLINES</span>
                </div>
              </div>
              <div className="skill-cloud">
                {group.skills.map((skill) => (
                  <span className="badge-emerald skill-chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="skill-empty" role="status">
            No skills match “{skillQuery}”. Try a different search or reset the area filter.
          </div>
        )}
        <div className="skills-footer-line">
          <span className="mono-label accent">HOW I WORK</span>
          <span className="skills-footer-rule" aria-hidden="true" />
          <span className="mono-label">BUILD · TEST · SHIP</span>
        </div>
      </Reveal>

      <Reveal className="box specialty-node" index={4}>
        <span className="mono-label accent">THE DEEP END</span>
        <h2>Game Systems &amp; Simulation</h2>
        <p>
          This is where I do my deepest technical work: custom boat buoyancy
          and fluid dynamics in UE5, C++ State Tree AI, and an FFT ocean wave
          simulation that brings the cost down from O(N&#8308;) to O(N log N).
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
