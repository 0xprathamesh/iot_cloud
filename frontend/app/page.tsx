import { apiBase } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export default function HomePage() {
  const api = apiBase();

  return (
    <div className="space-y-10">
      <section className="lg:mt-24 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            Edge to cloud
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Telemetry that stays fast, legible, and honest.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-400">
            Register a device, capture temperature and humidity, and watch the stream stabilize
            in a dashboard tuned for clarity. Built for learning-grade IoT
            architecture.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/register" className="min-w-[140px]">
              Register device
            </LinkButton>
            <LinkButton href="/connect" variant="outline" className="min-w-[140px]">
              Connect key
            </LinkButton>
            <LinkButton href={`${api}/docs`} variant="ghost" className="min-w-[120px]" target="_blank">
              Open API
            </LinkButton>
          </div>
          <p className="text-xs text-slate-500">
            API base <span className="font-mono text-slate-400">{api}</span>
          </p>
        </div>
        <Card className="relative overflow-visible p-6 sm:p-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">Live pipeline</p>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                ingest → store → chart
              </span>
            </div>
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>temperature</span>
                <span className="font-mono text-cyan-300">24.6°C</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-cyan-500 to-indigo-400" />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>humidity</span>
                <span className="font-mono text-indigo-200">58%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400/80" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] py-3">
                <p className="text-slate-500">Devices</p>
                <p className="mt-1 text-lg font-semibold text-white">12+</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] py-3">
                <p className="text-slate-500">Points</p>
                <p className="mt-1 text-lg font-semibold text-white">500</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] py-3">
                <p className="text-slate-500">Latency</p>
                <p className="mt-1 text-lg font-semibold text-white">local</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3 lg:mt-24">
        {[
          {
            t: "Typed client",
            d: "Predictable models for devices and telemetry rows keep the UI stable as you extend schemas.",
          },
          {
            t: "Scoped access",
            d: "Paste an API key in Connect once. The dashboard binds /me and /telemetry to that device only.",
          },
          {
            t: "High-signal charts",
            d: "Dual-axis lines with restrained motion. Heavy ranges disable animation to stay smooth.",
          },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <p className="font-medium text-white">{x.t}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{x.d}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
