import React from "react";
import "./About.css";
import aboutpic3 from "../../assets/about-pic3.png";
import user02 from "../../assets/user-02.png";
import user03 from "../../assets/user-03.png";

const authors = [
  {
    name: "Sandra Stasaityte",
    role: "Founder & Lead Writer",
    image: aboutpic3,
    bio: "Sandra is passionate about technology & economics, blogging, and sharing insights with readers around the world.",
  },
  {
    name: "John Doe",
    role: "Tech Writer",
    image: user02,
    bio: "John writes about software development, coding tutorials, and emerging tech trends.",
  },
  {
    name: "Jane Smith",
    role: "Content Creator",
    image: user03,
    bio: "Jane focuses on lifestyle, productivity tips, and creative writing.",
  },
];

const About = () => {
  return (
    <div className="about-wrapper">
      <header className="about-hero">
        <h1>About Our Team</h1>
        <p>Meet the passionate authors behind our blog.</p>
      </header>

      <section className="authors-grid">
        {authors.map((author) => (
          <div key={author.name} className="author-card">
            <img src={author.image} alt={author.name} className="author-image" />
            <h3>{author.name}</h3>
            <small>{author.role}</small>
            <p>{author.bio}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default About;
