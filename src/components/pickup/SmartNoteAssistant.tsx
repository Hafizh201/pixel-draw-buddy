import { useState, useEffect } from "react";
import { MAX_NOTE, detectBadWords, politeCorrection, suggestionsFor } from "@/lib/validation/note";
import { Sparkles, Wand2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SmartNoteAssistant({
  method,
  value,
  onChange,
  onValidityChange,
}: {
  method: "self" | "other" | "ojek";
  value: string;
  onChange: (v: string) => void;
  onValidityChange?: (valid: boolean) => void;
}) {
  const [bad, setBad] = useState<string[]>([]);
  const remaining = MAX_NOTE - value.length;
  const templates = suggestionsFor(method).slice(0, 3);

  useEffect(() => {
    const b = detectBadWords(value);
    setBad(b);
    onValidityChange?.(b.length === 0 && value.length <= MAX_NOTE);
  }, [value, onValidityChange]);

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
        <span>Catatan untuk pengumuman</span>
        <span className={cn(remaining < 10 && "text-warning-foreground", remaining < 0 && "text-destructive")}>
          {remaining} karakter
        </span>
      </label>
      <div className={cn("rounded-2xl border bg-surface p-3 shadow-card transition", bad.length > 0 ? "border-destructive/50" : "border-border")}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_NOTE))}
          rows={3}
          placeholder="Tulis catatan singkat (opsional)"
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI Auto-Correct
          </div>
          <button
            type="button"
            onClick={() => onChange(politeCorrection(value))}
            disabled={!value.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary disabled:opacity-40"
          >
            <Wand2 className="h-3.5 w-3.5" /> Perbaiki bahasa
          </button>
        </div>
      </div>
      {bad.length > 0 && (
        <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Catatan mengandung kata tidak sesuai ({bad.join(", ")}). Mohon perbaiki sebelum mengirim.</p>
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-border bg-surface-2/60 p-3">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="flex w-full items-center justify-between gap-2"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Pilih Catatan Penting (Opsional)
          </span>
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition",
              showTemplates ? "bg-primary" : "bg-border",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-card transition-all",
                showTemplates ? "left-[1.15rem]" : "left-0.5",
              )}
            />
          </span>
        </button>
        <div
          className={cn(
            "grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showTemplates ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-3 grid gap-2">
              {templates.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange(s)}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-left text-[11px] font-medium leading-snug text-foreground shadow-card transition active:scale-[0.98] hover:border-primary/60",
                    value.trim() === s && "border-primary bg-primary/5 text-primary",
                  )}
                >
                  <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-md bg-primary/10 text-[9px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
