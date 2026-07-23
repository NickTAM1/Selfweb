import { useState } from "react";
import Reveal from "../components/Reveal.jsx";

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
        <h2>Email</h2>
        <p>
          <a href="mailto:2584718806q@gmail.com">2584718806q@gmail.com</a>
        </p>
      </Reveal>

      <Reveal className="box" index={1}>
        <h2>LinkedIn</h2>
        <p>
          <a
            href="https://www.linkedin.com/in/chilek-tam-huzi"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/chilek-tam-huzi
          </a>
        </p>
      </Reveal>

      <Reveal className="box" index={2}>
        <h2>GitHub</h2>
        <p>
          <a href="https://github.com/NickTAM1" target="_blank" rel="noreferrer">
            github.com/NickTAM1
          </a>
        </p>
        <p>
          <a href="https://github.com/HUKLIA" target="_blank" rel="noreferrer">
            github.com/HUKLIA
          </a>
        </p>
      </Reveal>

      <Reveal className="box" index={3}>
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
