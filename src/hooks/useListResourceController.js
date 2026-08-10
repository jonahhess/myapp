import { useEffect, useMemo, useRef, useState } from "react";
import useAsyncListResource from "./useAsyncListResource";
import usePagedCollection from "./usePagedCollection";

export default function useListResourceController({
  fetcher,
  mapItems,
  errorMessage = "Failed to load data.",
  clearItemsOnError = false,
  sourceItems,
  sourceIsLoading = false,
  sourceErrorMessage = "",
  pageSize = 1,
  initialPage = 1,
  filterValue,
  filterItems,
  resetPageOnFilterChange = true,
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const hasHydratedFilterRef = useRef(false);
  const hasExternalSource = Array.isArray(sourceItems);
  const hasFilter = typeof filterItems === "function";

  const {
    items: asyncItems,
    setItems: setAsyncItems,
    isLoading: isAsyncLoading,
    errorMessage: asyncError,
    setErrorMessage: setAsyncError,
    reload: reloadAsync,
  } = useAsyncListResource({
    fetcher: fetcher || (async () => []),
    mapItems: mapItems || ((payload) => payload),
    errorMessage,
    clearItemsOnError,
    enabled: !hasExternalSource,
  });

  const items = hasExternalSource ? sourceItems : asyncItems;
  const isLoading = hasExternalSource ? sourceIsLoading : isAsyncLoading;
  const loadError = hasExternalSource ? sourceErrorMessage : asyncError;
  const setErrorMessage = hasExternalSource ? () => {} : setAsyncError;
  const setItems = hasExternalSource ? () => {} : setAsyncItems;
  const reload = hasExternalSource ? async () => items : reloadAsync;

  const filteredItems = useMemo(() => {
    if (!hasFilter) {
      return items;
    }

    const nextItems = filterItems(items, filterValue);
    return Array.isArray(nextItems) ? nextItems : [];
  }, [filterItems, filterValue, hasFilter, items]);

  useEffect(() => {
    if (!resetPageOnFilterChange || !hasFilter) {
      return;
    }

    if (!hasHydratedFilterRef.current) {
      hasHydratedFilterRef.current = true;
      return;
    }

    setCurrentPage(1);
  }, [filterValue, hasFilter, resetPageOnFilterChange]);

  const { totalCount, totalPages, safeCurrentPage, pageStart, pageItems } =
    usePagedCollection({
      items: filteredItems,
      currentPage,
      pageSize,
    });

  return {
    items,
    filteredItems,
    pageItems,
    totalCount,
    totalPages,
    safeCurrentPage,
    pageStart,
    currentPage,
    setCurrentPage,
    pageSize,
    isLoading,
    errorMessage: loadError,
    setErrorMessage,
    setItems,
    reload,
  };
}
