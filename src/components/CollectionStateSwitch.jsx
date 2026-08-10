import LoadingSpinner from "./LoadingSpinner.jsx";

function CollectionStateSwitch({
  isLoading,
  errorMessage,
  isEmpty,
  loadingLabel = "Loading...",
  errorTitle = "Could not load data",
  loadingFallback,
  errorFallback,
  emptyState = null,
  children,
}) {
  if (isLoading) {
    return (
      <>
        <LoadingSpinner label={loadingLabel} />
        {loadingFallback}
      </>
    );
  }

  if (!!errorMessage) {
    return (
      errorFallback || (
        <section role="alert" aria-live="polite">
          <h3>{errorTitle}</h3>
          <p>{errorMessage}</p>
        </section>
      )
    );
  }

  if (isEmpty) {
    return emptyState;
  }

  return children;
}

export default CollectionStateSwitch;
