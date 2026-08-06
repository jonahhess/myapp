function EmptyState({
  title = "No results",
  description = "Try adjusting your filters.",
  actionLabel = "",
  onAction,
}) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="empty-state__action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export default EmptyState;
