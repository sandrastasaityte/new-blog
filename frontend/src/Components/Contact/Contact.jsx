import React, { useMemo, useState } from "react";
import "./Contact.css";

const initial = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const remaining = useMemo(() => 1000 - form.message.length, [form.message]);

  const setField = (key) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
    setError("");
    setSuccess(false);
  };

  const validate = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || !email || !subject || !message) return "Please fill all fields.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    if (subject.length < 3) return "Subject must be at least 3 characters.";
    if (message.length < 10) return "Message must be at least 10 characters.";
    if (message.length > 1000) return "Message is too long (max 1000 characters).";

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      setSuccess(false);
      return;
    }

    setBusy(true);
    setError("");

    try {
      // ✅ If you have a backend route later, replace this block with:
      // await fetch(`${import.meta.env.VITE_API_URL}/contact`, { ... })
      await new Promise((r) => setTimeout(r, 600));

      setSuccess(true);
      setForm(initial);
    } catch (err) {
      setSuccess(false);
      setError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="contact-wrapper">
      <h1>Contact</h1>
      <p>
        Have a question or want to collaborate? Send a message and we’ll get back
        to you.
      </p>

      {error ? (
        <p className="contact-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <form className="contact-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="contact-name">
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={setField("name")}
          placeholder="Your name"
          autoComplete="name"
          disabled={busy}
          required
        />

        <label className="sr-only" htmlFor="contact-email">
          Your email
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          placeholder="Your email"
          autoComplete="email"
          disabled={busy}
          required
        />

        <label className="sr-only" htmlFor="contact-subject">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={setField("subject")}
          placeholder="Subject"
          disabled={busy}
          required
          minLength={3}
        />

        <label className="sr-only" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={setField("message")}
          placeholder="Write your message…"
          disabled={busy}
          required
          minLength={10}
          maxLength={1000}
          rows={5}
        />

        <div className="contact-counter" aria-live="polite">
          {remaining} characters left
        </div>

        <button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send Message"}
        </button>
      </form>

      {success ? (
        <div className="success-message" role="status" aria-live="polite">
          ✅ Message sent successfully! Thank you.
        </div>
      ) : null}
    </section>
  );
}
