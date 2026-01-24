import React, { useMemo } from "react";
import "./Pagination.css";

const getPages = (current, total) => {
  if (!total || total < 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const safe = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < safe.length; i++) {
    out.push(safe[i]);
    if (safe[i + 1] && safe[i + 1] - safe[i] > 1) out.push("…");
  }
  return out;
};

const Pagination = ({ currentPage = 1, totalPages = 1, setPage }) => {
  const items = useMemo(
    () => getPages(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const go = (p) => {
    if (typeof setPage !== "function") return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next !== currentPage) setPage(next);
  };

  if (!totalPages || totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      {/* Optional First */}
      <button
        type="button"
        onClick={() => go(1)}
        disabled={isFirst}
        aria-label="Go to first page"
      >
        First
      </button>

      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={isFirst}
        aria-label="Go to previous page"
      >
        Prev
      </button>

      {items.map((it, idx) =>
        it === "…" ? (
          <span key={`dots-${idx}`} className="dots" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={`page-${it}`}
            className={currentPage === it ? "active" : ""}
            onClick={() => go(it)}
            aria-current={currentPage === it ? "page" : undefined}
            aria-label={`Go to page ${it}`}
          >
            {it}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={isLast}
        aria-label="Go to next page"
      >
        Next
      </button>

      {/* Optional Last */}
      <button
        type="button"
        onClick={() => go(totalPages)}
        disabled={isLast}
        aria-label="Go to last page"
      >
        Last
      </button>

      <span className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
};

export default Pagination;
