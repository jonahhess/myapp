import { act, renderHook, waitFor } from "@testing-library/react";
import useListResourceController from "../../../src/hooks/useListResourceController";

describe("useListResourceController", () => {
  it("loads, maps, and pages items", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2, 3, 4, 5]);
    const mapItems = vi.fn((payload) => payload.map((item) => item * 10));

    const { result } = renderHook(() =>
      useListResourceController({ fetcher, mapItems, pageSize: 2 }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(mapItems).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    expect(result.current.items).toEqual([10, 20, 30, 40, 50]);
    expect(result.current.filteredItems).toEqual([10, 20, 30, 40, 50]);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems).toEqual([10, 20]);
  });

  it("applies optional filtering before paging", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([
      { id: 1, title: "Alpha" },
      { id: 2, title: "Beta" },
      { id: 3, title: "Gamma" },
    ]);
    const mapItems = vi.fn((payload) => payload);
    const filterItems = vi.fn((items, query) => {
      const normalizedQuery = String(query || "").toLowerCase();
      return items.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery),
      );
    });

    const { result, rerender } = renderHook(
      ({ query }) =>
        useListResourceController({
          fetcher,
          mapItems,
          pageSize: 5,
          filterValue: query,
          filterItems,
        }),
      {
        initialProps: { query: "a" },
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalCount).toBe(3);
    expect(result.current.pageItems).toHaveLength(3);

    rerender({ query: "beta" });

    expect(filterItems).toHaveBeenLastCalledWith(
      [
        { id: 1, title: "Alpha" },
        { id: 2, title: "Beta" },
        { id: 3, title: "Gamma" },
      ],
      "beta",
    );
    expect(result.current.filteredItems).toEqual([{ id: 2, title: "Beta" }]);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.pageItems).toEqual([{ id: 2, title: "Beta" }]);
  });

  it("resets current page when filter value changes", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2, 3, 4, 5, 6]);
    const mapItems = vi.fn((payload) => payload);
    const filterItems = vi.fn((items, query) =>
      query ? items.filter((item) => item <= 3) : items,
    );

    const { result, rerender } = renderHook(
      ({ query }) =>
        useListResourceController({
          fetcher,
          mapItems,
          pageSize: 2,
          initialPage: 2,
          filterValue: query,
          filterItems,
        }),
      {
        initialProps: { query: "" },
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toEqual([3, 4]);

    rerender({ query: "narrow" });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });

    expect(result.current.pageItems).toEqual([1, 2]);
  });

  it("can keep current page when resetPageOnFilterChange is false", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2, 3, 4, 5, 6]);
    const mapItems = vi.fn((payload) => payload);
    const filterItems = vi.fn((items, query) =>
      query ? items.filter((item) => item <= 5) : items,
    );

    const { result, rerender } = renderHook(
      ({ query }) =>
        useListResourceController({
          fetcher,
          mapItems,
          pageSize: 2,
          initialPage: 3,
          filterValue: query,
          filterItems,
          resetPageOnFilterChange: false,
        }),
      {
        initialProps: { query: "" },
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentPage).toBe(3);

    await act(async () => {
      rerender({ query: "narrow" });
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.safeCurrentPage).toBe(3);
    expect(result.current.pageItems).toEqual([5]);
  });

  it("supports external source items without fetcher", () => {
    const { result, rerender } = renderHook(
      ({ query }) =>
        useListResourceController({
          sourceItems: [
            { id: 1, title: "Frontend" },
            { id: 2, title: "Backend" },
            { id: 3, title: "Designer" },
          ],
          sourceIsLoading: false,
          sourceErrorMessage: "",
          pageSize: 2,
          filterValue: query,
          filterItems: (items, nextQuery) =>
            items.filter((item) =>
              item.title
                .toLowerCase()
                .includes(String(nextQuery || "").toLowerCase()),
            ),
        }),
      {
        initialProps: { query: "" },
      },
    );

    expect(result.current.totalCount).toBe(3);
    expect(result.current.pageItems).toEqual([
      { id: 1, title: "Frontend" },
      { id: 2, title: "Backend" },
    ]);

    rerender({ query: "back" });

    expect(result.current.totalCount).toBe(1);
    expect(result.current.pageItems).toEqual([{ id: 2, title: "Backend" }]);
  });

  it("does not reset page when only filter function identity changes", () => {
    const sourceItems = [1, 2, 3, 4, 5, 6];

    const { result, rerender } = renderHook(
      ({ mode }) =>
        useListResourceController({
          sourceItems,
          sourceIsLoading: false,
          pageSize: 2,
          initialPage: 3,
          filterValue: "same-query",
          filterItems: (items, query) => {
            const _ = query;
            return mode === "all" ? items : items.slice(0, 5);
          },
        }),
      {
        initialProps: { mode: "all" },
      },
    );

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageItems).toEqual([5, 6]);

    rerender({ mode: "all" });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageItems).toEqual([5, 6]);
  });
});
