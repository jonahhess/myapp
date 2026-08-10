import SearchInput from "../SearchInput.jsx";

const TEXT_FILTER_FIELDS = [
  {
    key: "title",
    id: "jobs-filter-title",
    label: "Job title",
    placeholder: "e.g. Full Stack Developer",
  },
  {
    key: "company",
    id: "jobs-filter-company",
    label: "Company name",
    placeholder: "e.g. Tech Solutions Ltd",
  },
  {
    key: "category",
    id: "jobs-filter-category",
    label: "Category",
    placeholder: "e.g. development",
  },
  {
    key: "location",
    id: "jobs-filter-location",
    label: "Location",
    placeholder: "e.g. Tel Aviv",
  },
  {
    key: "employmentType",
    id: "jobs-filter-employmentType",
    label: "Employment type",
    placeholder: "e.g. full-time",
  },
  {
    key: "experienceLevel",
    id: "jobs-filter-experienceLevel",
    label: "Experience level",
    placeholder: "e.g. senior",
  },
];

const NUMBER_FILTER_FIELDS = [
  {
    key: "salaryMin",
    id: "jobs-filter-salaryMin",
    label: "Minimum salary",
    placeholder: "Optional",
  },
  {
    key: "salaryMax",
    id: "jobs-filter-salaryMax",
    label: "Maximum salary",
    placeholder: "Optional",
  },
];

function JobsSearchFilters({ filters, updateFilter, resetFilters }) {
  const hasActiveFilters = Object.values(filters || {}).some(
    (value) => String(value ?? "").trim() !== "",
  );

  return (
    <section className="jobs-search-filters" aria-label="Job filters">
      <div className="jobs-search-grid">
        {TEXT_FILTER_FIELDS.map((field) => (
          <div key={field.key} className="jobs-search-field">
            <label htmlFor={field.id}>{field.label}</label>
            <SearchInput
              id={field.id}
              value={filters[field.key]}
              onChange={(event) => updateFilter(field.key, event.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        {NUMBER_FILTER_FIELDS.map((field) => (
          <div key={field.key} className="jobs-search-field">
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type="number"
              min="0"
              value={filters[field.key]}
              onChange={(event) => updateFilter(field.key, event.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="jobs-search-actions">
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}

export default JobsSearchFilters;
