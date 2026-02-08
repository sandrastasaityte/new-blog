import React, { useMemo, useCallback } from "react";
import "./Pagination.css";

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (sorted[i + 1] && sorted[i + 1] - sorted[i] > 1) {
      result.push("...");
    }
  }

  return result;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const pages = useMemo(
    () => buildPages(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const go = useCallback(
    (page) => {
      if (!onPageChange) return;
      const safe = Math.max(1, Math.min(totalPages, page));
      if (safe !== currentPage) onPageChange(safe);
    },
    [currentPage, totalPages, onPageChange]
  );

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul className="pagination-list">

        <li>
          <button
            onClick={() => go(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </button>
        </li>

        <li>
          <button
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
        </li>

        {pages.map((p, i) =>
          p === "..." ? (
            <li key={`dots-${i}`} className="dots">...</li>
          ) : (
            <li key={p}>
              <button
                className={p === currentPage ? "active" : ""}
                onClick={() => go(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            </li>
          )
        )}

        <li>
          <button
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </li>

        <li>
          <button
            onClick={() => go(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}
