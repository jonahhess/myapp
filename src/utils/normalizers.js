export function normalizeUser(user = {}) {
  return {
    id: user.id || user._id || "",
    email: user.email || "",
    firstName: user.firstName || user.first_name || "",
    lastName: user.lastName || user.last_name || "",
    role: (user.role || "candidate").toLowerCase(),
    avatarUrl: user.avatarUrl || user.avatar_url || "",
    createdAt: user.createdAt || user.created_at || null,
    updatedAt: user.updatedAt || user.updated_at || null,
  };
}

export function normalizeJob(job = {}) {
  const parsedSalaryMin = Number(
    job.salary?.min ?? job.salaryMin ?? job.salary_min,
  );
  const parsedSalaryMax = Number(
    job.salary?.max ?? job.salaryMax ?? job.salary_max,
  );

  return {
    id: job.id || job._id || "",
    title: job.title || "",
    company: job.company || "",
    location: job.location || "",
    salaryMin: Number.isFinite(parsedSalaryMin) ? parsedSalaryMin : null,
    salaryMax: Number.isFinite(parsedSalaryMax) ? parsedSalaryMax : null,
    currency: job.currency || "USD",
    description: job.description || "",
    category: job.category || "",
    jobType: job.jobType || job.job_type || "",
    experienceLevel: job.experienceLevel || job.experience_level || "",
    applyLink: job.applyLink || job.apply_link || "",
    imageUrl: job.image?.url || job.imageUrl || job.image_url || "",
    imageAlt: job.image?.alt || job.imageAlt || job.image_alt || "",
    jobNumber: job.jobNumber || job.job_number || "",
    contactEmail: job.email || "",
    savedBy: Array.isArray(job.savedBy) ? job.savedBy : [],
    recruiterId: job.recruiterId || job.recruiter_id || "",
    createdAt: job.createdAt || job.created_at || null,
    updatedAt: job.updatedAt || job.updated_at || null,
  };
}
