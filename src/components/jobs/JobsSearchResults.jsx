import { Suspense, lazy } from "react";
import EmptyState from "../EmptyState.jsx";
import JobCardSkeleton from "../JobCardSkeleton.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";

const LazyJobCard = lazy(() => import("../JobCard.jsx"));

function JobsSearchResults({
  isLoading,
  errorMessage,
  saveError,
  filteredJobs,
  pageJobs,
  isSavedByCurrentUser,
  onToggleSave,
  isSavePending,
}) {
  return (
    <section aria-label="Search results">
      <h2>Results</h2>
      {!!saveError ? (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      ) : null}
      {!isLoading && !errorMessage && <p>{filteredJobs.length} jobs found</p>}

      {isLoading ? (
        <>
          <LoadingSpinner label="Loading jobs..." />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </>
      ) : null}

      {!isLoading && !!errorMessage && (
        <section role="alert" aria-live="polite">
          <h3>Could not load jobs</h3>
          <p>{errorMessage}</p>
        </section>
      )}

      {!isLoading && !errorMessage && filteredJobs.length === 0 && (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or search terms."
        />
      )}

      {!isLoading && !errorMessage && filteredJobs.length > 0 && (
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
              onToggleSave={onToggleSave}
              isSavePending={isSavePending(job)}
            />
          ))}
        </Suspense>
      )}
    </section>
  );
}

export default JobsSearchResults;
