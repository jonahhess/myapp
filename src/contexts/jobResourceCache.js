export const editJobResourceCache = new Map();
export const jobDetailsResourceCache = new Map();

export function resetJobResourceCache(jobId) {
  const key = String(jobId || "").trim();
  if (!key) {
    return;
  }

  editJobResourceCache.delete(key);
  jobDetailsResourceCache.delete(key);
}
