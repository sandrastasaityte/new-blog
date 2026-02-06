import React, { useId, useMemo, useState, useRef, useEffect } from "react";
import "./CommentSection.css";

export default function CommentSection({
  comments = [],
  onAddComment,
  busy = false,
  maxLength = 500,
}) {
  const nameId = useId();
  const textId = useId();

  // Normalize comments
  const normalized = useMemo(
    () =>
      (comments || [])
        .map((c) => ({
          name: String(c?.name || "Anonymous").trim() || "Anonymous",
          text: String(c?.text || "").trim(),
          date: c?.date ? String(c.date) : "",
        }))
        .filter((c) => c.text),
    [comments]
  );

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const remaining = maxLength - text.length;

  // Scroll to bottom smoothly on new comment
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [normalized.length]);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;

    const payload = {
      name: name.trim() || "Anonymous",
      text: text.trim(),
      date: new Date().toISOString(),
    };

    if (!payload.text) return;

    if (payload.text.length > maxLength) {
      setError(`Comment is too long (max ${maxLength} characters).`);
      return;
    }

    setError("");
    onAddComment?.(payload);
    setText("");
  };

  const onTextChange = (e) => {
    setText(e.target.value);
    if (error) setError("");
  };

  const onNameBlur = () => setName((n) => n.trim());

  return (
    <section className="comment-section" aria-label="Comments">
      <h3 className="comment-title">Comments</h3>

      {normalized.length === 0 ? (
        <p className="comment-empty" role="status">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="comment-list" ref={listRef} role="list">
          {normalized.map((c, idx) => (
            <div
              key={`${c.date}-${idx}`}
              className="comment-item fade-in"
              role="listitem"
            >
              <div className="comment-head">
                <strong className="comment-name">{c.name}</strong>
                {c.date && (
                  <span className="comment-date">
                    {new Date(c.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={submit}>
        <label className="sr-only" htmlFor={nameId}>
          Your name
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onNameBlur}
          placeholder="Your name (optional)"
          autoComplete="name"
          disabled={busy}
        />

        <div className="comment-textarea-wrap">
          <label className="sr-only" htmlFor={textId}>
            Write a comment
          </label>
          <textarea
            id={textId}
            value={text}
            onChange={onTextChange}
            placeholder="Write a comment…"
            required
            rows={3}
            maxLength={maxLength}
            disabled={busy}
            className={remaining <= 10 ? "warning" : ""}
          />
          <div className="comment-counter" role="status">
            {remaining} characters left
          </div>
        </div>

        {error && (
          <p className="comment-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || !text.trim()}>
          {busy ? "Posting…" : "Post"}
        </button>
      </form>
    </section>
  );
}
