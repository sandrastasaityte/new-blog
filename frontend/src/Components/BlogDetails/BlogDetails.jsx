import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogs, addComment, likeBlog } from "../../lib/blogApi";
import "./BlogDetails.css";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const allBlogs = await getBlogs();
        const found = allBlogs.find((b) => b.id === id || b._id === id);
        setBlog(found);
      } catch (err) {
        console.error("Failed to load blog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const updated = await addComment(blog.id, { text: commentText });
      setBlog(updated);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleLike = async () => {
    try {
      const updated = await likeBlog(blog.id);
      setBlog(updated);
    } catch (err) {
      console.error("Failed to like blog:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <main className="blog-details-container">
      <h1>{blog.title}</h1>
      <p className="blog-meta">
        By {blog.author} | {new Date(blog.date).toLocaleDateString()} | {blog.views} views | {blog.likes} likes
      </p>
      <img
        src={blog.image || "https://via.placeholder.com/600x300"}
        alt={blog.title}
      />
      <div className="blog-content">{blog.content}</div>
      
      <div className="blog-tags">
        {(blog.tags || []).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>

      <button onClick={handleLike} className="like-btn">
        👍 Like ({blog.likes})
      </button>

      <section className="comments-section">
        <h2>Comments ({blog.comments.length})</h2>
        <ul>
          {blog.comments.map((c, idx) => (
            <li key={idx}>
              <strong>{c.name}</strong> ({new Date(c.date).toLocaleString()}):
              <p>{c.text}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <button type="submit">Submit</button>
        </form>
      </section>
    </main>
  );
}
