import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import JobsContext from "./jobsContext.js";
import jobsService from "../services/jobsService";
import { normalizeJob } from "../utils/normalizers";
const JOBS_CACHE_TTL_MS = 3 * 60 * 1000;
const REVALIDATE_MIN_INTERVAL_MS = 60 * 1000;

function readJobsResponse(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.jobs)) {
    return payload.jobs;
  }

  return [];
}

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsErrorMessage, setJobsErrorMessage] = useState("");
  const jobsRef = useRef([]);
  const hasLoadedRef = useRef(false);
  const inFlightRef = useRef(null);
  const etagRef = useRef("");
  const lastFetchedAtRef = useRef(0);

  const loadJobs = useCallback(
    async ({ force = false, background = false } = {}) => {
      const now = Date.now();
      const hasFreshCache =
        hasLoadedRef.current &&
        now - lastFetchedAtRef.current < JOBS_CACHE_TTL_MS;

      if (!force && hasFreshCache) {
        return jobsRef.current;
      }

      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      if (!background || !hasLoadedRef.current) {
        setIsLoadingJobs(true);
      }

      if (!background) {
        setJobsErrorMessage("");
      }

      const request = (async () => {
        try {
          const response = await jobsService.getJobs({
            headers: etagRef.current
              ? {
                  "If-None-Match": etagRef.current,
                }
              : undefined,
            validateStatus: (status) =>
              (status >= 200 && status < 300) || status === 304,
          });

          if (response.status === 304) {
            lastFetchedAtRef.current = Date.now();
            hasLoadedRef.current = true;
            return jobsRef.current;
          }

          const normalizedJobs = readJobsResponse(response).map(normalizeJob);
          jobsRef.current = normalizedJobs;
          setJobs(normalizedJobs);
          const responseEtag = response.headers?.etag;
          if (responseEtag) {
            etagRef.current = responseEtag;
          }
          lastFetchedAtRef.current = Date.now();
          hasLoadedRef.current = true;
          return normalizedJobs;
        } catch (error) {
          setJobsErrorMessage(error?.message || "Failed to load jobs.");

          if (!hasLoadedRef.current) {
            setJobs([]);
          }

          throw error;
        } finally {
          if (!background || !hasLoadedRef.current) {
            setIsLoadingJobs(false);
          }

          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = request;
      return request;
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadJobs().catch(() => {});
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadJobs]);

  useEffect(() => {
    const maybeRevalidate = () => {
      const now = Date.now();
      const shouldRevalidate =
        hasLoadedRef.current &&
        now - lastFetchedAtRef.current > REVALIDATE_MIN_INTERVAL_MS;

      if (!shouldRevalidate) {
        return;
      }

      loadJobs({ force: true, background: true }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        maybeRevalidate();
      }
    };

    const handleFocus = () => {
      maybeRevalidate();
    };

    const handleOnline = () => {
      maybeRevalidate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [loadJobs]);

  const value = useMemo(
    () => ({
      jobs,
      isLoadingJobs,
      jobsErrorMessage,
      reloadJobs: ({ background = false } = {}) =>
        loadJobs({ force: true, background }),
    }),
    [jobs, isLoadingJobs, jobsErrorMessage, loadJobs],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}
