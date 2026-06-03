"use client";

import { supabase, type Activity } from "@/lib/supabaseClient";

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

// ไล่สี gradient ของการ์ดแต่ละใบให้สดใสไม่ซ้ำกัน
const CARD_GRADIENTS = [
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-rose-500 to-red-500",
];

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
    const required =
      process.env.NEXT_PUBLIC_DELETE_PASSWORD || "admin1234";
    const input = prompt("🔒 กรุณาใส่รหัสผ่านเพื่อลบกิจกรรมนี้:");
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
      <p className="py-12 text-center text-indigo-400">กำลังโหลดข้อมูล...</p>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="glass rounded-3xl border border-white/60 py-16 text-center shadow-lg">
        <div className="mb-3 text-5xl">🗂️</div>
        <p className="text-slate-500">
          ยังไม่มีกิจกรรม เริ่มบันทึกกิจกรรมแรกได้เลย
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {activities.map((a, i) => (
        <div
          key={a.id}
          className="glass group relative overflow-hidden rounded-3xl border border-white/60 p-5 shadow-lg shadow-indigo-200/40 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-200/50"
        >
          {/* แถบสีด้านบน */}
          <div
            className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${
              CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            }`}
          />

          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-indigo-950">{a.title}</h3>
            <span className="shrink-0 rounded-full bg-indigo-100/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              {formatDate(a.activity_date)}
            </span>
          </div>

          {a.activity_type && (
            <span
              className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                a.activity_type === "อบรม"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {a.activity_type === "อบรม" ? "🎓 อบรม" : "🎉 กิจกรรม"}
            </span>
          )}

          {a.teacher_name && (
            <p className="mb-1 flex items-center gap-1.5 text-sm text-slate-600">
              <span>👩‍🏫</span>
              <span className="font-medium text-slate-700">
                {a.teacher_name}
              </span>
            </p>
          )}

          {a.notes && (
            <p className="mb-3 text-sm leading-relaxed text-slate-500">
              {a.notes}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            {a.file_url ? (
              <a
                href={a.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:shadow-md"
              >
                📎 {a.file_name ?? "เปิดไฟล์รายงาน"}
              </a>
            ) : (
              <span className="text-xs text-slate-400">ไม่มีไฟล์แนบ</span>
            )}

            <button
              onClick={() => handleDelete(a.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
