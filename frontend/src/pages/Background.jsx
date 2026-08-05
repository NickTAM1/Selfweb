import Reveal from "../components/Reveal.jsx";

const ENTRIES = [
  {
    title: "Programming for Game, Web and Mobile",
    org: "Vancouver Film School (VFS)",
    dates: "2024 – Present",
    detail: (
      <>
        <p>Focus: Full stack development, mobile app development, and game programming</p>
        <p>English for Creative Arts (ECA) Program, completed 2024 &middot; GPA: 79.52/100</p>
      </>
    ),
  },
  {
    title: "Japanese Language Program",
    org: "JET Academy, Tokyo",
    dates: "2023 – 2024",
    detail: <p>Completed &middot; JLPT N1 Certified (Score: 119)</p>,
  },
  {
    title: "IT Intern",
    org: "Melco Resorts & Entertainment, Studio City Macau",
    dates: "Sep – Nov 2021",
    detail: (
      <ul className="highlights">
        <li>Tested systems that read and update slot machine data</li>
        <li>Performed data validation and quality assurance for gaming systems</li>
        <li>Collaborated with the IT team on system integration and troubleshooting</li>
        <li>Gained enterprise level IT experience in the hospitality sector</li>
      </ul>
    ),
  },
  {
    title: "Bachelor of Science in Computing",
    org: "Macao Polytechnic University (formerly Macao Polytechnic Institute)",
    dates: "2018 – 2022",
    detail: null,
  },
  {
    title: "Senior High School Certificate",
    org: "Saint Joseph Diocesan College, Macao SAR",
    dates: "2015 – 2018",
    detail: null,
  },
];

export default function Background() {
  return (
    <div className="container page-container">
      <div className="page-intro">
        <span className="mono-label accent">FROM THERE TO HERE</span>
        <h1>Background</h1>
        <p>
          I moved from enterprise IT operations into systems focused software
          development through games, graphics, and a habit of asking how
          things work.
        </p>
      </div>
      <div className="timeline">
        {ENTRIES.map((entry, index) => (
          <Reveal className="timeline-entry" key={entry.title} index={index}>
            <h2>{entry.title}</h2>
            <p className="timeline-meta">
              {entry.org}
              {entry.dates ? ` · ${entry.dates}` : ""}
            </p>
            {entry.detail}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
