import { useNavigate } from "react-router-dom";
import CollectionPagination from "../components/CollectionPagination.jsx";
import JobsSearchFilters from "../components/JobsSearchFilters.jsx";
import JobsSearchResults from "../components/JobsSearchResults.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import { useSearchUi } from "../contexts/SearchContext.jsx";
import useDebounce from "../hooks/useDebounce";
import useListResourceController from "../hooks/useListResourceController";
import useSavedJobsActions from "../hooks/useSavedJobsActions";
import { filterJobsByCriteria } from "../utils/filterJobs.js";

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

  const {
    setCurrentPage,
    totalCount: filteredJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = useListResourceController({
    sourceItems: jobs,
    sourceIsLoading: isLoading,
    sourceErrorMessage: errorMessage,
    pageSize: JOBS_PER_PAGE,
    filterValue: debouncedFilters,
    filterItems: (items, nextFilters) =>
      filterJobsByCriteria(items, nextFilters),
  });

  return (
    <main className="jobs-search-page">
      <h1>Search Jobs</h1>
      <p className="intro">
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
