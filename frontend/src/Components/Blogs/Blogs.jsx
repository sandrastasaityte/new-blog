import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import blogsData from "../../assets/blogsData.json";

import AddBlog from "../AddBlog/AddBlog";
import BlogCard from "./BlogCard";
import BlogModal from "./BlogModal";
import Sidebar from "../Sidebar/Sidebar";

import "./Blogs.css";

const POSTS_PER_PAGE = 6;

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterTags, setFilterTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);

  useEffect(() => {
    const initialBlogs = blogsData.map(blog => ({
      ...blog,
      id: blog.id || uuidv4(),
      views: blog.views || 0,
      comments: blog.comments || [],
      rating: blog.rating || 0,
      date: blog.date || new Date().toISOString().slice(0, 10),
    }));
    setPosts(initialBlogs);
  }, []);

  // Add new blog
  const handleAddPost = (newPost) => {
    const postWithId = {
      ...newPost,
      id: uuidv4(),
      views: 0,
      comments: [],
      rating: 0,
      date: new Date().toISOString().slice(0, 10),
    };
    setPosts([postWithId, ...posts]);
    setShowAddPopup(false); // Close popup after adding
  };

  // Add comment
  const handleAddComment = (postId, commentText) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...(post.comments || []), commentText] }
        : post
    );
    setPosts(updatedPosts);

    if (selectedPost?.id === postId) {
      setSelectedPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), commentText],
      }));
    }
  };

  // Open post modal
  const handleViewPost = (post) => {
    const updatedPosts = posts.map(p =>
      p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
    );
    setPosts(updatedPosts);
    setSelectedPost({ ...post, views: (post.views || 0) + 1 });
  };

  const handleCloseModal = () => setSelectedPost(null);

  const filteredPosts =
    filterTags.length > 0
      ? posts.filter(post => filterTags.every(tag => post.tags?.includes(tag)))
      : posts;

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const uniqueTags = [...new Set(posts.flatMap(post => post.tags || []))];

  return (
    <div className="blog-wrapper">
      <div className="blog-hero">
        <h1>Our Blog</h1>
        <p>Explore insights, tutorials, and latest updates.</p>
        <button className="open-add-btn" onClick={() => setShowAddPopup(true)}>
          + Add New Blog
        </button>
      </div>

      {/* Add Blog Popup */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={() => setShowAddPopup(false)}>X</button>
            <AddBlog onAddPost={handleAddPost} />
          </div>
        </div>
      )}

      <div className="blog-main-container">
        <div className="blog-grid">
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map(post => (
              <BlogCard
                key={post.id}
                post={post}
                onReadMore={() => handleViewPost(post)}
              />
            ))
          ) : (
            <p>No posts found.</p>
          )}
        </div>

        <Sidebar
          posts={posts}
          uniqueTags={uniqueTags}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          onSelectPost={handleViewPost}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {/* Blog Modal */}
      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={handleCloseModal}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default Blogs;
