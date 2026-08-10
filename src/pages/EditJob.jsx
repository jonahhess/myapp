import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JobForm from "../components/JobForm.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeJob } from "../utils/normalizers";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      setIsLoading(true);
      setLoadError("");

      try {
        const payload = await jobsService.getJobById(id);
        const normalized = normalizeJob(
          payload?.job || payload?.data?.job || payload,
        );
        if (isMounted) {
          setJob(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            getUserFriendlyErrorMessage(error, "Failed to load job details."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      loadJob();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const canEditJob = useMemo(() => {
    if (!job || !user) {
      return false;
    }

    return (
      Boolean(user.isAdmin) ||
      String(job.recruiterId || "") === String(user.id || "")
    );
  }, [job, user]);

  const handleSubmit = async (payload) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await jobsService.updateJob(id, payload);
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

  if (isLoading) {
    return (
      <main className="job-page">
        <h1>Edit Job</h1>
        <LoadingSpinner label="Loading job details..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="job-page">
        <h1>Edit Job</h1>
        <p className="form-error" role="alert">
          {loadError}
        </p>
      </main>
    );
  }

  if (!canEditJob) {
    return (
      <main className="job-page">
        <h1>Edit Job</h1>
        <p className="form-error" role="alert">
          You do not have permission to edit this job.
        </p>
      </main>
    );
  }

  return (
    <main className="job-page">
      <h1>Edit Job</h1>
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
    </main>
  );
}

export default EditJob;
