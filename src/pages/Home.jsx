import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionPagination from "../components/CollectionPagination.jsx";
import CollectionStateSwitch from "../components/CollectionStateSwitch.jsx";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeletonStack from "../components/JobCardSkeletonStack.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import usePagedCollection from "../hooks/usePagedCollection";
import { useJobs } from "../contexts/JobsContext.jsx";
import useSavedJobsActions from "../hooks/useSavedJobsActions";

const LazyJobCard = lazy(() => import("../components/JobCard.jsx"));
const JOBS_PER_PAGE = 6;

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
      isAuthenticated,
      onRequireAuth: () =>
        navigate("/login", { state: { from: { pathname: "/" } } }),
      onToggleSuccess: () => reloadJobs({ background: true }),
      failureMessage: "Failed to update saved status.",
    });
  const {
    totalCount: totalJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = usePagedCollection({
    items: jobs,
    currentPage,
    pageSize: JOBS_PER_PAGE,
  });

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
        {!!saveError ? (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        ) : null}
        {!isLoading && !errorMessage && (
          <p>
            Showing {pageJobs.length} jobs on this page, {totalJobsCount} total.
            Use Search for advanced filtering.
          </p>
        )}

        <CollectionStateSwitch
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={pageJobs.length === 0}
          loadingLabel="Loading jobs..."
          errorTitle="Could not load jobs"
          loadingFallback={<JobCardSkeletonStack />}
          emptyState={
            <EmptyState
              title="No jobs found"
              description="Try a different search term or check back later for new postings."
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
                onToggleSave={handleToggleSave}
                isSavePending={isSavePending(job)}
              />
            ))}
          </Suspense>
        </CollectionStateSwitch>
      </section>

      <CollectionPagination
        isLoading={isLoading}
        errorMessage={errorMessage}
        totalCount={totalJobsCount}
        pageSize={JOBS_PER_PAGE}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}

export default Home;
