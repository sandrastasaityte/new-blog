// src/Components/Blogs/Blogs.jsx
import React, { useState, useMemo } from "react";
import { usePosts } from "../../Context/PostsContext";
import { useModalSync } from "../../hooks/useModalSync";
import BlogCard from "./BlogCard";
import Sidebar from "../Sidebar/Sidebar";
import BlogModal from "./BlogModal";
import Pagination from "./Pagination";
import "./Blogs.css";

const BLOGS_PER_PAGE = 6;

export default function Blogs() {
  const { posts, addComment, toggleLike } = usePosts();
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const { selectedId, closeModal } = useModalSync(posts);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) =>
        filterTags.length
          ? p.tags?.some((t) => filterTags.includes(t))
          : true
      )
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [posts, filterTags]);

  const totalPages = Math.ceil(filteredPosts.length / BLOGS_PER_PAGE);

  const paginatedPosts = filteredPosts.slice(
    (page - 1) * BLOGS_PER_PAGE,
    page * BLOGS_PER_PAGE
  );

  const selectedPost = posts.find(
    (p) => String(p._id || p.id) === selectedId
  );

  return (
    <div className="blogs-page">
      <div className="blogs-left">
        <section className="all-blogs">
          <h2>All Blogs</h2>

          {paginatedPosts.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            <div className="all-blogs-grid">
              {paginatedPosts.map((post) => (
                <BlogCard
                  key={post._id || post.id}
                  post={post}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </div>

      <div className="blogs-right">
        <Sidebar
          posts={posts}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
        />
      </div>

      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={closeModal}
          onAddComment={addComment}
          onLike={toggleLike}
        />
      )}
    </div>
  );
}
