export function getServerErrorMessage(error) {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) {
    return body.trim();
  }

  if (body && typeof body === "object" && body.message) {
    return String(body.message);
  }

  return error?.message || "unknown error";
}

export function isUserNotExistError(error) {
  const status = Number(error?.response?.status || 0);
  const message = getServerErrorMessage(error).toLowerCase();
  return status === 400 && message.includes("user not exist");
}

export function extractAuthToken(payload) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  return (
    payload?.token ||
    payload?.jwt ||
    payload?.accessToken ||
    payload?.data?.token ||
    ""
  );
}

export function buildAuthHeaders(token) {
  if (!token) {
    return {};
  }

  return {
    "x-auth-token": token,
    Authorization: `Bearer ${token}`,
  };
}

function hashToDigits(input = "") {
  let hash = 0;
  for (const char of String(input)) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100000000;
  }

  return String(hash).padStart(8, "0");
}

function buildPhoneFromEmail(email = "") {
  return `05${hashToDigits(email)}`;
}

export function buildRegistrationPayload({ email, password, isRecruiter }) {
  const phone = buildPhoneFromEmail(email);

  return {
    name: {
      first: "Smoke",
      middle: "",
      last: isRecruiter ? "Recruiter" : "User",
    },
    phone,
    email,
    password,
    image: {
      url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      alt: "Smoke test profile",
    },
    address: {
      country: "Israel",
      city: "Tel Aviv",
      street: "Herzl",
      houseNumber: 1,
    },
    isRecruiter: Boolean(isRecruiter),
  };
}

export async function ensureLoginMaybeRegister({
  client,
  requestWithBackoff,
  email,
  password,
  isRecruiter,
  allowRegister,
}) {
  try {
    const loginResponse = await requestWithBackoff(() =>
      client.post("/users/login", {
        email,
        password,
      }),
    );

    return { loginResponse, wasRegistered: false };
  } catch (error) {
    if (!allowRegister || !isUserNotExistError(error)) {
      throw error;
    }

    try {
      await requestWithBackoff(() =>
        client.post(
          "/users",
          buildRegistrationPayload({ email, password, isRecruiter }),
        ),
      );
    } catch (registerError) {
      const message = getServerErrorMessage(registerError).toLowerCase();
      const status = Number(registerError?.response?.status || 0);
      const alreadyExists =
        status === 400 &&
        (message.includes("already") || message.includes("exists"));

      if (!alreadyExists) {
        throw registerError;
      }
    }

    const loginResponse = await requestWithBackoff(() =>
      client.post("/users/login", {
        email,
        password,
      }),
    );

    return { loginResponse, wasRegistered: true };
  }
}
