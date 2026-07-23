import { useState } from "react";

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

      <div className="box">
        <h2>Email</h2>
        <p>
          <a href="mailto:2584718806q@gmail.com">2584718806q@gmail.com</a>
        </p>
      </div>

      <div className="box">
        <h2>LinkedIn</h2>
        <p>
          <a
            href="https://www.linkedin.com/in/chi-lek-tam"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/chi-lek-tam
          </a>
        </p>
      </div>

      <div className="box">
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="name">Name</label>
            <br />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </p>
          <p>
            <label htmlFor="email">Your Email</label>
            <br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
          <p>
            <label htmlFor="message">Message</label>
            <br />
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </p>
          <button type="submit">Send</button>
        </form>
        <p>(Form is a design placeholder, not yet connected to a backend.)</p>
      </div>
    </div>
  );
}
