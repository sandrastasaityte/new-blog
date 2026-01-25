import React from "react";
import "./About.css";

import aboutpic3 from "../../assets/about-pic3.png";
import user02 from "../../assets/user-02.png";
import user03 from "../../assets/user-03.png";

const AUTHORS = [
  {
    id: 1,
    name: "Sandra Stasaityte",
    role: "Founder & Lead Writer",
    image: aboutpic3,
    bio: "Sandra is passionate about technology, economics, blogging, and sharing insights with readers worldwide.",
  },
  {
    id: 2,
    name: "Maria Mema",
    role: "Tech Writer",
    image: user02,
    bio: "Maria writes about software development, coding tutorials, and emerging technology trends.",
  },
  {
    id: 3,
    name: "John Smith",
    role: "Content Creator",
    image: user03,
    bio: "John focuses on lifestyle topics, productivity tips, and creative writing.",
  },
];

function AuthorCard({ author }) {
  const { name, role, image, bio } = author;

  const handleImgError = (e) => {
    // ✅ prevents infinite loop if placeholder is missing
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/placeholder-user.png"; // put this file in /public
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
