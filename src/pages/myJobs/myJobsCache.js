let myJobsCache = null;

function isTestRuntime() {
  return typeof process !== "undefined" && process.env?.NODE_ENV === "test";
}

export function readMyJobsCache() {
  if (isTestRuntime()) {
    return null;
  }

  return Array.isArray(myJobsCache) ? myJobsCache : null;
}

export function writeMyJobsCache(items) {
  if (isTestRuntime()) {
    return;
  }

  myJobsCache = Array.isArray(items) ? items : null;
}

export function clearMyJobsCache() {
  myJobsCache = null;
}
