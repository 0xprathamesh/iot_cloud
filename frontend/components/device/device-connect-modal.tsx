"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getDeviceMe } from "@/lib/api";
import { useApiKey } from "@/hooks/use-api-key";
import { getStoredApiKey } from "@/lib/storage";
import type { DeviceOut, DeviceSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";

type Phase = "form" | "match" | "mismatch" | "invalid";

export function DeviceConnectModal({
  open,
  onClose,
  device,
}: {
  open: boolean;
  onClose: () => void;
  device: DeviceSummary | null;
}) {
  const router = useRouter();
  const { setKey } = useApiKey();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [matched, setMatched] = useState<DeviceOut | null>(null);
  const [other, setOther] = useState<DeviceOut | null>(null);
  const [verifiedKey, setVerifiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !device) return;
    setDraft("");
    setBusy(false);
    setPhase("form");
    setMatched(null);
    setOther(null);
    setVerifiedKey(null);
  }, [open, device]);

  function handleClose() {
    setDraft("");
    setBusy(false);
    setPhase("form");
    setMatched(null);
    setOther(null);
    setVerifiedKey(null);
    onClose();
  }

  async function verify(rawKey: string) {
    if (!device) return;
    const key = rawKey.trim();
    if (!key) return;
    setBusy(true);
    setPhase("form");
    setMatched(null);
    setOther(null);
    setVerifiedKey(null);
    try {
      const me = await getDeviceMe(key);
      if (me.id !== device.id) {
        setOther(me);
        setPhase("mismatch");
      } else {
        setMatched(me);
        setVerifiedKey(key);
        setPhase("match");
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        setPhase("invalid");
      } else {
        setPhase("invalid");
      }
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    verify(draft);
  }

  function useSaved() {
    const k = getStoredApiKey();
    if (!k) return;
    setDraft(k);
    verify(k);
  }

  function saveAndDashboard() {
    if (!matched || !verifiedKey) return;
    setKey(verifiedKey);
    handleClose();
    router.push("/dashboard");
  }

  function tryAgain() {
    setPhase("form");
    setMatched(null);
    setOther(null);
    setVerifiedKey(null);
  }

  if (!device) return null;

  const title =
    phase === "match"
      ? "Connected"
      : phase === "mismatch"
        ? "Wrong device"
        : phase === "invalid"
          ? "Invalid key"
          : "Connect to device";

  return (
    <Modal open={open} onClose={handleClose} wide={phase === "match" || phase === "mismatch"} title={title}>
      {phase === "form" || phase === "invalid" ? (
        <div className="space-y-4">
          <Card className="border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-medium text-white">{device.name}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{device.id}</p>
            <p className="mt-2 text-xs text-slate-500">
              Paste the API key for this device. The key is validated with{" "}
              <span className="font-mono text-slate-400">/devices/me</span>.
            </p>
          </Card>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="API key (UUID)"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-sm"
            />
            {phase === "invalid" ? (
              <p className="text-sm text-red-300">This key is invalid or the device is disabled.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || !draft.trim()}>
                {busy ? "Verifying…" : "Verify key"}
              </Button>
              <Button type="button" variant="outline" onClick={useSaved} disabled={busy}>
                Use saved key
              </Button>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}

    

      {phase === "match" && matched ? (
        <div className="space-y-4">
          <Card className="border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-100">
              Key matches <span className="font-semibold text-white">{matched.name}</span>.
            </p>
            <p className="mt-2 break-all font-mono text-[11px] text-slate-500">{matched.id}</p>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={saveAndDashboard}>
              Save key & open dashboard
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
