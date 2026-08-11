import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import MyJobsListSection from "../components/MyJobsListSection.jsx";
import useMyJobs from "../hooks/useMyJobs.js";

function MyJobs() {
  const navigate = useNavigate();
  const {
    totalJobsCount,
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

  const handleEdit = (job) => {
    navigate(`/jobs/${job.id}/edit`);
  };

  return (
    <main className="job-page">
      <header className="header">
        <div>
          <h1>My Posted Jobs</h1>
          <p className="intro">
            Recruiter dashboard for managing your published positions.
          </p>
        </div>
        <button
          type="button"
          className="cta"
          onClick={() => navigate("/create/jobs")}
        >
          Post a New Job
        </button>
      </header>

      {!!toastMessage && <p className="form-success">{toastMessage}</p>}

      <MyJobsListSection
        pageJobs={pageJobs}
        totalJobsCount={totalJobsCount}
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
        message={`This will permanently delete "${jobPendingDelete?.title || "this job"}". This action cannot be undone.`}
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
