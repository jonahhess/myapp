import Pagination from "./Pagination.jsx";

function CollectionPagination({
  isLoading,
  errorMessage = "",
  totalCount = 0,
  pageSize = 1,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const safePageSize = Math.max(1, Number(pageSize) || 1);

  if (isLoading || !!errorMessage || totalCount <= safePageSize) {
    return null;
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}

export default CollectionPagination;
