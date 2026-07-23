import Reveal from "../components/Reveal.jsx";

const ENTRIES = [
  {
    title: "Programming for Game, Web and Mobile",
    org: "Vancouver Film School (VFS)",
    dates: "2024 – Present",
    detail: (
      <>
        <p>Focus: Full-stack Development, Mobile App Development, Game Programming</p>
        <p>English for Creative Arts (ECA) Program &mdash; completed 2024 &middot; GPA: 79.52/100</p>
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
        <li>Conducted system testing for slot-machine data reading and updating</li>
        <li>Performed data validation and quality assurance for gaming systems</li>
        <li>Collaborated with the IT team on system integration and troubleshooting</li>
        <li>Gained enterprise-level IT operations experience in the hospitality sector</li>
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
    <div className="container">
      <h1>Background</h1>
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
