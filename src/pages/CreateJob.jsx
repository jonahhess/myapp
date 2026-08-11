import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "../components/JobForm.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";

const CREATE_JOB_DRAFT_KEY = "create-job-form-draft";

function readCreateJobDraft() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.sessionStorage.getItem(CREATE_JOB_DRAFT_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function writeCreateJobDraft(values) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(CREATE_JOB_DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Ignore storage write failures to avoid blocking the form UX.
  }
}

function clearCreateJobDraft() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(CREATE_JOB_DRAFT_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function CreateJob() {
  const navigate = useNavigate();
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [draftValues, setDraftValues] = useState(() => readCreateJobDraft());

  const handleDraftChange = (nextValues) => {
    setDraftValues(nextValues);
    writeCreateJobDraft(nextValues);
  };

  const handleSubmit = async (payload) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await jobsService.createJob(payload);
      await reloadJobs?.({ background: true });
      clearCreateJobDraft();
      setDraftValues({});
      setSuccessToast("Job created successfully.");
      navigate("/my-jobs", { replace: true });
    } catch (error) {
      setSubmitError(
        getUserFriendlyErrorMessage(error, "Failed to create the job."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="job-page">
      <h1>Create Job</h1>
      <p className="intro">
        Publish a new role. Required fields are validated before submission.
      </p>

      {!!successToast && <p className="form-success">{successToast}</p>}

      <JobForm
        initialValues={draftValues}
        onSubmit={handleSubmit}
        submitLabel="Create Job"
        submittingLabel="Saving..."
        isSubmitting={isSubmitting}
        submitError={submitError}
        onValuesChange={handleDraftChange}
      />
    </main>
  );
}

export default CreateJob;
