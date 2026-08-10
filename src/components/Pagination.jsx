function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page) => {
    if (
      !onPageChange ||
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange(page);
  };

  const handlePrevious = () => {
    goToPage(currentPage - 1);
  };

  const handleNext = () => {
    goToPage(currentPage + 1);
  };

  const pages = [];
  const hasManyPages = totalPages > 7;

  if (!hasManyPages) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
  } else {
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("start-ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    pages.push(totalPages);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <ol className="pages" aria-label="Page numbers">
        {pages.map((item) => {
          if (typeof item !== "number") {
            return (
              <li key={item} className="ellipsis" aria-hidden="true">
                ...
              </li>
            );
          }

          const isActive = item === currentPage;
          return (
            <li key={item}>
              <button
                className={`button page${isActive ? " active" : ""}`}
                onClick={() => goToPage(item)}
                aria-current={isActive ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ol>

      <span className="status" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
