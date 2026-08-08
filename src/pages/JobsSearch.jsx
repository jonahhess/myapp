import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeleton from "../components/JobCardSkeleton.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchInput from "../components/SearchInput.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import { useSearchUi } from "../contexts/SearchContext.jsx";
import useDebounce from "../hooks/useDebounce";
import useSavedJobsActions from "../hooks/useSavedJobsActions";

const LazyJobCard = lazy(() => import("../components/JobCard.jsx"));
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

  const filteredJobs = useMemo(() => {
    const title = debouncedFilters.title.trim().toLowerCase();
    const company = debouncedFilters.company.trim().toLowerCase();
    const category = debouncedFilters.category.trim().toLowerCase();
    const location = debouncedFilters.location.trim().toLowerCase();
    const employmentType = debouncedFilters.employmentType.trim().toLowerCase();
    const experienceLevel = debouncedFilters.experienceLevel
      .trim()
      .toLowerCase();
    const salaryMin = Number(debouncedFilters.salaryMin);
    const salaryMax = Number(debouncedFilters.salaryMax);
    const hasSalaryMin =
      Number.isFinite(salaryMin) && debouncedFilters.salaryMin !== "";
    const hasSalaryMax =
      Number.isFinite(salaryMax) && debouncedFilters.salaryMax !== "";

    return jobs.filter((job) => {
      const matchesTitle =
        !title || (job.title || "").toLowerCase().includes(title);
      const matchesCompany =
        !company || (job.company || "").toLowerCase().includes(company);
      const matchesCategory =
        !category || (job.category || "").toLowerCase().includes(category);
      const matchesLocation =
        !location || (job.location || "").toLowerCase().includes(location);
      const matchesEmploymentType =
        !employmentType ||
        (job.jobType || "").toLowerCase().includes(employmentType);
      const matchesExperienceLevel =
        !experienceLevel ||
        (job.experienceLevel || "").toLowerCase().includes(experienceLevel);

      const jobMinSalary = Number(job.salaryMin);
      const jobMaxSalary = Number(job.salaryMax);
      const matchesSalaryMin =
        !hasSalaryMin ||
        (Number.isFinite(jobMaxSalary) && jobMaxSalary >= salaryMin);
      const matchesSalaryMax =
        !hasSalaryMax ||
        (Number.isFinite(jobMinSalary) && jobMinSalary <= salaryMax);

      return (
        matchesTitle &&
        matchesCompany &&
        matchesCategory &&
        matchesLocation &&
        matchesEmploymentType &&
        matchesExperienceLevel &&
        matchesSalaryMin &&
        matchesSalaryMax
      );
    });
  }, [debouncedFilters, jobs]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / JOBS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = filteredJobs.slice(pageStart, pageStart + JOBS_PER_PAGE);

  return (
    <main className="jobs-search-page">
      <h1>Search Jobs</h1>
      <p className="jobs-search-page__intro">
        Filter by role, company, category, location, experience, and salary to
        find the most relevant opportunities.
      </p>

      <section className="jobs-search-filters" aria-label="Job filters">
        <div className="jobs-search-grid">
          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-title">Job title</label>
            <SearchInput
              id="jobs-filter-title"
              value={filters.title}
              onChange={(event) => updateFilter("title", event.target.value)}
              placeholder="e.g. Full Stack Developer"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-company">Company name</label>
            <SearchInput
              id="jobs-filter-company"
              value={filters.company}
              onChange={(event) => updateFilter("company", event.target.value)}
              placeholder="e.g. Tech Solutions Ltd"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-category">Category</label>
            <SearchInput
              id="jobs-filter-category"
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
              placeholder="e.g. development"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-location">Location</label>
            <SearchInput
              id="jobs-filter-location"
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
              placeholder="e.g. Tel Aviv"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-employmentType">Employment type</label>
            <SearchInput
              id="jobs-filter-employmentType"
              value={filters.employmentType}
              onChange={(event) =>
                updateFilter("employmentType", event.target.value)
              }
              placeholder="e.g. full-time"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-experienceLevel">
              Experience level
            </label>
            <SearchInput
              id="jobs-filter-experienceLevel"
              value={filters.experienceLevel}
              onChange={(event) =>
                updateFilter("experienceLevel", event.target.value)
              }
              placeholder="e.g. senior"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-salaryMin">Minimum salary</label>
            <input
              id="jobs-filter-salaryMin"
              type="number"
              min="0"
              value={filters.salaryMin}
              onChange={(event) =>
                updateFilter("salaryMin", event.target.value)
              }
              placeholder="Optional"
            />
          </div>

          <div className="jobs-search-field">
            <label htmlFor="jobs-filter-salaryMax">Maximum salary</label>
            <input
              id="jobs-filter-salaryMax"
              type="number"
              min="0"
              value={filters.salaryMax}
              onChange={(event) =>
                updateFilter("salaryMax", event.target.value)
              }
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="jobs-search-actions">
          <button type="button" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      </section>

      <section aria-label="Search results">
        <h2>Results</h2>
        {saveError ? (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        ) : null}
        {!isLoading && !errorMessage ? (
          <p>{filteredJobs.length} jobs found</p>
        ) : null}

        {isLoading ? (
          <>
            <LoadingSpinner label="Loading jobs..." />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : null}

        {!isLoading && errorMessage ? (
          <section role="alert" aria-live="polite">
            <h3>Could not load jobs</h3>
            <p>{errorMessage}</p>
          </section>
        ) : null}

        {!isLoading && !errorMessage && filteredJobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try adjusting your filters or search terms."
          />
        ) : null}

        {!isLoading && !errorMessage && filteredJobs.length > 0 ? (
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
                onToggleSave={handleToggleSave}
                isSavePending={isSavePending(job)}
              />
            ))}
          </Suspense>
        ) : null}
      </section>

      {!isLoading && !errorMessage && filteredJobs.length > JOBS_PER_PAGE ? (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </main>
  );
}

export default JobsSearch;
