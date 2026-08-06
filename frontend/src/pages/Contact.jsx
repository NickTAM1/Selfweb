import { useState } from "react";
import { motion } from "motion/react";
import Reveal from "../components/Reveal.jsx";
import IconPopover from "../components/IconPopover.jsx";
import { MailIcon, LinkedinIcon, GithubIcon } from "../components/icons.jsx";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xaewnjgg";

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

    setSending(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("_replyto", email);
      formData.append("_subject", `Portfolio contact from ${name}`);
      formData.append("message", message);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || result?.message || "Formspree submission failed");
      }
      setStatus({ kind: "success", text: "Message sent, thanks!" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.warn("Contact: Formspree send failed, falling back to mailto", err);
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
    <div className="container page-container contact-container">
      <div className="page-intro">
        <span className="mono-label accent">SAY HELLO</span>
        <h1>Contact</h1>
        <p>
          Tell me what you&apos;re building, what role you&apos;re hiring for, or what
          system is giving you trouble. I&apos;ll get back to you.
        </p>
      </div>

      <div className="contact-layout">
        <Reveal className="box contact-rail" index={0}>
          <div className="section-heading-row">
            <div>
              <span className="mono-label accent">FIND ME HERE</span>
              <h2>Get in Touch</h2>
            </div>
            <span className="section-count">3 CHANNELS</span>
          </div>
          <p className="section-intro">
            Prefer a quick connection? Choose a channel below or use the form beside it.
          </p>
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
          <div className="contact-availability">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <span className="mono-label accent">STATUS</span>
              <strong>Open to remote software roles</strong>
              <span>Worldwide · UTC+8 friendly</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="box contact-form-box" index={1}>
          <div className="section-heading-row">
            <div>
              <span className="mono-label accent">SEND A NOTE</span>
              <h2>Send a Message</h2>
            </div>
            <span className="section-count">REPLY VIA EMAIL</span>
          </div>
          <form
            className="contact-form"
            action={FORMSPREE_ENDPOINT}
            method="POST"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="_subject" value="Portfolio contact" />
            <div className="form-grid">
          <p>
            <label className="field-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
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
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
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
              name="message"
              rows={5}
              placeholder="Tell me what you are building..."
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </p>
            </div>
          <button className="btn-glass" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
          </form>
          <div className="form-status" role="status" aria-live="polite">
          {status && (
            <p className={`form-note form-status-${status.kind}`}>{status.text}</p>
          )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
