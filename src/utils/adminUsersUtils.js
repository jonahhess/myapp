export const USERS_PER_PAGE = 8;

export function readUsersPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.users)) {
    return payload.users;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data?.users)) {
    return payload.data.users;
  }

  return [];
}

export function normalizeUserRow(user = {}) {
  const fullName = [
    user?.name?.first || user?.firstName || user?.first_name || "",
    user?.name?.middle || user?.middleName || user?.middle_name || "",
    user?.name?.last || user?.lastName || user?.last_name || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user?.id || user?._id || "",
    fullName: fullName || "Unknown user",
    email: user?.email || "",
    phone: user?.phone || "",
    createdAt: user?.createdAt || user?.created_at || null,
    isRecruiter: Boolean(user?.isRecruiter),
    isAdmin: Boolean(user?.isAdmin),
  };
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
