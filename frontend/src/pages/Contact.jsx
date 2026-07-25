import { useState } from "react";
import { motion } from "motion/react";
import emailjs from "@emailjs/browser";
import Reveal from "../components/Reveal.jsx";
import IconPopover from "../components/IconPopover.jsx";
import { MailIcon, LinkedinIcon, GithubIcon } from "../components/icons.jsx";

// To enable direct sending, sign up free at emailjs.com, create a service +
// email template (with {{name}}, {{email}}, {{message}} variables), then add
// the three keys below to a `.env` file at the frontend root (see
// `.env.example`) or as GitHub Actions repo secrets for the deployed build.
// Without them, the form falls back to opening the visitor's email client.
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const EMAILJS_CONFIGURED = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY
);

const OWNER_EMAIL = "2584718806q@gmail.com";
const GITHUB_ACCOUNTS = [
  { label: "NickTAM1", href: "https://github.com/NickTAM1" },
  { label: "HUKLIA", href: "https://github.com/HUKLIA" },
];

function buildMailtoUrl(name, email, message) {
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body = encodeURIComponent(`${message} (reply to: ${email})`);
  return `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
}

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { kind: "success" | "fallback", text }

  function openMailtoFallback(nameValue, emailValue, messageValue) {
    window.location.href = buildMailtoUrl(nameValue, emailValue, messageValue);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    if (!EMAILJS_CONFIGURED) {
      openMailtoFallback(name, email, message);
      setStatus({
        kind: "fallback",
        text: "Opened your email client. Send from there to reach me.",
      });
      return;
    }

    setSending(true);
    setStatus(null);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { name, email, message },
        EMAILJS_PUBLIC_KEY
      );
      setStatus({ kind: "success", text: "Message sent, thanks!" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.warn("Contact: EmailJS send failed, falling back to mailto", err);
      openMailtoFallback(name, email, message);
      setStatus({
        kind: "fallback",
        text: "Could not send directly, so this opened your email client instead.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container">
      <h1>Contact</h1>

      <Reveal className="box" index={0}>
        <h2>Get in Touch</h2>
        <div className="contact-link-row">
          <motion.a
            className="btn-glass btn-link btn-icon"
            href="mailto:2584718806q@gmail.com"
            aria-label="Email"
            data-tooltip="Email"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
          >
            <MailIcon />
          </motion.a>
          <motion.a
            className="btn-glass btn-link btn-icon"
            href="https://www.linkedin.com/in/chilek-tam-huzi"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            data-tooltip="LinkedIn"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
          >
            <LinkedinIcon />
          </motion.a>
          <IconPopover icon={<GithubIcon />} label="GitHub" items={GITHUB_ACCOUNTS} />
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
          <button className="btn-glass" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
        <div className="form-status" role="status" aria-live="polite">
          {status && (
            <p className={`form-note form-status-${status.kind}`}>{status.text}</p>
          )}
        </div>
        {!EMAILJS_CONFIGURED && (
          <p className="form-note">
            (Direct sending isn't configured yet, so this opens your email client instead.)
          </p>
        )}
      </Reveal>
    </div>
  );
}
