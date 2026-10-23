export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Opts = { method?: string; body?: unknown; token?: string | null };

export const api = async <T = unknown>(path: string, opts: Opts = {}): Promise<T> => {
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(res.status, "The server is not answering right now. Try again in a moment.");
  }
  if (!res.ok) {
    if (res.status === 401 && opts.token && typeof window !== "undefined") window.dispatchEvent(new Event("session-expired"));
    const msg = body && typeof body === "object" && "error" in body ? String((body as { error: string }).error) : "Request failed.";
    throw new ApiError(res.status, msg);
  }
  return body as T;
};
