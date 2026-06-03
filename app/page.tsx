"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, type Activity } from "@/lib/supabaseClient";
import ActivityForm from "@/components/ActivityForm";
import ActivityList from "@/components/ActivityList";
import Reports from "@/components/Reports";

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
    <main className="relative mx-auto min-h-screen max-w-5xl px-4 py-10">
      {/* แสงไล่สีตกแต่งพื้นหลัง */}
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 top-40 -z-10 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl animate-float" />

      <header className="mb-10 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur">
          🎒 ระบบจัดการกิจกรรมโรงเรียน
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">ระบบรายงานกิจกรรม</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          บันทึกกิจกรรม แนบไฟล์รายงาน และดูสรุปแบบสวยงาม ทันสมัย
        </p>
      </header>

      <div className="mb-8 flex justify-center">
        <div className="glass inline-flex rounded-2xl border border-white/60 p-1.5 shadow-lg">
          <button
            onClick={() => setTab("record")}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
              tab === "record"
                ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            ✏️ บันทึก & รายการ
          </button>
          <button
            onClick={() => setTab("report")}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
              tab === "report"
                ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            📊 รายงาน & กราฟ
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm text-amber-700 backdrop-blur">
          ⚠️ โหลดข้อมูลไม่สำเร็จ: {loadError}
          <br />
          ตรวจสอบว่าตั้งค่า Supabase (env) และรันสคริปต์ schema.sql แล้วหรือยัง
        </div>
      )}

      {tab === "record" ? (
        <div className="space-y-10">
          <ActivityForm onSaved={fetchActivities} />
          <div>
            <h2 className="mb-4 text-xl font-bold text-indigo-950">
              📚 รายการกิจกรรมล่าสุด
            </h2>
            <ActivityList
              activities={activities}
              loading={loading}
              onChanged={fetchActivities}
            />
          </div>
        </div>
      ) : (
        <Reports activities={activities} />
      )}

      <footer className="mt-16 text-center text-xs text-slate-400">
        สร้างด้วย Next.js + Tailwind + Supabase · Deploy บน Vercel
      </footer>
    </main>
  );
}
