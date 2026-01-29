import React from "react";
import { AUTHORS } from "../../assets/authors";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import "./About.css";

export default function About() {
  return (
    <section className="authors-section" aria-labelledby="authors-title">
      <h2 id="authors-title">Meet Our Authors</h2>

      <div className="authors-container">
        {AUTHORS.map((author) => (
          <article key={author.id} className="author-card">
            <img
              src={author.image}
              alt={`${author.name} profile`}
              loading="lazy"
              className="author-image"
            />

            <h3>{author.name}</h3>
            <p className="author-role">{author.role}</p>
            <p className="author-bio">{author.bio}</p>

            <div className="author-social" aria-label={`${author.name} social links`}>
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} Twitter`}
                >
                  <FaTwitter />
                </a>
              )}

              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} LinkedIn`}
                >
                  <FaLinkedin />
                </a>
              )}

              {author.social.github && (
                <a
                  href={author.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} GitHub`}
                >
                  <FaGithub />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
