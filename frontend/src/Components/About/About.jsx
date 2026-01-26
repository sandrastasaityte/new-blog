import React from "react";
import "./About.css";

import { AUTHORS } from "../../assets/authors"; // ✅ use external data

function AuthorCard({ author }) {
  const { name, role, image, bio } = author;

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/placeholder-user.png";
  };

  return (
    <article className="author-card" aria-label={`${name} - ${role}`}>
      <div className="author-image-wrap">
        <img
          src={image}
          alt={name}
          className="author-image"
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      <h3 className="author-name">{name}</h3>
      <p className="author-role">{role}</p>
      <p className="author-bio">{bio}</p>
    </article>
  );
}

export default function About() {
  return (
    <section className="about-wrapper">
      <header className="about-hero">
        <h1 className="about-title">About Our Team</h1>
        <p className="about-subtitle">
          Meet the passionate authors behind our blog.
        </p>
      </header>

      <div className="authors-grid">
        {AUTHORS.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  );
}
