import { Suspense, lazy, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeleton from "../components/JobCardSkeleton.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";

const LazyJobCard = lazy(() => import("../components/JobCard.jsx"));
const JOBS_PER_PAGE = 6;

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    jobs,
    isLoadingJobs: isLoading,
    jobsErrorMessage: errorMessage,
  } = useJobs();
  const [currentPage, setCurrentPage] = useState(1);
  const [saveOverrides, setSaveOverrides] = useState({});
  const [saveError, setSaveError] = useState("");
  const [pendingSaveIds, setPendingSaveIds] = useState({});

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = useMemo(
    () => jobs.slice(pageStart, pageStart + JOBS_PER_PAGE),
    [jobs, pageStart],
  );

  const isSavedByCurrentUser = (job) => {
    if (!isAuthenticated || !user?.id || !job) {
      return false;
    }

    const overrideValue = saveOverrides[job.id];
    if (typeof overrideValue === "boolean") {
      return overrideValue;
    }

    return (job.savedBy || []).some(
      (savedUserId) => String(savedUserId) === String(user.id),
    );
  };

  const handleToggleSave = async (job) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }

    if (pendingSaveIds[job.id]) {
      return;
    }

    setSaveError("");
    const previousState = isSavedByCurrentUser(job);
    setSaveOverrides((prev) => ({ ...prev, [job.id]: !previousState }));
    setPendingSaveIds((prev) => ({ ...prev, [job.id]: true }));

    try {
      const payload = await jobsService.toggleSaveJob(job.id);
      const updatedSavedBy =
        payload?.savedBy ||
        payload?.job?.savedBy ||
        payload?.data?.job?.savedBy;
      if (Array.isArray(updatedSavedBy) && user?.id) {
        const nextState = updatedSavedBy.some(
          (savedUserId) => String(savedUserId) === String(user.id),
        );
        setSaveOverrides((prev) => ({ ...prev, [job.id]: nextState }));
      }
    } catch (error) {
      setSaveOverrides((prev) => ({ ...prev, [job.id]: previousState }));
      setSaveError(
        getUserFriendlyErrorMessage(error, "Failed to update saved status."),
      );
    } finally {
      setPendingSaveIds((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <main className="home-page">
      <h1>Find Your Next Opportunity</h1>
      <p className="home-page__intro">
        Jonah's Job Board connects candidates with verified opportunities and
        gives recruiters a focused space to publish, manage, and promote open
        positions.
      </p>

      <section aria-label="Job listings">
        <h2>All Job Listings</h2>
        {saveError ? (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        ) : null}
        {!isLoading && !errorMessage ? (
          <p>
            Showing {pageJobs.length} jobs on this page, {jobs.length} total.
            Use Search for advanced filtering.
          </p>
        ) : null}

        {isLoading ? (
          <>
            <LoadingSpinner label="Loading jobs..." />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : null}

        {!isLoading && errorMessage ? (
          <section role="alert" aria-live="polite">
            <h3>Could not load jobs</h3>
            <p>{errorMessage}</p>
          </section>
        ) : null}

        {!isLoading && !errorMessage && pageJobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try a different search term or check back later for new postings."
          />
        ) : null}

        {!isLoading && !errorMessage && pageJobs.length > 0 ? (
          <Suspense
            fallback={
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            }
          >
            {pageJobs.map((job) => (
              <LazyJobCard
                key={job.id || `${job.title}-${job.company}`}
                job={job}
                isSaved={isSavedByCurrentUser(job)}
                onToggleSave={handleToggleSave}
                isSavePending={Boolean(pendingSaveIds[job.id])}
              />
            ))}
          </Suspense>
        ) : null}
      </section>

      {!isLoading && !errorMessage && jobs.length > JOBS_PER_PAGE ? (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </main>
  );
}

export default Home;
