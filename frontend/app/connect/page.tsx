"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDeviceMe } from "@/lib/api";
import { useApiKey } from "@/hooks/use-api-key";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ConnectPage() {
  const router = useRouter();
  const { key, setKey, clear } = useApiKey();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const v = draft.trim();
      await getDeviceMe(v);
      setKey(v);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Connect</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste your device API key. It stays in this browser only via{" "}
          <span className="font-mono text-slate-300">localStorage</span>.
        </p>
      </div>
      <Card className="p-6">
        {key ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">A key is already saved.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => router.push("/dashboard")}>
                Open dashboard
              </Button>
              <Button type="button" variant="outline" onClick={clear}>
                Clear key
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="UUID API key"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-sm"
            />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || !draft.trim()}>
                {busy ? "Checking…" : "Save & continue"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/")}>
                Back
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
