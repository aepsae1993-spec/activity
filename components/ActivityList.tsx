"use client";

import { supabase, type Activity } from "@/lib/supabaseClient";
import {
  IconUser,
  IconDoc,
  IconTrash,
  IconCalendar,
} from "@/components/Icons";

function formatDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function ActivityList({
  activities,
  loading,
  onChanged,
}: {
  activities: Activity[];
  loading: boolean;
  onChanged: () => void;
}) {
  async function handleDelete(id: string) {
    const required = process.env.NEXT_PUBLIC_DELETE_PASSWORD || "admin1234";
    const input = prompt("กรุณาใส่รหัสผ่านเพื่อลบกิจกรรมนี้:");
    if (input === null) return; // กดยกเลิก
    if (input !== required) {
      alert("รหัสผ่านไม่ถูกต้อง");
      return;
    }
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
      return;
    }
    onChanged();
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">กำลังโหลดข้อมูล...</p>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card rounded-lg py-16 text-center">
        <p className="text-[var(--muted)]">
          ยังไม่มีกิจกรรม — เริ่มบันทึกกิจกรรมแรกได้เลย
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {activities.map((a) => {
        const isTraining = a.activity_type === "อบรม";
        const t = isTraining ? TRAINING : ACTIVITY;
        return (
          <article
            key={a.id}
            className={`card group relative overflow-hidden rounded-xl p-5 pl-6 transition hover:-translate-y-0.5 ${t.hover}`}
          >
            {/* แถบสีด้านซ้าย + แสงเรืองมุมบน */}
            <span
              className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${t.bar}`}
            />
            <span
              className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${t.glow} blur-2xl`}
            />

            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="font-semibold leading-snug text-white">
                {a.title}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm ${t.badge}`}
              >
                {a.activity_type || "กิจกรรม"}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <IconCalendar className={`h-4 w-4 ${t.icon}`} />
                {formatDate(a.activity_date)}
              </p>
              {a.teacher_name && (
                <p className="flex items-center gap-2">
                  <IconUser className={`h-4 w-4 ${t.icon}`} />
                  {a.teacher_name}
                </p>
              )}
            </div>

            {a.notes && (
              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-slate-300">
                {a.notes}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              {a.file_url ? (
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex max-w-[75%] items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${t.file}`}
                >
                  <IconDoc className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {a.file_name ?? "เปิดไฟล์รายงาน"}
                  </span>
                </a>
              ) : (
                <span className="text-xs text-slate-500">ไม่มีไฟล์แนบ</span>
              )}

              <button
                onClick={() => handleDelete(a.id)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
              >
                <IconTrash className="h-4 w-4" />
                ลบ
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ชุดสีตามประเภท — สดใสแต่ยังเข้ากับธีมเข้ม
const ACTIVITY = {
  bar: "from-cyan-400 to-blue-500",
  glow: "bg-cyan-400/15",
  badge: "bg-cyan-400 text-cyan-950",
  icon: "text-cyan-300",
  file: "bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25",
  hover: "hover:shadow-[0_16px_40px_-16px_rgba(34,211,238,0.45)]",
};

const TRAINING = {
  bar: "from-amber-300 to-yellow-500",
  glow: "bg-amber-400/15",
  badge: "bg-amber-400 text-amber-950",
  icon: "text-amber-300",
  file: "bg-amber-400/15 text-amber-200 hover:bg-amber-400/25",
  hover: "hover:shadow-[0_16px_40px_-16px_rgba(251,191,36,0.45)]",
};
