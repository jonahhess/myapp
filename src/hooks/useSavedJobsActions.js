import { useCallback, useState } from "react";
import jobsService from "../services/jobsService";
import { getUserFriendlyErrorMessage } from "../utils/errors";

function extractEntityId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return String(value.id || value._id || value.userId || value.sub || "");
  }

  return "";
}

export default function useSavedJobsActions({
  currentUserId,
  isAuthenticated = true,
  onRequireAuth,
  onToggleSuccess,
  failureMessage = "Failed to update saved status.",
}) {
  const [saveOverrides, setSaveOverrides] = useState({});
  const [saveError, setSaveError] = useState("");
  const [pendingSaveIds, setPendingSaveIds] = useState({});

  const isSavedByCurrentUser = useCallback(
    (job) => {
      const viewerId = extractEntityId(currentUserId);
      if (!isAuthenticated || !viewerId || !job) {
        return false;
      }

      const jobId = extractEntityId(job.id || job._id);
      const overrideValue = saveOverrides[jobId];
      if (typeof overrideValue === "boolean") {
        return overrideValue;
      }

      return (job.savedBy || []).some(
        (savedUserId) => extractEntityId(savedUserId) === viewerId,
      );
    },
    [currentUserId, isAuthenticated, saveOverrides],
  );

  const handleToggleSave = useCallback(
    async (job) => {
      const jobId = extractEntityId(job?.id || job?._id);
      const viewerId = extractEntityId(currentUserId);

      if (!jobId) {
        return;
      }

      if (!isAuthenticated || !viewerId) {
        onRequireAuth?.();
        return;
      }

      if (pendingSaveIds[jobId]) {
        return;
      }

      setSaveError("");
      const previousState = isSavedByCurrentUser(job);
      setSaveOverrides((prev) => ({ ...prev, [jobId]: !previousState }));
      setPendingSaveIds((prev) => ({ ...prev, [jobId]: true }));

      try {
        await jobsService.toggleSaveJob(jobId);
        await onToggleSuccess?.();
      } catch (error) {
        setSaveOverrides((prev) => ({ ...prev, [jobId]: previousState }));
        setSaveError(getUserFriendlyErrorMessage(error, failureMessage));
      } finally {
        setPendingSaveIds((prev) => ({ ...prev, [jobId]: false }));
      }
    },
    [
      currentUserId,
      failureMessage,
      isAuthenticated,
      isSavedByCurrentUser,
      onToggleSuccess,
      onRequireAuth,
      pendingSaveIds,
    ],
  );

  const isSavePending = useCallback(
    (job) => {
      const jobId = extractEntityId(job?.id || job?._id);
      return Boolean(jobId && pendingSaveIds[jobId]);
    },
    [pendingSaveIds],
  );

  return {
    saveError,
    pendingSaveIds,
    isSavePending,
    isSavedByCurrentUser,
    handleToggleSave,
  };
}
