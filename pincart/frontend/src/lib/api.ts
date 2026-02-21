const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to get a fresh Supabase access token (if the SDK is available).
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { createClient } = await import("./supabase");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) return session.access_token;
    // Try refreshing
    const { data } = await supabase.auth.refreshSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(input, init);

    // Retry on 5xx or network-level failures
    if (res.status >= 500 && attempt < retries) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
      continue;
    }

    // If 401, try refreshing the auth token once
    if (res.status === 401 && attempt < retries) {
      const token = await getAuthToken();
      if (token) {
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${token}`);
        init = { ...init, headers };
        continue;
      }
    }

    return res;
  }
  // Should never reach here, but satisfy TS
  return fetch(input, init);
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetchWithRetry(`${API}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetchWithRetry(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function apiPostBlob(path: string, body: any): Promise<Blob> {
  const res = await fetchWithRetry(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Export failed" }));
    throw new Error(err.detail || res.statusText);
  }
  return res.blob();
}
