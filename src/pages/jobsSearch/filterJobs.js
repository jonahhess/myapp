export function filterJobsByCriteria(jobs, filters) {
  const title = filters.title.trim().toLowerCase();
  const company = filters.company.trim().toLowerCase();
  const category = filters.category.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();
  const employmentType = filters.employmentType.trim().toLowerCase();
  const experienceLevel = filters.experienceLevel.trim().toLowerCase();
  const salaryMin = Number(filters.salaryMin);
  const salaryMax = Number(filters.salaryMax);
  const hasSalaryMin = Number.isFinite(salaryMin) && filters.salaryMin !== "";
  const hasSalaryMax = Number.isFinite(salaryMax) && filters.salaryMax !== "";

  return jobs.filter((job) => {
    const matchesTitle =
      !title || (job.title || "").toLowerCase().includes(title);
    const matchesCompany =
      !company || (job.company || "").toLowerCase().includes(company);
    const matchesCategory =
      !category || (job.category || "").toLowerCase().includes(category);
    const matchesLocation =
      !location || (job.location || "").toLowerCase().includes(location);
    const matchesEmploymentType =
      !employmentType ||
      (job.jobType || "").toLowerCase().includes(employmentType);
    const matchesExperienceLevel =
      !experienceLevel ||
      (job.experienceLevel || "").toLowerCase().includes(experienceLevel);

    const jobMinSalary = Number(job.salaryMin);
    const jobMaxSalary = Number(job.salaryMax);
    const matchesSalaryMin =
      !hasSalaryMin ||
      (Number.isFinite(jobMaxSalary) && jobMaxSalary >= salaryMin);
    const matchesSalaryMax =
      !hasSalaryMax ||
      (Number.isFinite(jobMinSalary) && jobMinSalary <= salaryMax);

    return (
      matchesTitle &&
      matchesCompany &&
      matchesCategory &&
      matchesLocation &&
      matchesEmploymentType &&
      matchesExperienceLevel &&
      matchesSalaryMin &&
      matchesSalaryMax
    );
  });
}
