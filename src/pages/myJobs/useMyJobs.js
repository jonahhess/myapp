import { useCallback, useState } from "react";
import { useJobs } from "../../contexts/JobsContext.jsx";
import useAsyncListResource from "../../hooks/useAsyncListResource";
import usePagedCollection from "../../hooks/usePagedCollection";
import jobsService from "../../services/jobsService";
import { getUserFriendlyErrorMessage } from "../../utils/errors";
import { normalizeJob } from "../../utils/normalizers";
import { JOBS_PER_PAGE, readJobsPayload } from "./myJobsUtils";

export default function useMyJobs() {
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
  const [currentPage, setCurrentPage] = useState(1);
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  const mapJobItems = useCallback(
    (payload) => readJobsPayload(payload).map(normalizeJob),
    [],
  );

  const {
    items: jobs,
    setItems: setJobs,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useAsyncListResource({
    fetcher: jobsService.getMyJobs,
    mapItems: mapJobItems,
    errorMessage: "Failed to load your jobs.",
    clearItemsOnError: true,
  });

  const {
    totalCount: totalJobsCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageJobs,
  } = usePagedCollection({
    items: jobs,
    currentPage,
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

    setIsDeletingJob(true);

    try {
      await jobsService.deleteJob(jobPendingDelete.id);
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobPendingDelete.id),
      );
      await reloadJobs?.({ background: true });
      setToastMessage(`Deleted "${jobPendingDelete.title}" successfully.`);
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
