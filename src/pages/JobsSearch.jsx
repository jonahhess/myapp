import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionPagination from "../components/CollectionPagination.jsx";
import JobsSearchFilters from "../components/jobs/JobsSearchFilters.jsx";
import JobsSearchResults from "../components/jobs/JobsSearchResults.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import { useSearchUi } from "../contexts/SearchContext.jsx";
import useDebounce from "../hooks/useDebounce";
import usePagedCollection from "../hooks/usePagedCollection";
import useSavedJobsActions from "../hooks/useSavedJobsActions";
import { filterJobsByCriteria } from "./jobsSearch/filterJobs";

const JOBS_PER_PAGE = 6;

function JobsSearch() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { filters, updateFilter, resetFilters } = useSearchUi();
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
        navigate("/login", { state: { from: { pathname: "/jobs" } } }),
      onToggleSuccess: () => reloadJobs({ background: true }),
      failureMessage: "Failed to update saved status.",
    });
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const filteredJobs = useMemo(
    () => filterJobsByCriteria(jobs, debouncedFilters),
    [debouncedFilters, jobs],
  );
  const {
    totalCount: filteredJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = usePagedCollection({
    items: filteredJobs,
    currentPage,
    pageSize: JOBS_PER_PAGE,
  });

  return (
    <main className="jobs-search-page">
      <h1>Search Jobs</h1>
      <p className="jobs-search-page__intro">
        Filter by role, company, category, location, experience, and salary to
        find the most relevant opportunities.
      </p>

      <JobsSearchFilters
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <JobsSearchResults
        isLoading={isLoading}
        errorMessage={errorMessage}
        saveError={saveError}
        filteredJobsCount={filteredJobsCount}
        pageJobs={pageJobs}
        isSavedByCurrentUser={isSavedByCurrentUser}
        onToggleSave={handleToggleSave}
        isSavePending={isSavePending}
      />

      <CollectionPagination
        isLoading={isLoading}
        errorMessage={errorMessage}
        totalCount={filteredJobsCount}
        pageSize={JOBS_PER_PAGE}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}

export default JobsSearch;
