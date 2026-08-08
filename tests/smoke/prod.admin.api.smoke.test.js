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

const runAdminSmoke = process.env.RUN_PROD_ADMIN_SMOKE === "true";
const autoRegisterUsers = process.env.RUN_PROD_AUTO_REGISTER !== "false";
const requestGapMs = Number(process.env.SMOKE_REQUEST_GAP_MS || 1200);
const max429Retries = Number(process.env.SMOKE_MAX_429_RETRIES || 2);

const maybeDescribe = runAdminSmoke ? describe.sequential : describe.skip;

function isPlaceholder(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    !normalized ||
    normalized === "replace_me" ||
    normalized === "admin@example.com" ||
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

maybeDescribe("Production Admin API smoke suite (rate-limited)", () => {
  const apiBaseUrl = pickPreferredEnv(
    process.env.PROD_API_BASE_URL,
    process.env.VITE_API_BASE_URL,
  );
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
  const nonAdminEmail = process.env.SMOKE_NON_ADMIN_EMAIL;
  const nonAdminPassword = process.env.SMOKE_NON_ADMIN_PASSWORD;

  let adminToken = "";

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
    expect(
      adminEmail,
      "SMOKE_ADMIN_EMAIL is required for admin smoke tests",
    ).toBeTruthy();
    expect(
      adminPassword,
      "SMOKE_ADMIN_PASSWORD is required for admin smoke tests",
    ).toBeTruthy();
    expect(
      isPlaceholder(apiBaseUrl),
      "PROD_API_BASE_URL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(adminEmail),
      "SMOKE_ADMIN_EMAIL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(adminPassword),
      "SMOKE_ADMIN_PASSWORD is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
  });

  it("authenticates admin account", async () => {
    let response;
    try {
      const result = await ensureLoginMaybeRegister({
        client,
        requestWithBackoff,
        email: adminEmail,
        password: adminPassword,
        isRecruiter: false,
        allowRegister: false,
      });
      response = result.loginResponse;
    } catch (error) {
      const status = error?.response?.status;
      const message = getServerErrorMessage(error);
      throw new Error(
        `Admin login failed (${status || "n/a"}). Server message: ${message}`,
      );
    }

    const token = extractAuthToken(response?.data);

    expect(token).toBeTruthy();
    adminToken = token;

    const claims = decodeJwtPayload(token);
    if (claims) {
      expect(Boolean(claims.isAdmin)).toBe(true);
    }
  });

  it("reads full users list with admin credentials", async () => {
    if (!adminToken) {
      return;
    }

    const response = await requestWithBackoff(() =>
      client.get("/users", {
        headers: buildAuthHeaders(adminToken),
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);

    const items =
      response?.data?.users ||
      response?.data?.items ||
      response?.data?.data?.users ||
      response?.data;

    expect(Array.isArray(items)).toBe(true);
  });

  it("optionally verifies non-admin access to /users is denied", async () => {
    if (!nonAdminEmail || !nonAdminPassword) {
      return;
    }

    let loginResponse;
    try {
      const result = await ensureLoginMaybeRegister({
        client,
        requestWithBackoff,
        email: nonAdminEmail,
        password: nonAdminPassword,
        isRecruiter: false,
        allowRegister: autoRegisterUsers,
      });
      loginResponse = result.loginResponse;
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      const message = getServerErrorMessage(error).toLowerCase();
      if (status === 400 && message.includes("user not exist")) {
        return;
      }

      throw error;
    }

    const userToken = extractAuthToken(loginResponse?.data);

    expect(userToken).toBeTruthy();

    let deniedStatus = 0;
    try {
      await requestWithBackoff(() =>
        client.get("/users", {
          headers: buildAuthHeaders(userToken),
        }),
      );
    } catch (error) {
      deniedStatus = Number(error?.response?.status || 0);
    }

    expect([401, 403]).toContain(deniedStatus);
  });
});
