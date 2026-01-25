import React, { useId, useMemo, useState } from "react";
import "./CommentSection.css";

export default function CommentSection({
  comments = [],
  onAddComment,
  busy = false,
  maxLength = 500,
}) {
  const nameId = useId();
  const textId = useId();

  const normalized = useMemo(() => {
    return (comments || [])
      .map((c) => ({
        name: String(c?.name || "Anonymous").trim() || "Anonymous",
        text: String(c?.text || "").trim(),
        date: c?.date ? String(c.date) : "",
      }))
      .filter((c) => c.text);
  }, [comments]);

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const remaining = maxLength - text.length;

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

    // keep name (nice for multiple comments), clear text
    setText("");
  };

  const onTextChange = (e) => {
    setText(e.target.value);
    if (error) setError("");
  };

  return (
    <section className="comment-section" aria-label="Comments">
      <h3 className="comment-title">Comments</h3>

      {normalized.length === 0 ? (
        <p className="comment-empty" aria-live="polite">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="comment-list" aria-live="polite">
          {normalized.map((c, idx) => (
            <div
              key={`${c.name}-${c.text.slice(0, 24)}-${idx}`}
              className="comment-item"
            >
              <div className="comment-head">
                <strong className="comment-name">{c.name}</strong>
                {c.date ? (
                  <span className="comment-date">
                    {new Date(c.date).toLocaleDateString()}
                  </span>
                ) : null}
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
          />

          <div className="comment-counter" aria-live="polite">
            {remaining} characters left
          </div>
        </div>

        {error ? (
          <p className="comment-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy || !text.trim()}>
          {busy ? "Posting…" : "Post"}
        </button>
      </form>
    </section>
  );
}
