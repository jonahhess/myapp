import { Suspense, use } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { jobDetailsResourceCache } from "./jobResourceCache";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";
import { normalizeJob } from "../utils/normalizers";

function readJobDetailsResource(jobId) {
  const key = String(jobId || "");

  if (!key) {
    return Promise.resolve({
      job: null,
      loadError: "Missing job identifier.",
    });
  }

  if (!jobDetailsResourceCache.has(key)) {
    jobDetailsResourceCache.set(
      key,
      (async () => {
        try {
          const payload = await jobsService.getJobById(key);
          const normalized = normalizeJob(
            payload?.job || payload?.data?.job || payload,
          );

          return {
            job: normalized,
            loadError: "",
          };
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

  return jobDetailsResourceCache.get(key);
}

function JobDetailsContent({ id }) {
  const { job, loadError } = use(readJobDetailsResource(id));

  if (loadError) {
    return (
      <p className="form-error" role="alert">
        {loadError}
      </p>
    );
  }

  if (!job) {
    return (
      <p className="form-error" role="alert">
        Job details are unavailable.
      </p>
    );
  }

  return (
    <section className="job-details-card" aria-live="polite">
      <h2>{job.title || "Untitled role"}</h2>
      <p>
        <strong>Company:</strong> {job.company || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {job.location || "N/A"}
      </p>
      <p>
        <strong>Category:</strong> {job.category || "N/A"}
      </p>
      <p>{job.description || "No description provided."}</p>
    </section>
  );
}

function JobDetails() {
  const { id } = useParams();

  return (
    <main className="job-page">
      <h1>Job Details</h1>

      <Suspense fallback={<LoadingSpinner label="Loading job details..." />}>
        <JobDetailsContent id={id} />
      </Suspense>
    </main>
  );
}

export default JobDetails;
