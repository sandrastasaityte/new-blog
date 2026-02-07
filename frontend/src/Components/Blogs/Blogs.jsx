import React, { useState, useMemo } from "react";
import { usePosts } from "../../Context/PostsContext";
import BlogCard from "./BlogCard";
import Sidebar from "../Sidebar/Sidebar";
import Pagination from "./Pagination";
import "./Blogs.css";

const BLOGS_PER_PAGE = 6;

export default function Blogs() {
  const { posts } = usePosts();
  const [filterTags, setFilterTags] = useState([]);
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) =>
        filterTags.length ? p.tags?.some((t) => filterTags.includes(t)) : true
      )
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [posts, filterTags]);

  const totalPages = Math.ceil(filteredPosts.length / BLOGS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * BLOGS_PER_PAGE,
    page * BLOGS_PER_PAGE
  );

  return (
    <div className="blogs-page">
      <div className="blogs-left">
        {filteredPosts.length > 0 && (
          <section className="popular-blogs">
            <h2>Popular Blogs</h2>
            <div className="popular-blogs-grid">
              {filteredPosts.slice(0, 3).map((post, idx) => (
                <BlogCard key={post._id || post.id || `popular-${idx}`} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="all-blogs">
          <h2>All Blogs</h2>
          {paginatedPosts.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            <div className="all-blogs-grid">
              {paginatedPosts.map((post, idx) => (
                <BlogCard key={post._id || post.id || `all-${idx}`} post={post} />
              ))}
            </div>
          )}

          {/* Updated Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </div>

      <div className="blogs-right">
        <Sidebar filterTags={filterTags} setFilterTags={setFilterTags} />
      </div>
    </div>
  );
}
