import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Please enter your name.";
    if (!formData.email.trim()) return "Please enter your email.";
    if (!formData.email.includes("@")) return "Please enter a valid email.";
    if (formData.message.trim().length < 10)
      return "Message must be at least 10 characters.";
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

      // simulate network delay
      await new Promise((res) => setTimeout(res, 800));

      setStatus({ loading: false, success: true, error: "" });
      setFormData({ name: "", email: "", message: "" });

      // auto-hide success after 3s
      setTimeout(() => {
        setStatus((s) => ({ ...s, success: false }));
      }, 3000);
    } catch (err) {
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

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={status.loading}
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={status.loading}
        />

        <textarea
          name="message"
          placeholder="Your Message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={status.loading}
        />

        {status.error && (
          <p className="contact-error" role="alert">
            {status.error}
          </p>
        )}

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Sending…" : "Send Message"}
        </button>
      </form>

      {status.success && (
        <p className="success-message">
          Thank you! Your message has been sent.
        </p>
      )}
    </div>
  );
};

export default Contact;
