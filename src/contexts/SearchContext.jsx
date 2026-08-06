import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SearchContext = createContext(null);

const DEFAULT_FILTERS = {
  title: "",
  company: "",
  category: "",
  location: "",
  employmentType: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
};

export function SearchProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((value) => !value);
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => ({
      isSearchOpen,
      filters,
      openSearch,
      closeSearch,
      toggleSearch,
      updateFilter,
      resetFilters,
    }),
    [
      closeSearch,
      filters,
      isSearchOpen,
      openSearch,
      resetFilters,
      toggleSearch,
      updateFilter,
    ],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearchUi() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearchUi must be used within SearchProvider");
  }

  return context;
}
