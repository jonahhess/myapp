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

const runRecruiterSmoke = process.env.RUN_PROD_RECRUITER_SMOKE === "true";
const runRecruiterMutationSmoke =
  process.env.RUN_PROD_RECRUITER_MUTATION_SMOKE === "true";
const autoRegisterUsers = process.env.RUN_PROD_AUTO_REGISTER !== "false";
const requestGapMs = Number(process.env.SMOKE_REQUEST_GAP_MS || 1200);
const max429Retries = Number(process.env.SMOKE_MAX_429_RETRIES || 2);

const maybeDescribe = runRecruiterSmoke ? describe.sequential : describe.skip;

function isPlaceholder(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    !normalized ||
    normalized === "replace_me" ||
    normalized === "recruiter@example.com" ||
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

maybeDescribe("Production Recruiter API smoke suite (rate-limited)", () => {
  const apiBaseUrl = pickPreferredEnv(
    process.env.PROD_API_BASE_URL,
    process.env.VITE_API_BASE_URL,
  );
  const recruiterEmail = process.env.SMOKE_RECRUITER_EMAIL;
  const recruiterPassword = process.env.SMOKE_RECRUITER_PASSWORD;

  let recruiterToken = "";
  let createdJobId = "";

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
    expect(recruiterEmail, "SMOKE_RECRUITER_EMAIL is required").toBeTruthy();
    expect(
      recruiterPassword,
      "SMOKE_RECRUITER_PASSWORD is required",
    ).toBeTruthy();
    expect(
      isPlaceholder(apiBaseUrl),
      "PROD_API_BASE_URL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(recruiterEmail),
      "SMOKE_RECRUITER_EMAIL is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
    expect(
      isPlaceholder(recruiterPassword),
      "SMOKE_RECRUITER_PASSWORD is still a placeholder. Set real values in .env.smoke",
    ).toBe(false);
  });

  it("authenticates recruiter account", async () => {
    let response;
    try {
      const result = await ensureLoginMaybeRegister({
        client,
        requestWithBackoff,
        email: recruiterEmail,
        password: recruiterPassword,
        isRecruiter: true,
        allowRegister: autoRegisterUsers,
      });
      response = result.loginResponse;
    } catch (error) {
      const status = error?.response?.status;
      const message = getServerErrorMessage(error);
      throw new Error(
        `Recruiter login failed (${status || "n/a"}). Server message: ${message}`,
      );
    }

    const token = extractAuthToken(response?.data);

    expect(token).toBeTruthy();
    recruiterToken = token;

    const claims = decodeJwtPayload(token);
    if (claims) {
      expect(Boolean(claims.isRecruiter)).toBe(true);
    }
  });

  it("reads recruiter-owned jobs list", async () => {
    if (!recruiterToken) {
      return;
    }

    const response = await requestWithBackoff(() =>
      client.get("/jobs/my-jobs", {
        headers: buildAuthHeaders(recruiterToken),
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);

    const items =
      response?.data?.jobs || response?.data?.items || response?.data || [];

    expect(Array.isArray(items)).toBe(true);
  });

  it("optionally creates and deletes a disposable recruiter job", async () => {
    if (!runRecruiterMutationSmoke) {
      return;
    }

    const timestamp = Date.now();
    const payload = {
      title: `Smoke Recruiter Job ${timestamp}`,
      company: "SmokeTest Inc",
      description: "Temporary recruiter smoke test job",
      category: "IT",
      jobType: "Full-Time",
      experienceLevel: "Junior",
      location: "IL",
      salary: {
        min: 10000,
        max: 9000,
      },
      phone: "0501234567",
      email: recruiterEmail,
      applyLink: "https://example.com/apply",
      image: {
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
        alt: "Office team",
      },
    };

    const createResponse = await requestWithBackoff(() =>
      client.post("/jobs", payload, {
        headers: buildAuthHeaders(recruiterToken),
      }),
    );

    createdJobId =
      createResponse?.data?.id ||
      createResponse?.data?._id ||
      createResponse?.data?.job?.id ||
      createResponse?.data?.job?._id ||
      "";

    expect(createdJobId).toBeTruthy();

    const deleteResponse = await requestWithBackoff(() =>
      client.delete(`/jobs/${createdJobId}`, {
        headers: buildAuthHeaders(recruiterToken),
      }),
    );

    expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
    expect(deleteResponse.status).toBeLessThan(300);
    createdJobId = "";
  });

  afterAll(async () => {
    if (!createdJobId || !recruiterToken) {
      return;
    }

    try {
      await requestWithBackoff(() =>
        client.delete(`/jobs/${createdJobId}`, {
          headers: buildAuthHeaders(recruiterToken),
        }),
      );
    } catch {
      // Cleanup best-effort only.
    }
  });
});
