const brokenImageUrlCache = new Set();

export function isBrokenImageUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  return brokenImageUrlCache.has(url);
}

export function handleMissingImage(
  event,
  fallbackUrl = "/vite.svg",
  options = {},
) {
  const { onBrokenImage } = options;
  const img = event?.currentTarget;

  if (!img || img.dataset.fallbackApplied === "true") {
    return;
  }

  const attemptedSrc = img.currentSrc || img.src || "";
  const hadOriginalSource = img.dataset.hadOriginalSource === "true";
  const originalSrc = img.dataset.originalSrc || "";

  if (hadOriginalSource && originalSrc) {
    brokenImageUrlCache.add(originalSrc);
  }

  if (hadOriginalSource && typeof onBrokenImage === "function") {
    onBrokenImage({ attemptedSrc, fallbackUrl });
  }

  img.dataset.fallbackApplied = "true";
  img.src = fallbackUrl;
}
