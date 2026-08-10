import { act, renderHook, waitFor } from "@testing-library/react";
import useSavedJobsActions from "../../../src/hooks/useSavedJobsActions";

const jobsServiceMocks = vi.hoisted(() => ({
  toggleSaveJob: vi.fn(),
}));

vi.mock("../../../src/services/jobsService", () => ({
  default: {
    toggleSaveJob: jobsServiceMocks.toggleSaveJob,
  },
}));

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useSavedJobsActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth before toggling saved status", async () => {
    const onRequireAuth = vi.fn();
    const job = { id: "job-1", savedBy: [] };

    const { result } = renderHook(() =>
      useSavedJobsActions({
        currentUserId: "",
        isAuthenticated: false,
        onRequireAuth,
      }),
    );

    await act(async () => {
      await result.current.handleToggleSave(job);
    });

    expect(onRequireAuth).toHaveBeenCalledTimes(1);
    expect(jobsServiceMocks.toggleSaveJob).not.toHaveBeenCalled();
  });

  it("prevents duplicate toggle requests while pending", async () => {
    const deferred = createDeferred();
    const job = { id: "job-1", savedBy: [] };

    jobsServiceMocks.toggleSaveJob.mockImplementation(() => deferred.promise);

    const { result } = renderHook(() =>
      useSavedJobsActions({
        currentUserId: "user-1",
        isAuthenticated: true,
      }),
    );

    act(() => {
      void result.current.handleToggleSave(job);
    });

    await waitFor(() => {
      expect(result.current.isSavePending(job)).toBe(true);
    });

    await act(async () => {
      await result.current.handleToggleSave(job);
    });

    expect(jobsServiceMocks.toggleSaveJob).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve({ success: true });
      await deferred.promise;
    });

    await waitFor(() => {
      expect(result.current.isSavePending(job)).toBe(false);
    });
  });

  it("optimistically updates and rolls back saved state on failure", async () => {
    const job = { id: "job-1", savedBy: [] };
    jobsServiceMocks.toggleSaveJob.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() =>
      useSavedJobsActions({
        currentUserId: "user-1",
        isAuthenticated: true,
        failureMessage: "Failed to update saved jobs.",
      }),
    );

    expect(result.current.isSavedByCurrentUser(job)).toBe(false);

    let togglePromise;
    act(() => {
      togglePromise = result.current.handleToggleSave(job);
    });

    await waitFor(() => {
      expect(result.current.isSavedByCurrentUser(job)).toBe(true);
    });

    await act(async () => {
      await togglePromise;
    });

    expect(result.current.isSavedByCurrentUser(job)).toBe(false);
    expect(result.current.saveError).toBe("boom");
  });
});
