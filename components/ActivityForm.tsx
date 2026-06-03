"use client";

import { useRef, useState } from "react";
import { supabase, REPORTS_BUCKET, ACTIVITY_TYPES } from "@/lib/supabaseClient";
import { IconPaperclip } from "@/components/Icons";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ActivityForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<string>(ACTIVITY_TYPES[0]);
  const [teacher, setTeacher] = useState("");
  const [activityDate, setActivityDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("กรุณากรอกชื่อกิจกรรม");
      return;
    }

    setSaving(true);

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    // อัปโหลดไฟล์รายงาน (ถ้ามี) ขึ้น Supabase Storage
    // แยกเก็บเป็น 2 โฟลเดอร์ตามประเภทงาน: กิจกรรม -> activity/, อบรม -> training/
    if (file) {
      const folder = activityType === "อบรม" ? "training" : "activity";
      // Supabase Storage key รองรับเฉพาะ ASCII -> ตัดอักขระภาษาไทย/พิเศษออก
      // (ชื่อไฟล์เดิมภาษาไทยจะถูกเก็บใน file_name เพื่อแสดงผลให้ผู้ใช้)
      const dot = file.name.lastIndexOf(".");
      const ext = dot > -1 ? file.name.slice(dot + 1).replace(/[^\w]+/g, "") : "";
      const base =
        (dot > -1 ? file.name.slice(0, dot) : file.name)
          .replace(/[^\w.\-]+/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "") || "report";
      const path = `${folder}/${Date.now()}_${base}${ext ? "." + ext : ""}`;
      const { error: upErr } = await supabase.storage
        .from(REPORTS_BUCKET)
        .upload(path, file, { upsert: false });

      if (upErr) {
        setSaving(false);
        setError("อัปโหลดไฟล์ไม่สำเร็จ: " + upErr.message);
        return;
      }
      const { data } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = file.name;
    }

    const { error: insErr } = await supabase.from("activities").insert({
      title: title.trim(),
      activity_type: activityType,
      teacher_name: teacher.trim(),
      activity_date: activityDate,
      notes: notes.trim() || null,
      file_url: fileUrl,
      file_name: fileName,
    });
    setSaving(false);

    if (insErr) {
      setError("บันทึกไม่สำเร็จ: " + insErr.message);
      return;
    }

    setTitle("");
    setActivityType(ACTIVITY_TYPES[0]);
    setTeacher("");
    setActivityDate(today());
    setNotes("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onSaved();
  }

  const inputCls =
    "w-full rounded-md border border-[var(--line)] bg-[#fcfbf8] px-3.5 py-2.5 text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-[var(--gold)] focus:bg-white focus:ring-1 focus:ring-[var(--gold)]";
  const labelCls =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="card rounded-lg p-6 sm:p-8">
      <div className="mb-6 border-b border-[var(--line)] pb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          บันทึกกิจกรรมใหม่
        </h2>
        <div className="gold-rule mt-2" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>ชื่อกิจกรรม *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น กิจกรรมวันวิทยาศาสตร์แห่งชาติ"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>ประเภท</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className={inputCls}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>วันที่จัดกิจกรรม/อบรม</label>
          <input
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>ชื่อครูผู้รับผิดชอบ</label>
          <input
            type="text"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="เช่น นางสาวสมหญิง ใจดี"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>รายละเอียด / หมายเหตุ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>แนบไฟล์รายงาน</label>
          <label className="group flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-[var(--line)] bg-[#fcfbf8] px-4 py-3.5 transition hover:border-[var(--gold)] hover:bg-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--ink)] text-[var(--gold-light)]">
              <IconPaperclip className="h-4 w-4" />
            </span>
            <span className="text-sm">
              {file ? (
                <span className="font-medium text-[var(--ink)]">
                  {file.name}
                </span>
              ) : (
                <span className="text-slate-500">
                  คลิกเพื่อเลือกไฟล์ (PDF, รูปภาพ, Word ฯลฯ)
                </span>
              )}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--ink)] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d2f54] disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกกิจกรรม"}
      </button>
    </form>
  );
}
