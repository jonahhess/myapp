let myJobsCache = null;

export function readMyJobsCache() {
  return Array.isArray(myJobsCache) ? myJobsCache : null;
}

export function writeMyJobsCache(items) {
  myJobsCache = Array.isArray(items) ? items : null;
}

export function clearMyJobsCache() {
  myJobsCache = null;
}
