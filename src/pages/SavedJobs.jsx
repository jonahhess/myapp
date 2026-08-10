import { Suspense, lazy, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionStateSwitch from "../components/CollectionStateSwitch.jsx";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeletonStack from "../components/JobCardSkeletonStack.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import usePagedCollection from "../hooks/usePagedCollection";
import useSavedJobsActions from "../hooks/useSavedJobsActions";

const LazyJobCard = lazy(() => import("../components/JobCard.jsx"));
const JOBS_PER_PAGE = 6;

function SavedJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    jobs,
    isLoadingJobs: isLoading,
    jobsErrorMessage: errorMessage,
    reloadJobs,
  } = useJobs();
  const [currentPage, setCurrentPage] = useState(1);
  const currentUserId = user?.id || user?._id || "";
  const { saveError, isSavePending, isSavedByCurrentUser, handleToggleSave } =
    useSavedJobsActions({
      currentUserId,
      isAuthenticated: Boolean(currentUserId),
      onToggleSuccess: () => reloadJobs({ background: true }),
      failureMessage: "Failed to update saved jobs.",
    });

  const savedJobs = useMemo(
    () => jobs.filter((job) => isSavedByCurrentUser(job)),
    [jobs, isSavedByCurrentUser],
  );
  const {
    totalCount: savedJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = usePagedCollection({
    items: savedJobs,
    currentPage,
    pageSize: JOBS_PER_PAGE,
  });

  return (
    <main className="job-page">
      <h1>Saved Jobs</h1>
      <p className="job-page__intro">
        Jobs you bookmarked for later review and applications.
      </p>

      {!!saveError ? (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      ) : null}

      <CollectionStateSwitch
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={savedJobsCount === 0}
        loadingLabel="Loading saved jobs..."
        loadingFallback={<JobCardSkeletonStack />}
        errorFallback={
          <section role="alert" aria-live="polite">
            <h2>Could not load saved jobs</h2>
            <p>{errorMessage}</p>
          </section>
        }
        emptyState={
          <EmptyState
            title="No saved jobs yet"
            description="Save jobs from Home or Search and they will appear here."
            actionLabel="Browse Jobs"
            onAction={() => navigate("/jobs")}
          />
        }
      >
        <Suspense
          fallback={
            <>
              <JobCardSkeletonStack />
            </>
          }
        >
          {pageJobs.map((job) => (
            <LazyJobCard
              key={job.id || `${job.title}-${job.company}`}
              job={job}
              isSaved
              onToggleSave={handleToggleSave}
              isSavePending={isSavePending(job)}
            />
          ))}
        </Suspense>
      </CollectionStateSwitch>

      {!isLoading && !errorMessage && savedJobsCount > JOBS_PER_PAGE && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
}

export default SavedJobs;
