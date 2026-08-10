import { act, renderHook, waitFor } from "@testing-library/react";
import useAsyncListResource from "../../../src/hooks/useAsyncListResource";

describe("useAsyncListResource", () => {
  it("loads and maps items on mount", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2, 3]);
    const mapItems = vi.fn((payload) => payload.map((value) => value * 10));

    const { result } = renderHook(() =>
      useAsyncListResource({
        fetcher,
        mapItems,
        errorMessage: "Failed to load numbers.",
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(mapItems).toHaveBeenCalledWith([1, 2, 3]);
    expect(result.current.items).toEqual([10, 20, 30]);
    expect(result.current.errorMessage).toBe("");
  });

  it("captures normalized error message and clears items when configured", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(["kept"])
      .mockRejectedValueOnce(new Error("boom"));
    const mapItems = vi.fn((payload) => payload);

    const { result } = renderHook(() =>
      useAsyncListResource({
        fetcher,
        mapItems,
        errorMessage: "Failed to load resource.",
        clearItemsOnError: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.items).toEqual(["kept"]);

    await act(async () => {
      await expect(result.current.reload()).rejects.toThrow("boom");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.errorMessage).toBe("boom");
  });

  it("allows manual item updates through setItems", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(["a"]);
    const mapItems = vi.fn((payload) => payload);

    const { result } = renderHook(() =>
      useAsyncListResource({ fetcher, mapItems }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setItems(["updated", "list"]);
    });

    expect(result.current.items).toEqual(["updated", "list"]);
  });

  it("skips loading when disabled", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2]);
    const mapItems = vi.fn((payload) => payload);

    const { result } = renderHook(() =>
      useAsyncListResource({
        fetcher,
        mapItems,
        enabled: false,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();

    await act(async () => {
      await expect(result.current.reload()).resolves.toEqual([]);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });
});
