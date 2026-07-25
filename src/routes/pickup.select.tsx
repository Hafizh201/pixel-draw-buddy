import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { TopBar } from "@/components/layout/TopBar";
import { BigButton } from "@/components/common/BigButton";
import { students } from "@/lib/dummy/data";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ m: z.enum(["self", "other", "ojek"]).default("self") });

export const Route = createFileRoute("/pickup/select")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Pilih Siswa — Panggil" },
      { name: "description", content: "Pilih siswa yang akan dijemput." },
      { property: "og:title", content: "Pilih Siswa" },
      { property: "og:description", content: "Satu, beberapa, atau seluruh anak sekaligus." },
    ],
  }),
  component: SelectStudent,
});

function SelectStudent() {
  const { m } = Route.useSearch();
  const active = students.filter((s) => !s.pendingApproval);
  const [selected, setSelected] = useState<string[]>([active[0].id]);
  const nav = useNavigate();

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <PhoneShell>
      <TopBar title="Pilih Siswa" back="/pickup/method" subtitle="Bisa lebih dari satu" />
      <div className="space-y-3 p-5">
        {active.map((s) => {
          const checked = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-3xl border p-4 text-left shadow-card transition active:scale-[0.99]",
                checked ? "border-primary bg-primary/5" : "border-border bg-surface",
              )}
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl font-display text-xl font-bold text-white"
                style={{ backgroundColor: s.avatarColor }}
              >
                {s.nickname[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink">{s.name}</p>
                <p className="text-xs text-muted-foreground">Kelas {s.className} · NIS {s.nis}</p>
              </div>
              <span className={cn("grid h-6 w-6 place-items-center rounded-md border-2", checked ? "border-primary bg-primary text-white" : "border-border")}>
                {checked && <Check className="h-4 w-4" />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-border bg-background/95 px-5 pb-6 pt-4 backdrop-blur">
        <BigButton
          disabled={selected.length === 0}
          onClick={() => nav({ to: `/pickup/form/${m}`, search: { s: selected.join(",") } })}
        >
          Pilih {selected.length} siswa
        </BigButton>
      </div>
    </PhoneShell>
  );
}
