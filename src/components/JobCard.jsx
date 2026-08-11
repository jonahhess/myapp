import { formatSalaryRange } from "../utils/formatters";
import { handleMissingImage, isBrokenImageUrl } from "../utils/image";

function getLocalCompanyPlaceholder(companyName) {
  const safeLabel = (companyName || "Company").trim().slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ece9f4"/><stop offset="100%" stop-color="#d8d2e9"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><rect x="24" y="24" width="552" height="352" rx="20" fill="#f7f5fc" stroke="#c6bddf"/><text x="300" y="210" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#4f456b">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function JobCard({
  job,
  isSaved,
  onToggleSave,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  isSavePending = false,
  isDeletePending = false,
}) {
  if (!job) {
    return null;
  }

  const salaryText = formatSalaryRange(job.salaryMin, job.salaryMax, {
    currency: job.currency || "USD",
  });
  const detailsMeta = [job.category, job.jobType, job.experienceLevel]
    .filter(Boolean)
    .join(" / ");
  const publicationDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  const resolvedSavedState =
    typeof isSaved === "boolean" ? isSaved : Boolean(job.isSaved);
  const hasOriginalImageSource = Boolean(job.imageUrl);
  const fallbackLogo = getLocalCompanyPlaceholder(job.company);
  const shouldSkipOriginal =
    hasOriginalImageSource && isBrokenImageUrl(job.imageUrl);
  const companyLogo = shouldSkipOriginal
    ? fallbackLogo
    : job.imageUrl || fallbackLogo;

  return (
    <article className="job-card">
      <div className="header">
        <div className="logo-wrap" aria-hidden="true">
          <img
            className="logo"
            src={companyLogo}
            alt={job.imageAlt || `${job.company || "Company"} logo`}
            data-had-original-source={hasOriginalImageSource}
            data-original-src={job.imageUrl || ""}
            onError={(event) =>
              handleMissingImage(event, fallbackLogo, {
                onBrokenImage: ({ attemptedSrc }) => {
                  if (import.meta.env.DEV) {
                    console.warn(
                      "Broken job image URL, using fallback:",
                      attemptedSrc,
                    );
                  }
                },
              })
            }
            width="80"
            height="80"
            loading="lazy"
          />
        </div>

        <div className="summary">
          <h3 className="title">{job.title}</h3>
          <p className="company">{job.company}</p>
          <p className="location">{job.location}</p>
          {!!detailsMeta && <p className="meta">{detailsMeta}</p>}
        </div>
      </div>

      {!!salaryText && <p className="salary">{salaryText}</p>}

      {!!publicationDate && (
        <p className="date">Published: {publicationDate}</p>
      )}

      <button
        type="button"
        className="save"
        aria-label={resolvedSavedState ? "Unsave job" : "Save job"}
        disabled={isSavePending}
        aria-busy={isSavePending}
        onClick={() => onToggleSave?.(job)}
      >
        {isSavePending ? "..." : resolvedSavedState ? "★" : "☆"}
      </button>

      {!!job.description && (
        <p className="description">{job.description}</p>
      )}

      {!!job.applyLink && (
        <p className="apply">
          <a href={job.applyLink} target="_blank" rel="noreferrer">
            Apply now
          </a>
        </p>
      )}

      {(canEdit || canDelete) && (
        <div className="actions">
          {canEdit && (
            <button type="button" onClick={() => onEdit?.(job)}>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(job)}
              aria-label={`Delete ${job.title || "job"}`}
              title="Delete"
              disabled={isDeletePending}
              aria-busy={isDeletePending}
            >
              {isDeletePending ? "Deleting..." : "🗑 Delete"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default JobCard;
