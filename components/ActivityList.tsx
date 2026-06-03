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
        return (
          <article
            key={a.id}
            className="card group relative overflow-hidden rounded-lg p-5 transition hover:shadow-[0_12px_32px_-12px_rgba(20,33,58,0.22)]"
          >
            {/* แถบสีด้านซ้าย */}
            <span
              className={`absolute inset-y-0 left-0 w-1 ${
                isTraining ? "bg-[var(--gold)]" : "bg-[#8aa0c8]"
              }`}
            />

            <div className="mb-3 flex items-start justify-between gap-3 pl-2">
              <h3 className="font-semibold leading-snug text-[var(--text)]">
                {a.title}
              </h3>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                  isTraining
                    ? "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-light)]"
                    : "border-[#8aa0c8]/40 bg-[#8aa0c8]/12 text-[#aebed9]"
                }`}
              >
                {a.activity_type || "กิจกรรม"}
              </span>
            </div>

            <div className="space-y-1.5 pl-2 text-sm text-[var(--muted)]">
              <p className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-[var(--gold)]/70" />
                {formatDate(a.activity_date)}
              </p>
              {a.teacher_name && (
                <p className="flex items-center gap-2">
                  <IconUser className="h-4 w-4 text-[var(--gold)]/70" />
                  {a.teacher_name}
                </p>
              )}
            </div>

            {a.notes && (
              <p className="mt-3 border-t border-[var(--line)] pl-2 pt-3 text-sm leading-relaxed text-[var(--muted)]">
                {a.notes}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 pl-2">
              {a.file_url ? (
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-[75%] items-center gap-2 rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]"
                >
                  <IconDoc className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {a.file_name ?? "เปิดไฟล์รายงาน"}
                  </span>
                </a>
              ) : (
                <span className="text-xs text-[var(--muted)]">ไม่มีไฟล์แนบ</span>
              )}

              <button
                onClick={() => handleDelete(a.id)}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-400"
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
