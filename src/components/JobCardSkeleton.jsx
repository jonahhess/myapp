function JobCardSkeleton() {
  return (
    <article className="job-card job-card--skeleton" aria-hidden="true">
      <div className="job-card__header">
        <div className="job-card__logo-wrap job-card__skeleton-block" />

        <div className="job-card__summary">
          <div className="job-card__skeleton-block job-card__skeleton-title" />
          <div className="job-card__skeleton-block job-card__skeleton-line" />
          <div className="job-card__skeleton-block job-card__skeleton-line job-card__skeleton-line--short" />
        </div>
      </div>

      <div className="job-card__skeleton-block job-card__skeleton-line" />
      <div className="job-card__skeleton-block job-card__skeleton-line job-card__skeleton-line--short" />
    </article>
  );
}

export default JobCardSkeleton;
