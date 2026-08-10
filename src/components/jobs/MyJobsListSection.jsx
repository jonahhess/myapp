import { Suspense, lazy } from "react";
import CollectionStateSwitch from "../CollectionStateSwitch.jsx";
import EmptyState from "../EmptyState.jsx";
import JobCardSkeletonStack from "../JobCardSkeletonStack.jsx";
import Pagination from "../Pagination.jsx";
import { JOBS_PER_PAGE } from "../../pages/myJobs/myJobsUtils";

const LazyJobCard = lazy(() => import("../JobCard.jsx"));

function MyJobsListSection({
  pageJobs,
  totalJobsCount,
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
      <CollectionStateSwitch
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={pageJobs.length === 0}
        loadingLabel="Loading your jobs..."
        loadingFallback={<JobCardSkeletonStack />}
        errorFallback={
          <section role="alert" aria-live="polite">
            <h2>Could not load your jobs</h2>
            <p>{errorMessage}</p>
          </section>
        }
        emptyState={
          <EmptyState
            title="No jobs posted yet"
            description="Create your first job post to start receiving applications."
            actionLabel="Publish Your First Job"
            onAction={onCreateFirstJob}
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
      </CollectionStateSwitch>

      {!isLoading && !errorMessage && totalJobsCount > JOBS_PER_PAGE && (
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
