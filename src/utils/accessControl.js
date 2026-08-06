export function isAdmin(user) {
  return Boolean(user?.isAdmin) || (user?.role || "").toLowerCase() === "admin";
}

export function isRecruiter(user) {
  return (
    Boolean(user?.isRecruiter) ||
    (user?.role || "").toLowerCase() === "recruiter"
  );
}
