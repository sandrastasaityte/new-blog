import React from "react";
import { getTopVerifiedAuthors } from "../../assets/authors";
import { FaTwitter, FaLinkedin, FaGithub, FaGlobe, FaCheckCircle } from "react-icons/fa";
import "./About.css";

const FALLBACK_IMAGE = "/default-profile.png"; // fallback avatar

export default function About() {
  const authors = getTopVerifiedAuthors(); // top verified authors

  return (
    <section className="authors-section" aria-labelledby="authors-title">
      <h2 id="authors-title">Meet Our Verified Authors</h2>

      <div className="authors-container">
        {authors.map((author, index) => {
          const {
            id,
            name,
            role,
            bio,
            image,
            social,
            expertise = [],
            verified,
            location,
            stats = {},
          } = author;

          return (
            <article
              key={id}
              className={`author-card ${verified ? "verified" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="author-image-wrap">
                <img
                  src={image || FALLBACK_IMAGE}
                  alt={`${name} profile picture`}
                  loading="lazy"
                  className="author-image"
                  onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                />
                {verified && (
                  <FaCheckCircle className="verified-badge" title="Verified Author" />
                )}
              </div>

              <h3>{name}</h3>
              <p className="author-role">{role}</p>
              {location && <p className="author-location">{location}</p>}
              <p className="author-bio">{bio}</p>

              {expertise.length > 0 && (
                <div className="author-expertise">
                  {expertise.map((skill) => (
                    <span key={skill} className="expertise-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="author-stats">
                <span>Posts: {stats.posts || 0}</span>
                <span>Followers: {stats.followers || 0}</span>
                <span>Likes: {stats.likes || 0}</span>
              </div>

              <div className="author-social" aria-label={`${name} social links`}>
                {social?.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${name} Twitter`}>
                    <FaTwitter />
                  </a>
                )}
                {social?.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`}>
                    <FaLinkedin />
                  </a>
                )}
                {social?.github && (
                  <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label={`${name} GitHub`}>
                    <FaGithub />
                  </a>
                )}
                {social?.website && (
                  <a href={social.website} target="_blank" rel="noopener noreferrer" aria-label={`${name} Website`}>
                    <FaGlobe />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
