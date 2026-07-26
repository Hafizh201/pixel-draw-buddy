import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePageReady } from "@/hooks/use-page-ready";
import { MonitoringSkeleton } from "@/components/feedback/Skeletons";
import { useState } from "react";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { TopBar } from "@/components/layout/TopBar";
import { CircularCooldownTimer } from "@/components/monitoring/CircularCooldownTimer";
import { BigButton } from "@/components/common/BigButton";
import { SectionHeader, IconBadge, Chip } from "@/components/common/Section";
import { useActivePickup } from "@/lib/state/stores";
import { finishAndArchive, triggerSecondCall } from "@/lib/pickup/simulator";
import { students, secondCallOptions } from "@/lib/dummy/data";
import { ClipboardCheck, ClipboardX, MessageSquareText, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils";

const COOLDOWN_MS = 180_000;

export const Route = createFileRoute("/pickup/waiting")({
  head: () => ({
    meta: [
      { title: "Menunggu Siswa — Panggil" },
      { name: "description", content: "Menunggu siswa menuju area penjemputan. Panggil ulang jika diperlukan." },
      { property: "og:title", content: "Pickup Waiting" },
      { property: "og:description", content: "Cooldown 3 menit sebelum pemanggilan berikutnya." },
    ],
  }),
  component: WaitingPage,
});

function WaitingPage() {
  const ready = usePageReady();
  const { current } = useActivePickup();
  if (!ready) return <MonitoringSkeleton />;
  const nav = useNavigate();
  const [extras, setExtras] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  if (!current) {
    return (
      <PhoneShell>
        <TopBar title="Menunggu Siswa" back="/dashboard" />
        <div className="p-5">
          <EmptyState title="Tidak ada penjemputan aktif" body="Mulai penjemputan baru dari beranda." />
        </div>
      </PhoneShell>
    );
  }

  const startedAt = current.cooldownStartedAt ?? Date.now();
  const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - startedAt));
  const canRecall = remaining === 0;

  const student = students.find((s) => s.id === current.studentIds[0])!;
  const teacherNote = current.callCount >= 2 ? "Ananda masih menyelesaikan tugas di kelas, mohon menunggu sebentar." : null;

  return (
    <PhoneShell>
      <TopBar title="Menunggu Siswa" back="/dashboard" subtitle="Ananda sedang menuju gerbang" />

      <div className="flex flex-col items-center px-5 pt-6" key={tick}>
        <CircularCooldownTimer
          startedAt={startedAt}
          durationMs={COOLDOWN_MS}
          onDone={() => setTick((t) => t + 1)}
        />
        <Chip tone="primary" className="mt-4">Pemanggilan ke-{current.callCount}</Chip>
      </div>

      <SectionHeader title="Status Presensi Pulang" className="mt-8" />
      <div className="mx-5 flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card">
        <IconBadge tone={student.dismissStatus === "sudah" ? "success" : "muted"}>
          {student.dismissStatus === "sudah" ? <ClipboardCheck className="h-5 w-5" /> : <ClipboardX className="h-5 w-5" />}
        </IconBadge>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-ink">{student.name}</p>
          <p className="text-xs text-muted-foreground">
            {student.dismissStatus === "sudah"
              ? `Sudah presensi pulang · ${student.dismissedAt}`
              : "Belum melakukan presensi pulang"}
          </p>
        </div>
      </div>

      {teacherNote && (
        <>
          <SectionHeader title="Keterangan Wali Kelas" className="mt-6" />
          <div className="mx-5 flex items-start gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card">
            <IconBadge tone="warm"><MessageSquareText className="h-5 w-5" /></IconBadge>
            <p className="text-sm leading-relaxed text-ink">{teacherNote}</p>
          </div>
        </>
      )}

      <div className="mx-5 mt-8 space-y-3 pb-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <BigButton disabled={!canRecall}>
              {canRecall ? "Panggil Lagi" : "Menunggu cooldown…"}
            </BigButton>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display text-lg">Tambahkan kalimat</SheetTitle>
              <p className="text-xs text-muted-foreground">Pilih satu atau lebih kalimat tambahan.</p>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {secondCallOptions.map((o) => {
                const on = extras.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() => setExtras((prev) => (on ? prev.filter((x) => x !== o) : [...prev, o]))}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                      on ? "border-primary bg-primary/5" : "border-border bg-surface",
                    )}
                  >
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2", on ? "border-primary bg-primary text-white" : "border-border")}>
                      {on ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="text-sm text-ink">{o}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <BigButton variant="secondary" onClick={() => { setExtras([]); setOpen(false); }}>
                <X className="h-4 w-4" /> Batal
              </BigButton>
              <BigButton
                onClick={() => {
                  triggerSecondCall(extras);
                  setExtras([]);
                  setOpen(false);
                  nav({ to: "/monitoring" });
                }}
              >
                Panggil sekarang
              </BigButton>
            </div>
          </SheetContent>
        </Sheet>

        <BigButton
          variant="secondary"
          onClick={() => {
            finishAndArchive();
            nav({ to: "/pickup/complete" });
          }}
        >
          Selesai — anak sudah dijemput
        </BigButton>
      </div>
    </PhoneShell>
  );
}
