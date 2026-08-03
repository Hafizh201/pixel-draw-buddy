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

  const toggle = (s: string) => {
    const next = value.includes(s)
      ? value.replace(s, "").replace(/\s+/g, " ").trim()
      : `${value.trim()} ${s}`.trim();
    onChange(next.slice(0, MAX_NOTE));
  };

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
      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <header className="flex items-center justify-between gap-2 border-b border-border/70 bg-surface-2/70 px-4 py-3">
          <div>
            <p className="font-display text-sm font-bold text-ink">Catatan Penting</p>
            <p className="text-[11px] text-muted-foreground">Aktifkan yang perlu — bisa pilih lebih dari satu</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            {templates.filter((s) => value.includes(s)).length}/{templates.length}
          </span>
        </header>
        <ul className="divide-y divide-border/60">
          {templates.map((s) => {
            const on = value.includes(s);
            return (
              <li key={s} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[12px] font-medium leading-snug transition",
                    on ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={s}
                  onClick={() => toggle(s)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition active:scale-95",
                    on ? "bg-primary" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-card transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      on ? "left-[1.4rem]" : "left-0.5",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
