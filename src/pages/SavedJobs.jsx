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

function SavedJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    jobs,
    isLoadingJobs: isLoading,
    jobsErrorMessage: errorMessage,
  } = useJobs();
  const [currentPage, setCurrentPage] = useState(1);
  const [saveOverrides, setSaveOverrides] = useState({});
  const [saveError, setSaveError] = useState("");
  const [pendingSaveIds, setPendingSaveIds] = useState({});

  const currentUserId = user?.id || user?._id || "";

  const savedJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (!currentUserId) {
          return false;
        }

        const overrideValue = saveOverrides[job.id];
        if (typeof overrideValue === "boolean") {
          return overrideValue;
        }

        return (job.savedBy || []).some(
          (savedUserId) => String(savedUserId) === String(currentUserId),
        );
      }),
    [jobs, currentUserId, saveOverrides],
  );

  const totalPages = Math.max(1, Math.ceil(savedJobs.length / JOBS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = savedJobs.slice(pageStart, pageStart + JOBS_PER_PAGE);

  const handleToggleSave = async (job) => {
    if (pendingSaveIds[job.id]) {
      return;
    }

    const previousState = Boolean(
      (job.savedBy || []).some(
        (savedUserId) => String(savedUserId) === String(currentUserId),
      ),
    );

    setSaveError("");
    setSaveOverrides((prev) => ({ ...prev, [job.id]: !previousState }));
    setPendingSaveIds((prev) => ({ ...prev, [job.id]: true }));

    try {
      const payload = await jobsService.toggleSaveJob(job.id);
      const updatedSavedBy =
        payload?.savedBy ||
        payload?.job?.savedBy ||
        payload?.data?.job?.savedBy;

      if (Array.isArray(updatedSavedBy) && currentUserId) {
        const nextState = updatedSavedBy.some(
          (savedUserId) => String(savedUserId) === String(currentUserId),
        );
        setSaveOverrides((prev) => ({ ...prev, [job.id]: nextState }));
      }
    } catch (error) {
      setSaveOverrides((prev) => ({ ...prev, [job.id]: previousState }));
      setSaveError(
        getUserFriendlyErrorMessage(error, "Failed to update saved jobs."),
      );
    } finally {
      setPendingSaveIds((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <main className="job-page">
      <h1>Saved Jobs</h1>
      <p className="job-page__intro">
        Jobs you bookmarked for later review and applications.
      </p>

      {saveError ? (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      ) : null}

      {isLoading ? (
        <>
          <LoadingSpinner label="Loading saved jobs..." />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </>
      ) : null}

      {!isLoading && errorMessage ? (
        <section role="alert" aria-live="polite">
          <h2>Could not load saved jobs</h2>
          <p>{errorMessage}</p>
        </section>
      ) : null}

      {!isLoading && !errorMessage && savedJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Save jobs from Home or Search and they will appear here."
          actionLabel="Browse Jobs"
          onAction={() => navigate("/jobs")}
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
              isSaved
              onToggleSave={handleToggleSave}
              isSavePending={Boolean(pendingSaveIds[job.id])}
            />
          ))}
        </Suspense>
      ) : null}

      {!isLoading && !errorMessage && savedJobs.length > JOBS_PER_PAGE ? (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </main>
  );
}

export default SavedJobs;
