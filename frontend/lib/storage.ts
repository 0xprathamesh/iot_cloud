const STORAGE_KEY = "iot_cloud_api_key";

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredApiKey(value: string): void {
  localStorage.setItem(STORAGE_KEY, value.trim());
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
