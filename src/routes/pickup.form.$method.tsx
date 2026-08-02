import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePageReady } from "@/hooks/use-page-ready";
import { FormSkeleton } from "@/components/feedback/Skeletons";
import { useState } from "react";
import { z } from "zod";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { TopBar } from "@/components/layout/TopBar";
import { BigButton } from "@/components/common/BigButton";
import { SmartNoteAssistant } from "@/components/pickup/SmartNoteAssistant";
import { PlateInput, TextField, SelectField } from "@/components/pickup/Fields";
import { students, friends, dismissalFor } from "@/lib/dummy/data";
import { isValidPlate } from "@/lib/format/utils";
import { Users, Clock, Megaphone } from "lucide-react";

const searchSchema = z.object({ s: z.string().optional(), f: z.string().optional() });

export const Route = createFileRoute("/pickup/form/$method")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Form Penjemputan — Panggil` },
      { name: "description", content: `Isi data penjemputan (${params.method}).` },
      { property: "og:title", content: `Form Penjemputan Panggil` },
      { property: "og:description", content: `Metode: ${params.method}.` },
    ],
  }),
  component: FormPage,
});

const draft = {
  method: "self" as "self" | "other" | "ojek",
  note: "",
  estimate: "5",
  waitLocation: "Gerbang Utama",
  pickerName: "",
  relation: "Kakek",
  driverName: "",
  platform: "Gojek" as "Gojek" | "Grab" | "Maxim" | "InDrive",
  plate: "",
};

let draftMemo = { ...draft };

function FormPage() {
  const ready = usePageReady();
  const { method } = Route.useParams() as { method: "self" | "other" | "ojek" };
  const { s, f } = Route.useSearch();
  const nav = useNavigate();
  const [state, setState] = useState({ ...draftMemo, method });
  const [noteValid, setNoteValid] = useState(true);
  if (!ready) return <FormSkeleton />;

  const set = <K extends keyof typeof state>(k: K, v: (typeof state)[K]) =>
    setState((p) => ({ ...p, [k]: v }));

  const studentIds = (s ?? students.filter((x) => !x.pendingApproval)[0].id).split(",");
  const friendIds: string[] = method === "ojek" || !f ? [] : f.split(",").filter(Boolean);
  const friendList = friendIds
    .map((id) => friends.find((x) => x.id === id))
    .filter((x): x is (typeof friends)[number] => Boolean(x));

  const plateOk = method !== "ojek" || isValidPlate(state.plate);
  const requiredOk =
    (method !== "other" || state.pickerName.trim().length > 1) &&
    (method !== "ojek" || (state.driverName.trim() && plateOk));
  const canNext = noteValid && requiredOk;

  return (
    <PhoneShell>
      <TopBar
        title={method === "self" ? "Dijemput Sendiri" : method === "other" ? "Dijemput Orang Lain" : "Ojek Online"}
        back="/pickup/method"
        subtitle={`Untuk ${studentIds.length} siswa${friendList.length > 0 ? ` + ${friendList.length} teman` : ""}`}
      />
      <div className="space-y-4 p-5">
        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          <header className="flex items-center justify-between border-b border-border/70 bg-surface-2/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="font-display text-sm font-bold text-ink">Yang akan dipanggil</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              {called.length} nama
            </span>
          </header>
          <ul className="divide-y divide-border/60">
            {called.map((p) => (
              <li key={p.key} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 font-display text-sm font-bold text-ink">
                  {p.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Kelas {p.className} · {p.isFriend ? "Teman" : "Ananda"}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-bold text-ink">
                  <Clock className="h-3 w-3 text-primary" />
                  {dismissalFor(p.className)}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/60 px-4 py-2.5 text-[10px] leading-relaxed text-muted-foreground">
            Jam pulang mengikuti jadwal tiap kelas pada hari ini.
          </p>
        </section>

        {method === "other" && (
          <>
            <TextField label="Nama penjemput" value={state.pickerName} onChange={(v) => set("pickerName", v)} placeholder="Nama lengkap" />
            <SelectField
              label="Hubungan dengan siswa"
              value={state.relation as "Kakek" | "Nenek" | "Paman" | "Bibi" | "Saudara"}
              onChange={(v) => set("relation", v)}
              options={[
                { value: "Kakek", label: "Kakek" },
                { value: "Nenek", label: "Nenek" },
                { value: "Paman", label: "Paman" },
                { value: "Bibi", label: "Bibi" },
                { value: "Saudara", label: "Saudara" },
              ]}
            />
          </>
        )}

        {method === "ojek" && (
          <>
            <TextField label="Nama driver" value={state.driverName} onChange={(v) => set("driverName", v)} placeholder="Nama driver" />
            <SelectField
              label="Platform"
              value={state.platform}
              onChange={(v) => set("platform", v)}
              options={[
                { value: "Gojek", label: "Gojek" },
                { value: "Grab", label: "Grab" },
                { value: "Maxim", label: "Maxim" },
                { value: "InDrive", label: "InDrive" },
              ]}
            />
            <PlateInput value={state.plate} onChange={(v) => set("plate", v)} />
          </>
        )}

        {method === "self" && (
          <TextField
            label="Lokasi menunggu"
            value={state.waitLocation}
            onChange={(v) => set("waitLocation", v)}
            hint="Contoh: Gerbang Utama, Parkir Timur"
          />
        )}

        <SelectField
          label="Estimasi kedatangan"
          value={state.estimate as "5" | "10" | "15" | "20"}
          onChange={(v) => set("estimate", v)}
          options={[
            { value: "5", label: "≤ 5 menit" },
            { value: "10", label: "10 menit" },
            { value: "15", label: "15 menit" },
            { value: "20", label: "20 menit" },
          ]}
        />

        <SmartNoteAssistant
          method={method}
          value={state.note}
          onChange={(v) => set("note", v)}
          onValidityChange={setNoteValid}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-border bg-background/95 px-5 pb-6 pt-4 backdrop-blur">
        <BigButton
          disabled={!canNext}
          onClick={() => {
            draftMemo = state;
            nav({
              to: "/pickup/preview",
              search: {
                s: studentIds.join(","),
                ...(friendIds.length > 0 ? { f: friendIds.join(",") } : {}),
              },
            });
          }}
        >
          Lanjut ke Ringkasan
        </BigButton>
      </div>
    </PhoneShell>
  );
}

export function getDraft() {
  return draftMemo;
}
