"use client";

import { useState } from "react";
import { registerDevice } from "@/lib/api";
import type { DeviceCreate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [extraRaw, setExtraRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let device_extra: Record<string, unknown> | undefined;
      if (extraRaw.trim()) {
        device_extra = JSON.parse(extraRaw) as Record<string, unknown>;
      }
      const body: DeviceCreate = {
        name: name.trim(),
        description: description.trim() || null,
        device_extra,
      };
      const res = await registerDevice(body);
      setCreatedKey(res.api_key);
      setDeviceName(res.name);
      setName("");
      setDescription("");
      setExtraRaw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Register device</h1>
        <p className="mt-1 text-sm text-slate-400">
          Creates a device row and returns a one-time API key. Store it before leaving this screen.
        </p>
      </div>

      {createdKey ? (
        <Card className="space-y-4 p-6 ring-1 ring-cyan-400/25">
          <p className="text-sm font-medium text-white">Save this key now</p>
          <p className="text-xs text-slate-500">Device {deviceName}</p>
          <div className="break-all rounded-xl border border-white/[0.08] bg-black/30 p-4 font-mono text-xs text-cyan-200">
            {createdKey}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyKey}>
              Copy key
            </Button>
            <Button type="button" variant="outline" onClick={() => setCreatedKey(null)}>
              Register another
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">
                Extra JSON <span className="text-slate-600">optional</span>
              </label>
              <Textarea
                value={extraRaw}
                onChange={(e) => setExtraRaw(e.target.value)}
                placeholder='{"zone":"lab"}'
                rows={3}
                className="font-mono text-xs"
              />
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create device"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
