import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePageReady } from "@/hooks/use-page-ready";
import { MonitoringSkeleton } from "@/components/feedback/Skeletons";
import { useEffect } from "react";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { TopBar } from "@/components/layout/TopBar";
import { useActivePickup } from "@/lib/state/stores";
import { completeAndStartCooldown } from "@/lib/pickup/simulator";
import { StageStepper, ProgressRing, ActivityTimeline } from "@/components/monitoring/StageStepper";
import { AutoPickupGeofence } from "@/components/monitoring/AutoPickupGeofence";
import { SectionHeader, IconBadge, Chip } from "@/components/common/Section";
import { Radio, Volume2, Copy, Server, Cpu } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BigButton } from "@/components/common/BigButton";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — Panggil" },
      { name: "description", content: "Pantau proses pemanggilan siswa secara langsung." },
      { property: "og:title", content: "Monitoring Penjemputan" },
      { property: "og:description", content: "Setiap tahapan proses transparan dan mudah dipahami." },
    ],
  }),
  component: Monitoring,
});

function Monitoring() {
  const ready = usePageReady();
  const { current } = useActivePickup();
  if (!ready) return <MonitoringSkeleton />;
  const nav = useNavigate();

  useEffect(() => {
    if (current?.stage === "done" && current.cooldownStartedAt === null) {
      completeAndStartCooldown();
      const t = setTimeout(() => nav({ to: "/pickup/waiting" }), 800);
      return () => clearTimeout(t);
    }
  }, [current, nav]);

  if (!current) {
    return (
      <PhoneShell>
        <TopBar title="Monitoring" back="/dashboard" />
        <div className="p-5">
          <EmptyState
            title="Belum ada penjemputan aktif"
            body="Mulai penjemputan dari beranda untuk melihat proses di sini."
            action={<BigButton onClick={() => nav({ to: "/pickup/method" })}>Mulai Penjemputan</BigButton>}
          />
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar title="Monitoring Penjemputan" back="/dashboard" subtitle="Semua berjalan normal" />

      <div className="mx-5 mt-4 flex items-center gap-4 rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-elevated">
        <ProgressRing stage={current.stage} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Status saat ini</p>
          <p className="font-display text-lg font-bold leading-tight">
            {current.timeline[current.timeline.length - 1]?.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip className="bg-white/15 text-white">Estimasi 2 mnt</Chip>
            <Chip className="bg-white/15 text-white">Speaker aktif</Chip>
          </div>
        </div>
      </div>

      <SectionHeader title="Tahapan Proses" className="mt-8" />
      <div className="mx-5 rounded-3xl border border-border bg-surface p-5 shadow-card">
        <StageStepper stage={current.stage} />
      </div>

      <SectionHeader title="Pratinjau Pengumuman" className="mt-8" />
      <div className="mx-5 rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <Volume2 className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Kalimat pemanggilan</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink">"{current.announcement}"</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground animate-pulse-ring">
              <Radio className="h-4 w-4" />
            </button>
            <span className="text-[11px] text-muted-foreground">Pratinjau audio (dummy)</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(current.announcement);
              toast.success("Kalimat pemanggilan disalin");
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-foreground"
          >
            <Copy className="h-3.5 w-3.5" /> Salin
          </button>
        </div>
      </div>

      <SectionHeader title="Riwayat Aktivitas" className="mt-8" />
      <div className="mx-5 rounded-3xl border border-border bg-surface p-5 shadow-card">
        <ActivityTimeline entries={current.timeline} />
      </div>

      <SectionHeader title="Status Sistem" className="mt-8" />
      <div className="mx-5 grid grid-cols-2 gap-3 pb-4">
        <SystemTile icon={<Server className="h-4 w-4" />} title="Server" status="Normal" />
        <SystemTile icon={<Cpu className="h-4 w-4" />} title="AI" status="Aktif" />
        <SystemTile icon={<Volume2 className="h-4 w-4" />} title="Speaker" status="Tersedia" />
        <SystemTile icon={<Radio className="h-4 w-4" />} title="Antrean" status="2 permintaan" />
      </div>
    </PhoneShell>
  );
}

function SystemTile({ icon, title, status }: { icon: React.ReactNode; title: string; status: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-card">
      <IconBadge tone="success">{icon}</IconBadge>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-xs font-semibold text-ink">{status}</p>
      </div>
    </div>
  );
}
