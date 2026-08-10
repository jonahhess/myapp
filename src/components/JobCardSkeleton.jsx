function JobCardSkeleton() {
  return (
    <article className="job-card skeleton" aria-hidden="true">
      <div className="header">
        <div className="logo-wrap block" />

        <div className="summary">
          <div className="block skeleton-title" />
          <div className="block skeleton-line" />
          <div className="block skeleton-line short" />
        </div>
      </div>

      <div className="block skeleton-line" />
      <div className="block skeleton-line short" />
    </article>
  );
}

export default JobCardSkeleton;
