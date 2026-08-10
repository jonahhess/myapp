import { Suspense, lazy, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeletonStack from "../components/JobCardSkeletonStack.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
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
  const totalJobsCount = jobs.length;

  const totalPages = Math.max(1, Math.ceil(totalJobsCount / JOBS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = useMemo(
    () => jobs.slice(pageStart, pageStart + JOBS_PER_PAGE),
    [jobs, pageStart],
  );

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

        {isLoading ? (
          <>
            <LoadingSpinner label="Loading jobs..." />
            <JobCardSkeletonStack />
          </>
        ) : null}

        {!isLoading && !!errorMessage && (
          <section role="alert" aria-live="polite">
            <h3>Could not load jobs</h3>
            <p>{errorMessage}</p>
          </section>
        )}

        {!isLoading && !errorMessage && pageJobs.length === 0 && (
          <EmptyState
            title="No jobs found"
            description="Try a different search term or check back later for new postings."
          />
        )}

        {!isLoading && !errorMessage && pageJobs.length > 0 && (
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
        )}
      </section>

      {!isLoading && !errorMessage && totalJobsCount > JOBS_PER_PAGE && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
}

export default Home;
