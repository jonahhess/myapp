import { render, screen } from "@testing-library/react";
import CollectionStateSwitch from "../../../src/components/CollectionStateSwitch.jsx";

describe("CollectionStateSwitch", () => {
  it("renders loading state with spinner label and loading fallback", () => {
    render(
      <CollectionStateSwitch
        isLoading
        errorMessage=""
        isEmpty={false}
        loadingLabel="Loading test data..."
        loadingFallback={<div>Loading placeholder</div>}
      >
        <div>Ready content</div>
      </CollectionStateSwitch>,
    );

    expect(screen.getByText("Loading test data...")).toBeInTheDocument();
    expect(screen.getByText("Loading placeholder")).toBeInTheDocument();
    expect(screen.queryByText("Ready content")).not.toBeInTheDocument();
  });

  it("renders default error state when error message is present", () => {
    render(
      <CollectionStateSwitch
        isLoading={false}
        errorMessage="Server unavailable"
        isEmpty={false}
        errorTitle="Could not load jobs"
      >
        <div>Ready content</div>
      </CollectionStateSwitch>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Could not load jobs")).toBeInTheDocument();
    expect(screen.getByText("Server unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Ready content")).not.toBeInTheDocument();
  });

  it("renders custom error fallback when provided", () => {
    render(
      <CollectionStateSwitch
        isLoading={false}
        errorMessage="Any error"
        isEmpty={false}
        errorFallback={<p role="alert">Custom error UI</p>}
      >
        <div>Ready content</div>
      </CollectionStateSwitch>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Custom error UI");
    expect(screen.queryByText("Ready content")).not.toBeInTheDocument();
  });

  it("renders empty state when empty and no error", () => {
    render(
      <CollectionStateSwitch
        isLoading={false}
        errorMessage=""
        isEmpty
        emptyState={<div>No rows yet</div>}
      >
        <div>Ready content</div>
      </CollectionStateSwitch>,
    );

    expect(screen.getByText("No rows yet")).toBeInTheDocument();
    expect(screen.queryByText("Ready content")).not.toBeInTheDocument();
  });

  it("renders children when ready", () => {
    render(
      <CollectionStateSwitch isLoading={false} errorMessage="" isEmpty={false}>
        <div>Ready content</div>
      </CollectionStateSwitch>,
    );

    expect(screen.getByText("Ready content")).toBeInTheDocument();
  });
});
