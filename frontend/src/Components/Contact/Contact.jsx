import React, { useState, useMemo } from "react";
import "./Contact.css";

const initial = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const remaining = useMemo(
    () => 1000 - form.message.length,
    [form.message]
  );

  // ---------------- Field Change ----------------
  const setField = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setSuccess(false);
  };

  // ---------------- Validation ----------------
  const validate = () => {
    const next = {};
    const { name, email, subject, message } = form;

    if (!name.trim()) next.name = "Name required.";
    if (!email.trim()) next.email = "Email required.";
    else if (!isValidEmail(email)) next.email = "Invalid email.";

    if (!subject.trim()) next.subject = "Subject required.";
    else if (subject.trim().length < 3)
      next.subject = "Minimum 3 characters.";

    if (!message.trim()) next.message = "Message required.";
    else if (message.trim().length < 10)
      next.message = "Minimum 10 characters.";
    else if (message.length > 1000)
      next.message = "Maximum 1000 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ---------------- Submit ----------------
  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!validate()) return;

    setBusy(true);

    try {
      await new Promise((r) => setTimeout(r, 700));

      setSuccess(true);
      setForm(initial);
    } catch {
      setErrors({ general: "Failed to send message." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="contact-wrapper">
      <h1>Contact</h1>
      <p>Send us a message and we will reply shortly.</p>

      {errors.general && (
        <p className="contact-error" role="alert">
          {errors.general}
        </p>
      )}

      <form className="contact-form" onSubmit={onSubmit} noValidate>
        {/* Name */}
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={setField("name")}
          disabled={busy}
          aria-invalid={!!errors.name}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}

        {/* Email */}
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={setField("email")}
          disabled={busy}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <span className="field-error">{errors.email}</span>
        )}

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={setField("subject")}
          disabled={busy}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <span className="field-error">{errors.subject}</span>
        )}

        {/* Message */}
        <textarea
          placeholder="Write your message..."
          value={form.message}
          onChange={setField("message")}
          disabled={busy}
          className={remaining <= 100 ? "warning" : ""}
        />

        <div className="contact-counter">
          {remaining} characters left
        </div>

        {errors.message && (
          <span className="field-error">{errors.message}</span>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send Message"}
        </button>
      </form>

      {success && (
        <div className="success-message">
          ✅ Message sent successfully!
        </div>
      )}
    </section>
  );
}
