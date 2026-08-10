import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JobForm from "../components/JobForm.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import {
  editJobResourceCache,
  resetJobResourceCache,
} from "./jobResourceCache";
import { clearMyJobsCache } from "./myJobs/myJobsCache";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeJob } from "../utils/normalizers";

function readEditJobResource(jobId) {
  const key = String(jobId || "");

  if (!key) {
    return Promise.resolve({
      job: null,
      loadError: "Missing job identifier.",
    });
  }

  if (!editJobResourceCache.has(key)) {
    editJobResourceCache.set(
      key,
      (async () => {
        try {
          const payload = await jobsService.getJobById(key);
          const normalized = normalizeJob(
            payload?.job || payload?.data?.job || payload,
          );
          return { job: normalized, loadError: "" };
        } catch (error) {
          return {
            job: null,
            loadError: getUserFriendlyErrorMessage(
              error,
              "Failed to load job details.",
            ),
          };
        }
      })(),
    );
  }

  return editJobResourceCache.get(key);
}

function EditJobContent({ id, user, navigate, reloadJobs }) {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const { job, loadError } = use(readEditJobResource(id));

  const canEditJob =
    Boolean(job && user) &&
    (Boolean(user.isAdmin) ||
      String(job.recruiterId || "") === String(user.id || ""));

  const handleSubmit = async (payload) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await jobsService.updateJob(id, payload);
      clearMyJobsCache();
      resetJobResourceCache(id);
      await reloadJobs?.({ background: true });
      setSuccessToast("Job updated successfully.");
      if (user?.isAdmin) {
        navigate(`/jobs/${id}`, { replace: true });
      } else {
        navigate("/my-jobs", { replace: true });
      }
    } catch (error) {
      setSubmitError(
        getUserFriendlyErrorMessage(error, "Failed to update the job."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <p className="form-error" role="alert">
        {loadError}
      </p>
    );
  }

  if (!canEditJob) {
    return (
      <p className="form-error" role="alert">
        You do not have permission to edit this job.
      </p>
    );
  }

  return (
    <>
      <p className="job-page__intro">
        Update role details, contact information, and media.
      </p>

      {!!successToast ? <p className="form-success">{successToast}</p> : null}

      <JobForm
        initialValues={job}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        submittingLabel="Saving..."
        isSubmitting={isSubmitting}
        submitError={submitError}
        enableReinitialize
      />
    </>
  );
}

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;

  return (
    <main className="job-page">
      <h1>Edit Job</h1>

      <Suspense fallback={<LoadingSpinner label="Loading job details..." />}>
        <EditJobContent
          id={id}
          user={user}
          navigate={navigate}
          reloadJobs={reloadJobs}
        />
      </Suspense>
    </main>
  );
}

export default EditJob;
