import React, { useEffect, useId, useRef, useState } from "react";
import "./Contact.css";

const initialForm = { name: "", email: "", message: "" };
const initialStatus = { loading: false, success: false, error: "" };

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Contact = () => {
  const nameId = useId();
  const emailId = useId();
  const msgId = useId();

  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState(initialStatus);

  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({ ...p, [name]: value }));
    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  const validate = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name) return "Please enter your name.";
    if (!email) return "Please enter your email.";
    if (!isValidEmail(email)) return "Please enter a valid email.";
    if (message.length < 10) return "Message must be at least 10 characters.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.loading) return;

    const msg = validate();
    if (msg) {
      setStatus({ loading: false, success: false, error: msg });
      return;
    }

    try {
      setStatus({ loading: true, success: false, error: "" });

      // 🔌 Later: connect backend here
      console.log("Contact form submitted:", formData);

      await new Promise((res) => setTimeout(res, 800));

      setStatus({ loading: false, success: true, error: "" });
      setFormData(initialForm);

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setStatus((s) => ({ ...s, success: false }));
      }, 3000);
    } catch {
      setStatus({
        loading: false,
        success: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="contact-wrapper">
      <h1>Contact Us</h1>
      <p>Have questions or want to say hello? Send us a message!</p>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <label className="sr-only" htmlFor={nameId}>
          Your name
        </label>
        <input
          id={nameId}
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={status.loading}
          autoComplete="name"
        />

        <label className="sr-only" htmlFor={emailId}>
          Your email
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={status.loading}
          autoComplete="email"
        />

        <label className="sr-only" htmlFor={msgId}>
          Your message
        </label>
        <textarea
          id={msgId}
          name="message"
          placeholder="Your Message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          disabled={status.loading}
        />

        {status.error ? (
          <p className="contact-error" role="alert" aria-live="polite">
            {status.error}
          </p>
        ) : null}

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Sending…" : "Send Message"}
        </button>
      </form>

      {status.success ? (
        <p className="success-message" role="status" aria-live="polite">
          Thank you! Your message has been sent.
        </p>
      ) : null}
    </div>
  );
};

export default Contact;
