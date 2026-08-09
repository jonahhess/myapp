import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import MyJobsListSection from "../components/jobs/MyJobsListSection.jsx";
import useMyJobs from "./myJobs/useMyJobs";

function MyJobs() {
  const navigate = useNavigate();
  const {
    jobs,
    pageJobs,
    isLoading,
    errorMessage,
    totalPages,
    safeCurrentPage,
    jobPendingDelete,
    toastMessage,
    isDeletingJob,
    setCurrentPage,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useMyJobs();

  const handleEdit = useCallback(
    (job) => {
      navigate(`/jobs/${job.id}/edit`);
    },
    [navigate],
  );

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

      <MyJobsListSection
        pageJobs={pageJobs}
        jobs={jobs}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isDeletingJob={isDeletingJob}
        jobPendingDelete={jobPendingDelete}
        safeCurrentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
        onCreateFirstJob={() => navigate("/create/jobs")}
      />

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
