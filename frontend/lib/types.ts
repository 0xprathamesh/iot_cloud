export type DeviceSummary = {
  id: string;
  name: string;
  status: string;
  auth_kind: string;
  created_at: string;
};

export type DeviceListResponse = {
  items: DeviceSummary[];
  total: number;
};

export type DeviceRegistered = {
  id: string;
  name: string;
  api_key: string;
  status: string;
  auth_kind: string;
  created_at: string;
};

export type DeviceOut = {
  id: string;
  name: string;
  description: string | null;
  device_extra: Record<string, unknown> | null;
  status: string;
  auth_kind: string;
  api_key_hint: string;
  created_at: string;
  updated_at: string;
};

export type DeviceCreate = {
  name: string;
  description?: string | null;
  device_extra?: Record<string, unknown> | null;
};

export type DeviceUpdate = {
  name?: string;
  description?: string | null;
  device_extra?: Record<string, unknown> | null;
};

export type TelemetryPoint = {
  id: string;
  device_id: string;
  data: { temperature: number; humidity: number };
  timestamp: string;
};

export type TelemetryQuery = {
  limit?: number;
  offset?: number;
  start?: string;
  end?: string;
  newest_first?: boolean;
};
