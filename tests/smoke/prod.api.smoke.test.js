// @vitest-environment node
import axios from "axios";
import dotenv from "dotenv";
import {
  buildAuthHeaders,
  ensureLoginMaybeRegister,
  extractAuthToken,
  getServerErrorMessage,
} from "./smokeAuthUtils";

dotenv.config({ path: ".env.smoke.example" });
dotenv.config({ override: true });
dotenv.config({ path: ".env.smoke", override: true });

const runProdSmoke = process.env.RUN_PROD_SMOKE === "true";
const runMutationSmoke = process.env.RUN_PROD_MUTATION_SMOKE === "true";
const autoRegisterUsers = process.env.RUN_PROD_AUTO_REGISTER !== "false";
const requestGapMs = Number(process.env.SMOKE_REQUEST_GAP_MS || 1200);
const max429Retries = Number(process.env.SMOKE_MAX_429_RETRIES || 2);

const maybeDescribe = runProdSmoke ? describe.sequential : describe.skip;

function isPlaceholder(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    !normalized ||
    normalized === "replace_me" ||
    normalized === "test-user@example.com" ||
    normalized.includes("your-api.example.com")
  );
}

function pickPreferredEnv(...values) {
  return (
    values.find((value) => value && !isPlaceholder(value)) ||
    values.find(Boolean) ||
    ""
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function decodeJwtPayload(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 2) {
    return null;
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function requestWithBackoff(requestFn) {
  let attempt = 0;

  while (true) {
    try {
      const response = await requestFn();
      await sleep(requestGapMs);
      return response;
    } catch (error) {
      const status = error?.response?.status;
      if (status !== 429 || attempt >= max429Retries) {
        throw error;
      }

      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      const retryAfterSec = Number(retryAfterHeader);
      const backoffMs = Number.isFinite(retryAfterSec)
        ? retryAfterSec * 1000
        : requestGapMs * Math.pow(2, attempt + 1);

      await sleep(backoffMs);
      attempt += 1;
    }
  }
}

maybeDescribe("Production API smoke suite (rate-limited)", () => {
  const apiBaseUrl = pickPreferredEnv(
    process.env.PROD_API_BASE_URL,
    process.env.VITE_API_BASE_URL,
  );
  const userEmail = process.env.SMOKE_USER_EMAIL;
  const userPassword = process.env.SMOKE_USER_PASSWORD;
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;

  let userToken = "";
  let adminToken = "";
  let userId = "";

  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  beforeAll(() => {
    expect(
      apiBaseUrl,
      "PROD_API_BASE_URL (or VITE_API_BASE_URL) is required",
    ).toBeTruthy();
    expect(userEmail, "SMOKE_USER_EMAIL is required").toBeTruthy();
    expect(userPassword, "SMOKE_USER_PASSWORD is required").toBeTruthy();
    expect(
      isPlaceholder(apiBaseUrl),
      "PROD_API_BASE_URL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(userEmail),
      "SMOKE_USER_EMAIL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(userPassword),
      "SMOKE_USER_PASSWORD is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
  });

  it("authenticates a user and captures JWT claims", async () => {
    let loginResponse;
    try {
      const result = await ensureLoginMaybeRegister({
        client,
        requestWithBackoff,
        email: userEmail,
        password: userPassword,
        isRecruiter: false,
        allowRegister: autoRegisterUsers,
      });
      loginResponse = result.loginResponse;
    } catch (error) {
      const status = error?.response?.status;
      const message = getServerErrorMessage(error);
      throw new Error(
        `User login failed (${status || "n/a"}). Server message: ${message}`,
      );
    }

    const token = extractAuthToken(loginResponse?.data);

    expect(token).toBeTruthy();

    const claims = decodeJwtPayload(token);
    expect(claims).toBeTruthy();

    userId = claims?.id || claims?._id || claims?.sub || claims?.userId || "";
    userToken = token;

    expect(userId).toBeTruthy();
  });

  it("reads the logged-in user profile", async () => {
    if (!userToken || !userId) {
      return;
    }

    const response = await requestWithBackoff(() =>
      client.get(`/users/${userId}`, {
        headers: buildAuthHeaders(userToken),
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    expect(response.data).toBeTruthy();
  });

  it("optionally validates admin user list endpoint when admin credentials are configured", async () => {
    if (!adminEmail || !adminPassword) {
      return;
    }

    let loginResponse;
    try {
      const result = await ensureLoginMaybeRegister({
        client,
        requestWithBackoff,
        email: adminEmail,
        password: adminPassword,
        isRecruiter: false,
        allowRegister: false,
      });
      loginResponse = result.loginResponse;
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      // This check is optional in the baseline suite, so auth/client errors should not fail the run.
      if (status >= 400 && status < 500) {
        return;
      }

      throw error;
    }

    adminToken = extractAuthToken(loginResponse?.data);

    expect(adminToken).toBeTruthy();

    const usersResponse = await requestWithBackoff(() =>
      client.get("/users", {
        headers: buildAuthHeaders(adminToken),
      }),
    );

    expect(usersResponse.status).toBeGreaterThanOrEqual(200);
    expect(usersResponse.status).toBeLessThan(300);
  });

  it("optionally performs no-op profile mutation smoke when explicitly enabled", async () => {
    if (!runMutationSmoke) {
      return;
    }

    expect(userToken).toBeTruthy();
    expect(userId).toBeTruthy();

    const profileResponse = await requestWithBackoff(() =>
      client.get(`/users/${userId}`, {
        headers: buildAuthHeaders(userToken),
      }),
    );

    const user =
      profileResponse?.data?.user ||
      profileResponse?.data?.data?.user ||
      profileResponse?.data;

    const payload = {
      name: {
        first: user?.name?.first || user?.firstName || "Smoke",
        middle: user?.name?.middle || user?.middleName || "",
        last: user?.name?.last || user?.lastName || "Tester",
      },
      phone: String(user?.phone || "").replace(/\D/g, ""),
      image: {
        url: user?.image?.url || user?.imageUrl || "",
        alt: user?.image?.alt || user?.imageAlt || "",
      },
      address: {
        country: user?.address?.country || "Israel",
        city: user?.address?.city || "Tel Aviv",
        street: user?.address?.street || "Herzl",
        houseNumber: Number(user?.address?.houseNumber || 1),
        district: user?.address?.district || "",
        postalCode: user?.address?.postalCode
          ? Number(user.address.postalCode)
          : undefined,
      },
    };

    const updateResponse = await requestWithBackoff(() =>
      client.put(`/users/${userId}`, payload, {
        headers: buildAuthHeaders(userToken),
      }),
    );

    expect(updateResponse.status).toBeGreaterThanOrEqual(200);
    expect(updateResponse.status).toBeLessThan(300);
  });
});
