import React, {
  useId,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import StarRating from "../StarRating/StarRating";
import "./CommentSection.css";

/* ============================= */
/* Get Logged User */
/* ============================= */

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CommentSection({
  comments = [],
  onAddComment,
  busy = false,
  maxLength = 500,
}) {
  const nameId = useId();
  const textId = useId();

  /* ============================= */
  /* Logged User */
  /* ============================= */

  const currentUser = useMemo(() => getCurrentUser(), []);

  /* ============================= */
  /* Normalize Comments */
  /* ============================= */

  const normalized = useMemo(
    () =>
      (comments || [])
        .map((c) => ({
          name: String(c?.name || "Guest"),
          text: String(c?.text || ""),
          rating: Number(c?.rating || 0),
          date: c?.date ? String(c.date) : "",
        }))
        .filter((c) => c.text),
    [comments]
  );

  /* ============================= */
  /* Average Rating */
  /* ============================= */

  const averageRating = useMemo(() => {
    if (!normalized.length) return 0;

    const total = normalized.reduce((sum, c) => sum + c.rating, 0);
    return (total / normalized.length).toFixed(1);
  }, [normalized]);

  /* ============================= */
  /* State */
  /* ============================= */

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const remaining = maxLength - text.length;

  /* ============================= */
  /* Autofill user name */
  /* ============================= */

  useEffect(() => {
    if (currentUser?.name && !name) {
      setName(currentUser.name);
    }
  }, [currentUser, name]);

  /* ============================= */
  /* Scroll on new comment */
  /* ============================= */

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [normalized.length]);

  /* ============================= */
  /* Submit */
  /* ============================= */

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      if (busy) return;

      if (!rating) {
        setError("Please select rating.");
        return;
      }

      const payload = {
        name:
          name.trim() ||
          currentUser?.name ||
          currentUser?.email ||
          "Guest",

        text: text.trim(),
        rating,
        date: new Date().toISOString(),
      };

      if (!payload.text) return;

      if (payload.text.length > maxLength) {
        setError(`Comment too long (max ${maxLength}).`);
        return;
      }

      setError("");
      onAddComment?.(payload);

      setText("");
      setRating(0);
    },
    [busy, rating, name, text, maxLength, onAddComment, currentUser]
  );

  /* ============================= */
  /* Render */
  /* ============================= */

  return (
    <section className="comment-section" aria-label="Reviews">
      {/* ===== Header ===== */}

      <div className="review-header">
        <h3>Reviews</h3>

        {normalized.length > 0 && (
          <div className="review-summary">
            <StarRating value={Number(averageRating)} disabled />
            <span className="review-average">
              {averageRating} / 5 ({normalized.length})
            </span>
          </div>
        )}
      </div>

      {/* ===== Comment List ===== */}

      {normalized.length === 0 ? (
        <p className="comment-empty">No reviews yet</p>
      ) : (
        <div className="comment-list" ref={listRef}>
          {normalized.map((c, idx) => (
            <div key={`${c.date}-${idx}`} className="comment-item">
              <div className="comment-head">
                <strong>{c.name}</strong>

                {c.rating > 0 && (
                  <StarRating value={c.rating} disabled />
                )}

                {c.date && (
                  <span className="comment-date">
                    {new Date(c.date).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p>{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ===== Form ===== */}

      <form className="comment-form" onSubmit={submit}>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          autoComplete="name"
          disabled={busy}
        />

        {/* ⭐ Rating */}
        <div className="rating-field">
          <span>Your rating</span>
          <StarRating
            value={rating}
            onChange={setRating}
            disabled={busy}
          />
        </div>

        <textarea
          id={textId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review…"
          required
          rows={3}
          maxLength={maxLength}
          disabled={busy}
        />

        <div className="comment-counter">
          {remaining} characters left
        </div>

        {error && <p className="comment-error">{error}</p>}

        <button disabled={busy || !text.trim()}>
          {busy ? "Posting…" : "Post Review"}
        </button>
      </form>
    </section>
  );
}
