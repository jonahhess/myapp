import { use } from "react";
import SearchContext from "../contexts/searchContext.js";

export default function useSearchUi() {
  const context = use(SearchContext);

  if (!context) {
    throw new Error("useSearchUi must be used within SearchProvider");
  }

  return context;
}
