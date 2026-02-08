import React, { useMemo, useState } from "react";
import { usePosts } from "../Context/PostsContext";
import "./Admin.css";

export default function Posts() {

  const {
    posts,
    deletePost,
    toggleLike,
    deleteComment
  } = usePosts();

  const [expanded, setExpanded] = useState(null);

  const sorted = useMemo(() => {
    return [...posts].sort((a,b)=>
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );
  }, [posts]);

  const confirmDeletePost = (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    deletePost(post.id);
  };

  return (
    <div className="admin-page">

      <h1>Posts Moderation</h1>

      <div className="table">

        <div className="row head">
          <div>Title</div>
          <div className="right">Likes</div>
          <div className="right">Comments</div>
          <div className="right">Actions</div>
        </div>

        {sorted.map(post => {

          const isOpen = expanded === post.id;

          return (
            <React.Fragment key={post.id}>

              {/* POST ROW */}
              <div className="row">

                <div className="strong">
                  {post.title}
                </div>

                <div className="right">
                  {post.likes?.length || 0}
                </div>

                <div className="right">
                  {post.comments?.length || 0}
                </div>

                <div className="actions">

                  <button
                    className="btn"
                    onClick={() =>
                      setExpanded(isOpen ? null : post.id)
                    }
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>

                  <button
                    className="btn danger"
                    onClick={() => confirmDeletePost(post)}
                  >
                    Delete Post
                  </button>

                </div>

              </div>

              {/* COMMENTS PANEL */}
              {isOpen && (
                <div className="row" style={{ background:"#fafafa" }}>

                  <div style={{ gridColumn:"1 / -1" }}>

                    <h4>Comments</h4>

                    {!post.comments?.length && (
                      <p className="admin-muted">
                        No comments
                      </p>
                    )}

                    {post.comments?.map(comment => (
                      <div
                        key={comment.id}
                        style={{
                          display:"flex",
                          justifyContent:"space-between",
                          marginBottom:8
                        }}
                      >

                        <div>
                          <strong>{comment.author}</strong>
                          <p>{comment.text}</p>
                        </div>

                        <button
                          className="btn danger"
                          onClick={() =>
                            deleteComment(post.id, comment.id)
                          }
                        >
                          Delete Comment
                        </button>

                      </div>
                    ))}

                  </div>

                </div>
              )}

            </React.Fragment>
          );
        })}

      </div>
    </div>
  );
}
