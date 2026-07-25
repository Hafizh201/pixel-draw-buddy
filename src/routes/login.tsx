import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { BigButton } from "@/components/common/BigButton";
import { TextField } from "@/components/pickup/Fields";
import { PhoneCall } from "lucide-react";
import { sessionStore } from "@/lib/state/stores";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — Panggil" },
      { name: "description", content: "Masuk ke aplikasi Panggil menggunakan username wali murid." },
      { property: "og:title", content: "Masuk — Panggil" },
      { property: "og:description", content: "Autentikasi dua tahap yang sederhana." },
    ],
  }),
  component: LoginUsername,
});

function LoginUsername() {
  const [username, setUsername] = useState("");
  const nav = useNavigate();
  const canContinue = username.trim().length >= 3;
  return (
    <PhoneShell padded={false}>
      <div className="flex min-h-screen flex-col px-6 pt-16">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <PhoneCall className="h-6 w-6" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold text-ink">Selamat datang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan username wali murid Anda untuk melanjutkan.
        </p>
        <div className="mt-8">
          <TextField label="Username" value={username} onChange={setUsername} placeholder="cth. wali.fauzan" />
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Belum memiliki akun? Silakan hubungi Tata Usaha sekolah untuk mendapatkan username Anda.
        </p>
        <div className="mt-auto pb-10 pt-8">
          <BigButton
            disabled={!canContinue}
            onClick={() => {
              sessionStore.set({ username: username.trim(), signedIn: false });
              nav({ to: "/login/pin" });
            }}
          >
            Lanjut
          </BigButton>
        </div>
      </div>
    </PhoneShell>
  );
}
