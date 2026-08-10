import { renderHook } from "@testing-library/react";
import usePagedCollection from "../../../src/hooks/usePagedCollection";

describe("usePagedCollection", () => {
  it("returns counts and first page items", () => {
    const items = [1, 2, 3, 4, 5];

    const { result } = renderHook(() =>
      usePagedCollection({ items, currentPage: 1, pageSize: 2 }),
    );

    expect(result.current.totalCount).toBe(5);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.safeCurrentPage).toBe(1);
    expect(result.current.pageStart).toBe(0);
    expect(result.current.pageItems).toEqual([1, 2]);
  });

  it("clamps out-of-range page to the last page", () => {
    const items = ["a", "b", "c", "d", "e"];

    const { result } = renderHook(() =>
      usePagedCollection({ items, currentPage: 99, pageSize: 2 }),
    );

    expect(result.current.totalPages).toBe(3);
    expect(result.current.safeCurrentPage).toBe(3);
    expect(result.current.pageStart).toBe(4);
    expect(result.current.pageItems).toEqual(["e"]);
  });

  it("normalizes invalid page size to 1", () => {
    const items = [10, 20, 30];

    const { result } = renderHook(() =>
      usePagedCollection({ items, currentPage: 2, pageSize: 0 }),
    );

    expect(result.current.totalPages).toBe(3);
    expect(result.current.safeCurrentPage).toBe(2);
    expect(result.current.pageStart).toBe(1);
    expect(result.current.pageItems).toEqual([20]);
  });
});
