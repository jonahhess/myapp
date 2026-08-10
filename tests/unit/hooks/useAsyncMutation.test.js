import { act, renderHook, waitFor } from "@testing-library/react";
import useAsyncMutation from "../../../src/hooks/useAsyncMutation";

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useAsyncMutation", () => {
  it("tracks pending state around a successful mutation", async () => {
    const deferred = createDeferred();
    const task = vi.fn(() => deferred.promise);

    const { result } = renderHook(() => useAsyncMutation());

    let runPromise;
    act(() => {
      runPromise = result.current.run(task);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      deferred.resolve({ ok: true });
      await expect(runPromise).resolves.toEqual({ ok: true });
    });

    expect(task).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
  });

  it("prevents concurrent mutation runs", async () => {
    const deferred = createDeferred();
    const task = vi.fn(() => deferred.promise);

    const { result } = renderHook(() => useAsyncMutation());

    let firstRun;
    act(() => {
      firstRun = result.current.run(task);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    let secondRunResult;
    await act(async () => {
      secondRunResult = await result.current.run(task);
    });

    expect(secondRunResult).toBeUndefined();
    expect(task).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve("done");
      await expect(firstRun).resolves.toBe("done");
    });

    expect(result.current.isPending).toBe(false);
  });

  it("normalizes errors and calls onError callback", async () => {
    const taskError = new Error("");
    const task = vi.fn().mockRejectedValueOnce(taskError);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useAsyncMutation({ defaultErrorMessage: "Failed to delete user." }),
    );

    await act(async () => {
      await expect(
        result.current.run(task, {
          onError,
        }),
      ).rejects.toBe(taskError);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(taskError, "Failed to delete user.");
    expect(result.current.isPending).toBe(false);
  });

  it("always calls onFinally", async () => {
    const onFinallySuccess = vi.fn();
    const onFinallyError = vi.fn();
    const okTask = vi.fn().mockResolvedValueOnce("ok");
    const failTask = vi.fn().mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useAsyncMutation());

    await act(async () => {
      await expect(
        result.current.run(okTask, { onFinally: onFinallySuccess }),
      ).resolves.toBe("ok");
    });

    await act(async () => {
      await expect(
        result.current.run(failTask, { onFinally: onFinallyError }),
      ).rejects.toThrow("boom");
    });

    expect(onFinallySuccess).toHaveBeenCalledTimes(1);
    expect(onFinallyError).toHaveBeenCalledTimes(1);
  });
});
