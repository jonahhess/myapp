import { use } from "react";
import JobsContext from "../contexts/jobsContext.js";

export default function useJobs(options = {}) {
  const { optional = false } = options;
  const context = use(JobsContext);

  if (!context) {
    if (optional) {
      return null;
    }

    throw new Error("useJobs must be used within JobsProvider");
  }

  return context;
}
