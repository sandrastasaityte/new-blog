import React from "react";
import { AUTHORS, getTopVerifiedAuthors } from "../../assets/authors";
import { FaTwitter, FaLinkedin, FaGithub, FaGlobe, FaCheckCircle } from "react-icons/fa";
import "./About.css";

export default function About() {
  const verifiedAuthors = getTopVerifiedAuthors(); // top verified authors

  return (
    <section className="authors-section" aria-labelledby="authors-title">
      <h2 id="authors-title">Meet Our Authors</h2>

      <div className="authors-container">
        {AUTHORS.map((author, index) => {
          const {
            id,
            name,
            role,
            bio,
            image,
            social,
            expertise,
            verified,
            location,
            stats,
          } = author;

          return (
            <article
              key={id}
              className={`author-card ${verified ? "verified" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="author-image-wrap">
                <img
                  src={image}
                  alt={`${name} profile`}
                  loading="lazy"
                  className="author-image"
                />
                {verified && (
                  <FaCheckCircle className="verified-badge" title="Verified Author" />
                )}
              </div>

              <h3>{name}</h3>
              <p className="author-role">{role}</p>
              {location && <p className="author-location">{location}</p>}
              <p className="author-bio">{bio}</p>

              {expertise && expertise.length > 0 && (
                <div className="author-expertise">
                  {expertise.map((skill, idx) => (
                    <span key={idx} className="expertise-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="author-stats">
                <span>Posts: {stats?.posts || 0}</span>
                <span>Followers: {stats?.followers || 0}</span>
                <span>Likes: {stats?.likes || 0}</span>
              </div>

              {/* Social links */}
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
