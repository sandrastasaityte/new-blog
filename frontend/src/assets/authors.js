import user01 from "./profile-pic2.png";
import user02 from "./user-02.png";
import user03 from "./user-03.png";

// =============================
// AUTHORS CONFIG
// =============================
export const AUTHORS = [
  {
    id: "1",
    slug: "sandra-stasaityte",
    name: "Sandra Stasaityte",
    role: "Founder & Lead Writer",
    image: user01,
    bio: "Sandra is passionate about technology, economics, blogging, and sharing insights with readers worldwide.",
    expertise: ["Technology", "Economics", "E-commerce", "Programming", "Startups"],
    location: "UK / Lithuania",
    verified: true,
    joinedAt: "2018-05-12",
    stats: {
      posts: 42,
      followers: 1280,
      likes: 5420,
    },
    social: {
      linkedin: "https://www.linkedin.com/in/sandrastasaityte/",
      github: "https://github.com/sandrastasaityte",
      website: "https://sandrastasaityte.com",
    },
  },
  {
    id: "2",
    slug: "maria-mema",
    name: "Maria Mema",
    role: "Tech Writer",
    image: user02,
    bio: "Maria writes about software development, coding tutorials, and emerging technology trends.",
    expertise: ["Web Development", "AI", "Tutorials", "JavaScript", "Cloud"],
    location: "Germany",
    verified: false,
    joinedAt: "2020-03-18",
    stats: {
      posts: 18,
      followers: 540,
      likes: 1920,
    },
    social: {
      twitter: "https://twitter.com/maria",
      linkedin: "https://linkedin.com/in/maria",
      github: "https://github.com/mariamema",
    },
  },
  {
    id: "3",
    slug: "john-smith",
    name: "John Smith",
    role: "Content Creator",
    image: user03,
    bio: "John focuses on lifestyle topics, productivity tips, and creative writing.",
    expertise: ["Lifestyle", "Productivity", "Creativity", "Writing", "Mindset"],
    location: "USA",
    verified: false,
    joinedAt: "2019-11-05",
    stats: {
      posts: 27,
      followers: 760,
      likes: 2310,
    },
    social: {
      github: "https://github.com/johnsmith",
      instagram: "https://instagram.com/johnsmith",
    },
  },
];

// =============================
// HELPERS
// =============================
export function getAuthorById(id) {
  return AUTHORS.find((a) => a.id === id);
}

export function getAuthorBySlug(slug) {
  return AUTHORS.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
}

export function getVerifiedAuthors() {
  return AUTHORS.filter((a) => a.verified);
}

export function getTopAuthors(limit = 3) {
  return [...AUTHORS].sort((a, b) => b.stats.followers - a.stats.followers).slice(0, limit);
}

export function getAuthorsByExpertise(skill) {
  return AUTHORS.filter((a) =>
    a.expertise.some((e) => e.toLowerCase() === skill.toLowerCase())
  );
}

export function getNewestAuthors(limit = 3) {
  return [...AUTHORS]
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, limit);
}

export function getTopVerifiedAuthors(limit = 3) {
  return getVerifiedAuthors()
    .sort((a, b) => b.stats.followers - a.stats.followers)
    .slice(0, limit);
}

// =============================
// META
// =============================
export const AUTHORS_META = {
  version: "1.2.0",
  total: AUTHORS.length,
  verifiedCount: AUTHORS.filter((a) => a.verified).length,
};
