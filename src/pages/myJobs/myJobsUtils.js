export const JOBS_PER_PAGE = 6;

export function readJobsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.jobs)) {
    return payload.jobs;
  }

  return [];
}
