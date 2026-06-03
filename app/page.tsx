"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { supabase, type Activity } from "@/lib/supabaseClient";
import ActivityForm from "@/components/ActivityForm";
import ActivityList from "@/components/ActivityList";
import Reports from "@/components/Reports";
import { IconEdit, IconChart } from "@/components/Icons";

type Tab = "record" | "report";

export default function Home() {
  const [tab, setTab] = useState<Tab>("record");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("activity_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setActivities([]);
    } else {
      setActivities((data as Activity[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="min-h-screen">
      {/* แถบหัวเรื่องทางการ */}
      <header className="border-b border-[var(--line-gold)] bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-1 ring-[var(--gold)]/50 sm:h-[72px] sm:w-[72px]">
            <Image
              src="/logo.png"
              alt="ตราโรงเรียน"
              width={72}
              height={72}
              priority
              className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
              โรงเรียนวัดบางขุด (อุ่นพิทยาคาร)
            </p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
              ระบบรายงานกิจกรรม
            </h1>
            <p className="text-sm text-[var(--muted)]">
              ระบบบันทึกและรายงานกิจกรรม / การอบรม
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* แท็บ */}
        <div className="mb-8 flex border-b border-[var(--line)]">
          <TabButton
            active={tab === "record"}
            onClick={() => setTab("record")}
            icon={<IconEdit className="h-4 w-4" />}
            label="บันทึก & รายการ"
          />
          <TabButton
            active={tab === "report"}
            onClick={() => setTab("report")}
            icon={<IconChart className="h-4 w-4" />}
            label="รายงาน & สถิติ"
          />
        </div>

        {loadError && (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
            โหลดข้อมูลไม่สำเร็จ: {loadError}
            <br />
            ตรวจสอบการตั้งค่า Supabase (env) และการรันสคริปต์ schema.sql
          </div>
        )}

        {tab === "record" ? (
          <div className="space-y-10">
            <ActivityForm onSaved={fetchActivities} />
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  รายการกิจกรรมล่าสุด
                </h2>
                <div className="gold-rule mt-2" />
              </div>
              <ActivityList
                activities={activities}
                loading={loading}
                onChanged={fetchActivities}
              />
            </section>
          </div>
        ) : (
          <Reports activities={activities} />
        )}

        <footer className="mt-16 border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--muted)]">
          พัฒนาด้วย Next.js · Tailwind · Supabase — เผยแพร่บน Vercel
        </footer>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
        active
          ? "border-[var(--gold)] text-[var(--gold-light)]"
          : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
