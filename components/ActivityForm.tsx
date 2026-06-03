"use client";

import { useRef, useState } from "react";
import { supabase, REPORTS_BUCKET, ACTIVITY_TYPES } from "@/lib/supabaseClient";

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
      const safeName = file.name.replace(/[^\w.\-ก-๙]+/g, "_");
      const path = `${folder}/${Date.now()}_${safeName}`;
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

    // reset
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
    "w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-200/60";
  const labelCls = "mb-1.5 block text-sm font-semibold text-indigo-900/80";

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-3xl border border-white/60 p-6 shadow-xl shadow-indigo-200/40 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl shadow-lg shadow-fuchsia-300/50">
          ✏️
        </span>
        <h2 className="text-xl font-bold text-indigo-950">บันทึกกิจกรรมใหม่</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>ชื่อกิจกรรม *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น กิจกรรมวันวิทยาศาสตร์"
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
            placeholder="เช่น ครูสมชาย ใจดี"
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
          <label className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-indigo-300/70 bg-white/50 px-4 py-4 transition hover:border-fuchsia-400 hover:bg-fuchsia-50/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-500 text-lg text-white shadow">
              📎
            </span>
            <span className="text-sm text-slate-600">
              {file ? (
                <span className="font-medium text-fuchsia-700">{file.name}</span>
              ) : (
                "คลิกเพื่อเลือกไฟล์ (PDF, รูปภาพ, Word ฯลฯ)"
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
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-300/50 transition hover:scale-[1.02] hover:shadow-fuchsia-400/60 active:scale-100 disabled:opacity-60 sm:w-auto"
      >
        {saving ? "กำลังบันทึก..." : "✨ บันทึกกิจกรรม"}
      </button>
    </form>
  );
}
