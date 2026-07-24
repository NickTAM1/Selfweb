import { useState } from "react";
import Reveal from "../components/Reveal.jsx";

const ICON_PATHS = {
  mail: "M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.3 6.15a.75.75 0 0 0 .96 0L19.8 6H4.2ZM20 7.4l-6.6 5.55a2.75 2.75 0 0 1-3.53 0L4 7.4V18h16V7.4Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 9.75h5.15V21H2.4V9.75Zm7.9 0h4.93v1.54h.07c.69-1.24 2.37-2.55 4.87-2.55 5.2 0 6.16 3.28 6.16 7.54V21H21v-5.34c0-1.27-.02-2.9-1.85-2.9-1.85 0-2.14 1.36-2.14 2.81V21h-5.7V9.75Z",
  github:
    "M12 2a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
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

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="container">
      <h1>Contact</h1>

      <Reveal className="box" index={0}>
        <h2>Get in Touch</h2>
        <div className="contact-link-row">
          <a
            className="btn-glass btn-link btn-icon"
            href="mailto:2584718806q@gmail.com"
            aria-label="Email"
            data-tooltip="Email"
          >
            <Icon name="mail" />
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
        </div>
      </Reveal>

      <Reveal className="box" index={1}>
        <h2>Send a Message</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <p>
            <label className="field-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </p>
          <p>
            <label className="field-label" htmlFor="email">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
          <p>
            <label className="field-label" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </p>
          <button className="btn-glass" type="submit">
            Send
          </button>
        </form>
        <p className="form-note">(Form is a design placeholder, not yet connected to a backend.)</p>
      </Reveal>
    </div>
  );
}
