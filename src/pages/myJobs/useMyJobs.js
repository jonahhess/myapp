import { useState } from "react";
import { useJobs } from "../../contexts/JobsContext.jsx";
import useListResourceController from "../../hooks/useListResourceController";
import useAsyncMutation from "../../hooks/useAsyncMutation";
import jobsService from "../../services/jobsService";
import { normalizeJob } from "../../utils/normalizers";
import { JOBS_PER_PAGE, readJobsPayload } from "./myJobsUtils";

export default function useMyJobs() {
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const { isPending: isDeletingJob, run: runDeleteJob } = useAsyncMutation({
    defaultErrorMessage: "Failed to delete the job.",
  });

  const {
    items: jobs,
    setItems: setJobs,
    isLoading,
    errorMessage,
    setErrorMessage,
    currentPage,
    setCurrentPage,
    totalCount: totalJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = useListResourceController({
    fetcher: jobsService.getMyJobs,
    mapItems: (payload) => readJobsPayload(payload).map(normalizeJob),
    errorMessage: "Failed to load your jobs.",
    clearItemsOnError: true,
    pageSize: JOBS_PER_PAGE,
  });

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
    if (!jobPendingDelete?.id || isDeletingJob) {
      return;
    }

    const targetJob = jobPendingDelete;

    try {
      await runDeleteJob(() => jobsService.deleteJob(targetJob.id), {
        onSuccess: async () => {
          setJobs((prevJobs) =>
            prevJobs.filter((job) => job.id !== targetJob.id),
          );
          await reloadJobs?.({ background: true });
          setToastMessage(`Deleted "${targetJob.title}" successfully.`);
          setErrorMessage("");
        },
        onError: (_, message) => {
          setErrorMessage(message);
        },
        onFinally: () => {
          setJobPendingDelete(null);
        },
      });
    } catch {
      // Error state is handled in onError.
    }
  };

  return {
    jobs,
    totalJobsCount,
    pageJobs,
    isLoading,
    errorMessage,
    currentPage,
    totalPages,
    safeCurrentPage,
    jobPendingDelete,
    toastMessage,
    isDeletingJob,
    setCurrentPage,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
}
