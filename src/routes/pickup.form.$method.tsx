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
import { students, friends } from "@/lib/dummy/data";
import { isValidPlate } from "@/lib/format/utils";

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
  const friendIds = method === "ojek" || !f ? [] : f.split(",").filter(Boolean);
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
        {friendList.length > 0 && (
          <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
            <p className="text-xs font-semibold text-muted-foreground">
              Teman dijemput bersama ({friendList.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {friendList.map((fr) => (
                <span
                  key={fr.id}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {fr.name} · {fr.className}
                </span>
              ))}
            </div>
          </div>
        )}
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
