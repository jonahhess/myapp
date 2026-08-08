import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "../components/JobForm.jsx";
import { useJobs } from "../contexts/JobsContext.jsx";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";

function CreateJob() {
  const navigate = useNavigate();
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const handleSubmit = async (payload) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await jobsService.createJob(payload);
      await reloadJobs?.({ background: true });
      setSuccessToast("Job created successfully.");
      navigate("/jobs-my", { replace: true });
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
      <p className="job-page__intro">
        Publish a new role. Required fields are validated before submission.
      </p>

      {successToast ? <p className="form-success">{successToast}</p> : null}

      <JobForm
        initialValues={{}}
        onSubmit={handleSubmit}
        submitLabel="Create Job"
        submittingLabel="Saving..."
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </main>
  );
}

export default CreateJob;
