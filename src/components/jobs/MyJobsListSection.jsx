import { Suspense, lazy } from "react";
import EmptyState from "../EmptyState.jsx";
import JobCardSkeleton from "../JobCardSkeleton.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import Pagination from "../Pagination.jsx";
import { JOBS_PER_PAGE } from "../../pages/myJobs/myJobsUtils";

const LazyJobCard = lazy(() => import("../JobCard.jsx"));

function MyJobsListSection({
  pageJobs,
  jobs,
  isLoading,
  errorMessage,
  isDeletingJob,
  jobPendingDelete,
  safeCurrentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDeleteRequest,
  onCreateFirstJob,
}) {
  return (
    <>
      {isLoading ? (
        <>
          <LoadingSpinner label="Loading your jobs..." />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </>
      ) : null}

      {!isLoading && !!errorMessage && (
        <section role="alert" aria-live="polite">
          <h2>Could not load your jobs</h2>
          <p>{errorMessage}</p>
        </section>
      )}

      {!isLoading && !errorMessage && pageJobs.length === 0 && (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first job post to start receiving applications."
          actionLabel="Publish Your First Job"
          onAction={onCreateFirstJob}
        />
      )}

      {!isLoading && !errorMessage && pageJobs.length > 0 && (
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
              canEdit
              canDelete
              onEdit={onEdit}
              onDelete={onDeleteRequest}
              isDeletePending={Boolean(
                isDeletingJob && jobPendingDelete?.id === job.id,
              )}
            />
          ))}
        </Suspense>
      )}

      {!isLoading && !errorMessage && jobs.length > JOBS_PER_PAGE && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

export default MyJobsListSection;
