import { Suspense, lazy } from "react";
import CollectionStateSwitch from "./CollectionStateSwitch.jsx";
import EmptyState from "./EmptyState.jsx";
import JobCardSkeletonStack from "./JobCardSkeletonStack.jsx";

const LazyJobCard = lazy(() => import("./JobCard.jsx"));

function JobsSearchResults({
  isLoading,
  errorMessage,
  saveError,
  filteredJobsCount,
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
      {!isLoading && !errorMessage && <p>{filteredJobsCount} jobs found</p>}

      <CollectionStateSwitch
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={filteredJobsCount === 0}
        loadingLabel="Loading jobs..."
        errorTitle="Could not load jobs"
        loadingFallback={<JobCardSkeletonStack />}
        emptyState={
          <EmptyState
            title="No jobs found"
            description="Try adjusting your filters or search terms."
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
              isSaved={isSavedByCurrentUser(job)}
              onToggleSave={onToggleSave}
              isSavePending={isSavePending(job)}
            />
          ))}
        </Suspense>
      </CollectionStateSwitch>
    </section>
  );
}

export default JobsSearchResults;
