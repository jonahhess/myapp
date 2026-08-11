function extractDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function normalizeLoginPayload(values = {}) {
  return {
    email: String(values.email || "").trim(),
    password: String(values.password || ""),
  };
}

export function normalizeRegisterPayload(values = {}) {
  return {
    name: {
      first: String(values.firstName || "").trim(),
      middle: String(values.middleName || "").trim() || undefined,
      last: String(values.lastName || "").trim(),
    },
    phone: extractDigits(values.phone),
    email: String(values.email || "").trim(),
    password: String(values.password || ""),
    image: {
      url: String(values.imageUrl || "").trim(),
      alt: String(values.imageAlt || "").trim(),
    },
    address: {
      state: String(values.state || "").trim(),
      country: String(values.country || "").trim(),
      city: String(values.city || "").trim(),
      street: String(values.street || "").trim(),
      houseNumber: Number(values.houseNumber),
      zip: values.zip ? Number(values.zip) : undefined,
    },
    isRecruiter: Boolean(values.isRecruiter),
  };
}

export function normalizeUserProfileUpdatePayload(values = {}) {
  return {
    name: {
      first: String(values.firstName || "").trim(),
      middle: String(values.middleName || "").trim() || undefined,
      last: String(values.lastName || "").trim(),
    },
    phone: extractDigits(values.phone),
    image: {
      url: String(values.imageUrl || "").trim(),
      alt: String(values.imageAlt || "").trim(),
    },
    address: {

      state: String(values.state || "").trim(),
      country: String(values.country || "").trim(),
      city: String(values.city || "").trim(),
      street: String(values.street || "").trim(),
      houseNumber: Number(values.houseNumber),
      zip: values.zip ? Number(values.zip) : undefined,
    },
  };
}
