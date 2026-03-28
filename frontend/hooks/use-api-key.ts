"use client";

import { useCallback, useEffect, useState } from "react";
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from "@/lib/storage";

export function useApiKey() {
  const [key, setKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setKey(getStoredApiKey());
    setHydrated(true);
  }, []);

  const setKeyPersist = useCallback((value: string) => {
    const v = value.trim();
    setStoredApiKey(v);
    setKey(v);
  }, []);

  const clear = useCallback(() => {
    clearStoredApiKey();
    setKey(null);
  }, []);

  return { key, setKey: setKeyPersist, clear, hydrated };
}
