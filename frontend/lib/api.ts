import { apiBase } from "@/lib/config";
import type {
  DeviceCreate,
  DeviceListResponse,
  DeviceOut,
  DeviceRegistered,
  DeviceUpdate,
  TelemetryPoint,
  TelemetryQuery,
} from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorBody(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const j = JSON.parse(raw) as { detail?: unknown };
    if (typeof j.detail === "string") return j.detail;
    if (j.detail !== undefined) return JSON.stringify(j.detail);
  } catch {}
  return raw || res.statusText;
}

async function fetchJson<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...rest } = opts;
  const url = `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("X-API-Key", token);
  const res = await fetch(url, { ...rest, headers });
  if (!res.ok) {
    const msg = await parseErrorBody(res);
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function listDevices(params?: { skip?: number; limit?: number }): Promise<DeviceListResponse> {
  const search = new URLSearchParams();
  if (params?.skip != null) search.set("skip", String(params.skip));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return fetchJson<DeviceListResponse>(q ? `/devices/?${q}` : "/devices/");
}

export function registerDevice(body: DeviceCreate): Promise<DeviceRegistered> {
  return fetchJson<DeviceRegistered>("/devices/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getDeviceMe(token: string): Promise<DeviceOut> {
  return fetchJson<DeviceOut>("/devices/me", { token });
}

export function updateDeviceMe(token: string, body: DeviceUpdate): Promise<DeviceOut> {
  return fetchJson<DeviceOut>("/devices/me", {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
}

export function listTelemetry(token: string, q: TelemetryQuery): Promise<TelemetryPoint[]> {
  const params = new URLSearchParams();
  params.set("limit", String(q.limit ?? 500));
  params.set("offset", String(q.offset ?? 0));
  if (q.newest_first != null) params.set("newest_first", String(q.newest_first));
  if (q.start) params.set("start", q.start);
  if (q.end) params.set("end", q.end);
  return fetchJson<TelemetryPoint[]>(`/telemetry/?${params.toString()}`, { token });
}
