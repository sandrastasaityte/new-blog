import React, { useMemo } from "react";
import "./Pagination.css";

const getPages = (current, total) => {
  if (!total || total < 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const safe = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < safe.length; i++) {
    out.push(safe[i]);
    if (safe[i + 1] && safe[i + 1] - safe[i] > 1) out.push("…");
  }
  return out;
};

export default function Pagination({ currentPage = 1, totalPages = 1, setPage }) {
  const items = useMemo(() => getPages(currentPage, totalPages), [currentPage, totalPages]);

  const go = (p) => {
    if (typeof setPage !== "function") return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next !== currentPage) setPage(next);
  };

  if (!totalPages || totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const renderButton = (label, targetPage, disabled, ariaLabel) => (
    <li>
      <button
        type="button"
        className={disabled ? "disabled-btn" : ""}
        onClick={() => go(targetPage)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {label}
      </button>
    </li>
  );

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul className="pagination-list">
        {renderButton("First", 1, isFirst, "Go to first page")}
        {renderButton("Prev", currentPage - 1, isFirst, "Go to previous page")}

        {items.map((it, idx) =>
          it === "…" ? (
            <li key={`dots-${idx}`} className="dots" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={`page-${it}`}>
              <button
                type="button"
                className={currentPage === it ? "active" : ""}
                onClick={() => go(it)}
                aria-current={currentPage === it ? "page" : undefined}
                aria-label={`Go to page ${it}`}
              >
                {it}
              </button>
            </li>
          )
        )}

        {renderButton("Next", currentPage + 1, isLast, "Go to next page")}
        {renderButton("Last", totalPages, isLast, "Go to last page")}
      </ul>

      <span className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
}
