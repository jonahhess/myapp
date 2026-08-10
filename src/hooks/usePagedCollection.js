import { useMemo } from "react";

export default function usePagedCollection({
  items = [],
  currentPage = 1,
  pageSize = 1,
}) {
  const safePageSize = Math.max(1, Number(pageSize) || 1);
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const pageStart = (safeCurrentPage - 1) * safePageSize;

  const pageItems = useMemo(
    () => items.slice(pageStart, pageStart + safePageSize),
    [items, pageStart, safePageSize],
  );

  return {
    totalCount,
    totalPages,
    safeCurrentPage,
    pageStart,
    pageItems,
  };
}
