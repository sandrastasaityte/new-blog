// Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, setPage }) => {
  return (
    <div className="pagination">
      <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={currentPage === i + 1 ? "active" : ""}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
    </div>
  );
};

export default Pagination;
