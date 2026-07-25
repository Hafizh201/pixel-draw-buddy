import type { Student } from "@/lib/dummy/data";
import { Chip } from "@/components/common/Section";
import { Cloud, GraduationCap, Clock } from "lucide-react";
import { dismissalTime, schoolName } from "@/lib/dummy/data";

export function StudentHeroCard({ student }: { student: Student }) {
  return (
    <div className="mx-5 overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-elevated">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Siswa Aktif</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{schoolName}</span>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl font-bold text-white shadow-glow"
          style={{ backgroundColor: student.avatarColor }}
        >
          {student.nickname[0]}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-white/70">Kelas {student.className}</p>
          <h2 className="truncate font-display text-xl font-bold">{student.name}</h2>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat icon={<GraduationCap className="h-4 w-4" />} label="Hadir" value={student.attendedAt ?? "—"} />
        <MiniStat icon={<Clock className="h-4 w-4" />} label="Pulang" value={dismissalTime} />
        <MiniStat icon={<Cloud className="h-4 w-4" />} label="Cerah" value="30°" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip tone="success" className="bg-white/15 text-white">Sudah presensi hadir</Chip>
        {student.dismissStatus === "sudah" ? (
          <Chip tone="success" className="bg-white/15 text-white">Sudah presensi pulang</Chip>
        ) : (
          <Chip className="bg-white/10 text-white">Menunggu presensi pulang</Chip>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}
