import { render, screen } from "@testing-library/react";
import CollectionPagination from "../../../src/components/CollectionPagination.jsx";

describe("CollectionPagination", () => {
  it("does not render while loading", () => {
    render(
      <CollectionPagination
        isLoading
        totalCount={20}
        pageSize={6}
        currentPage={1}
        totalPages={4}
      />,
    );

    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });

  it("does not render when there is an error", () => {
    render(
      <CollectionPagination
        isLoading={false}
        errorMessage="Load failed"
        totalCount={20}
        pageSize={6}
        currentPage={1}
        totalPages={4}
      />,
    );

    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });

  it("does not render when total count does not exceed page size", () => {
    render(
      <CollectionPagination
        isLoading={false}
        errorMessage=""
        totalCount={6}
        pageSize={6}
        currentPage={1}
        totalPages={1}
      />,
    );

    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });

  it("renders pagination when list spans multiple pages", () => {
    render(
      <CollectionPagination
        isLoading={false}
        errorMessage=""
        totalCount={7}
        pageSize={6}
        currentPage={1}
        totalPages={2}
        onPageChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("normalizes invalid page size to 1 for guard checks", () => {
    render(
      <CollectionPagination
        isLoading={false}
        errorMessage=""
        totalCount={1}
        pageSize={0}
        currentPage={1}
        totalPages={1}
      />,
    );

    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });
});
