import { useEffect, useState } from "react";
import { useJobs } from "../../contexts/JobsContext.jsx";
import usePagedCollection from "../../hooks/usePagedCollection";
import jobsService from "../../services/jobsService";
import { getUserFriendlyErrorMessage } from "../../utils/errors";
import { normalizeJob } from "../../utils/normalizers";
import { JOBS_PER_PAGE, readJobsPayload } from "./myJobsUtils";

export default function useMyJobs() {
  const jobsContext = useJobs({ optional: true });
  const reloadJobs = jobsContext?.reloadJobs;
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
