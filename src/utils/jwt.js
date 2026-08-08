function base64UrlDecode(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  try {
    return atob(padded);
  } catch {
    return null;
  }
}

export function decodeJwt(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const payload = base64UrlDecode(parts[1]);
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function isJwtExpired(token) {
  const payload = decodeJwt(token);
  if (!payload) {
    return true;
  }

  if (typeof payload.exp !== "number") {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export function getJwtExpirationDate(token) {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}
