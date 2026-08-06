export function buildFullName({
  firstName = "",
  lastName = "",
  fallback = "",
} = {}) {
  const fullName = [firstName, lastName]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

  return fullName || fallback;
}
