import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import JobCardSkeleton from "../components/JobCardSkeleton.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeJob } from "../utils/normalizers";

const LazyJobCard = lazy(() => import("../components/JobCard.jsx"));
const JOBS_PER_PAGE = 6;

function readJobsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.jobs)) {
    return payload.jobs;
  }

  return [];
}

function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMyJobs() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const payload = await jobsService.getMyJobs();
        const nextJobs = readJobsPayload(payload).map(normalizeJob);
        if (isMounted) {
          setJobs(nextJobs);
        }
      } catch (error) {
        if (isMounted) {
          setJobs([]);
          setErrorMessage(
            getUserFriendlyErrorMessage(error, "Failed to load your jobs."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMyJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = useMemo(
    () => jobs.slice(pageStart, pageStart + JOBS_PER_PAGE),
    [jobs, pageStart],
  );

  const handleEdit = (job) => {
    navigate(`/jobs/${job.id}/edit`);
  };

  const handleDeleteRequest = (job) => {
    if (isDeletingJob) {
      return;
    }

    setJobPendingDelete(job);
  };

  const handleDeleteCancel = () => {
    setJobPendingDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!jobPendingDelete?.id) {
      return;
    }

    if (isDeletingJob) {
      return;
    }

    setIsDeletingJob(true);

    try {
      await jobsService.deleteJob(jobPendingDelete.id);
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobPendingDelete.id),
      );
      setToastMessage(`Deleted \"${jobPendingDelete.title}\" successfully.`);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        getUserFriendlyErrorMessage(error, "Failed to delete the job."),
      );
    } finally {
      setIsDeletingJob(false);
      setJobPendingDelete(null);
    }
  };

  return (
    <main className="job-page">
      <header className="job-page__header">
        <div>
          <h1>My Posted Jobs</h1>
          <p className="job-page__intro">
            Recruiter dashboard for managing your published positions.
          </p>
        </div>
        <button
          type="button"
          className="job-page__cta"
          onClick={() => navigate("/create/jobs")}
        >
          Post a New Job
        </button>
      </header>

      {isLoading ? (
        <>
          <LoadingSpinner label="Loading your jobs..." />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </>
      ) : null}

      {toastMessage ? <p className="form-success">{toastMessage}</p> : null}

      {!isLoading && errorMessage ? (
        <section role="alert" aria-live="polite">
          <h2>Could not load your jobs</h2>
          <p>{errorMessage}</p>
        </section>
      ) : null}

      {!isLoading && !errorMessage && pageJobs.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first job post to start receiving applications."
          actionLabel="Publish Your First Job"
          onAction={() => navigate("/create/jobs")}
        />
      ) : null}

      {!isLoading && !errorMessage && pageJobs.length > 0 ? (
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
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              isDeletePending={Boolean(
                isDeletingJob && jobPendingDelete?.id === job.id,
              )}
            />
          ))}
        </Suspense>
      ) : null}

      {!isLoading && !errorMessage && jobs.length > JOBS_PER_PAGE ? (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}

      <ConfirmationModal
        isOpen={Boolean(jobPendingDelete)}
        title="Delete this job?"
        message={`This will permanently delete \"${jobPendingDelete?.title || "this job"}\". This action cannot be undone.`}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        cancelLabel="Cancel"
        confirmLabel="Delete permanently"
        confirmDisabled={isDeletingJob}
        cancelDisabled={isDeletingJob}
      />
    </main>
  );
}

export default MyJobs;
