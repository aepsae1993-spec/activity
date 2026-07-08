"use client";

import { useState } from "react";
import type { Activity } from "@/lib/supabaseClient";
import { IconDoc } from "@/components/Icons";

const SCHOOL_NAME = "โรงเรียนวัดบางขุด (อุ่นพิทยาคาร)";
const ACADEMIC_YEAR = "2569";
const LOGO_URL =
  "https://hllulfnvwcrzsiwofqzx.supabase.co/storage/v1/object/public/logo/school-logo.png";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function formatThaiDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReportHtml(
  type: "กิจกรรม" | "อบรม",
  monthValue: string,
  rows: Activity[]
): string {
  const monthLabel =
    monthValue === "all"
      ? ""
      : `ประจำเดือน${THAI_MONTHS[parseInt(monthValue, 10) - 1]} `;
  const heading = `รายงาน${type} ${monthLabel}ปีการศึกษา ${ACADEMIC_YEAR}`;
  const accent = type === "อบรม" ? "#b8902a" : "#1f6f8b";

  const bodyRows = rows
    .map(
      (a, i) => `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${escapeHtml(a.title)}</td>
          <td>${escapeHtml(a.teacher_name || "-")}</td>
          <td class="c">${formatThaiDate(a.activity_date)}</td>
          <td>${a.file_name ? escapeHtml(a.file_name) : "-"}</td>
        </tr>`
    )
    .join("");

  const emptyRow = `<tr><td colspan="5" class="c empty">— ไม่มีข้อมูลในช่วงที่เลือก —</td></tr>`;
  const printedDate = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(heading)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; color: #1a1a1a; margin: 0; }
  .head { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid ${accent}; padding-bottom: 14px; }
  .head img { width: 78px; height: 78px; object-fit: contain; }
  .head .sch { font-size: 15px; color: #555; letter-spacing: .5px; }
  .head h1 { margin: 4px 0 0; font-size: 22px; color: ${accent}; }
  .meta { display: flex; justify-content: space-between; font-size: 14px; color: #444; margin: 12px 2px 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { border: 1px solid #cfcfcf; padding: 7px 9px; vertical-align: top; }
  th { background: ${accent}; color: #fff; font-weight: 600; text-align: left; }
  td.c { text-align: center; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f6f6f4; }
  .empty { color: #999; padding: 26px; }
  .sign { margin-top: 48px; display: flex; justify-content: flex-end; }
  .sign .box { text-align: center; font-size: 14px; color: #333; }
  .sign .line { margin-bottom: 6px; }
  .foot { margin-top: 10px; font-size: 12px; color: #888; text-align: right; }
  @media print { .noprint { display: none !important; } }
  .noprint { text-align:center; margin: 18px 0 4px; }
  .noprint button { font-family:'Sarabun',sans-serif; background:${accent}; color:#fff; border:none; padding:10px 22px; border-radius:6px; font-size:15px; cursor:pointer; }
</style>
</head>
<body>
  <div class="head">
    <img src="${LOGO_URL}" alt="ตราโรงเรียน" onerror="this.style.display='none'" />
    <div>
      <div class="sch">${SCHOOL_NAME}</div>
      <h1>${escapeHtml(heading)}</h1>
    </div>
  </div>

  <div class="meta">
    <span>ประเภท: ${type}</span>
    <span>จำนวนทั้งหมด: ${rows.length} รายการ</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:52px" class="c">ลำดับ</th>
        <th>ชื่อ${type}</th>
        <th style="width:200px">ครูผู้รับผิดชอบ</th>
        <th style="width:130px" class="c">วันที่จัด</th>
        <th style="width:190px">ไฟล์รายงาน</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length ? bodyRows : emptyRow}
    </tbody>
  </table>

  <div class="sign">
    <div class="box">
      <div class="line">ลงชื่อ ...............................................</div>
      <div>( ............................................... )</div>
      <div>ผู้รายงาน</div>
    </div>
  </div>

  <div class="foot">พิมพ์เมื่อ ${printedDate}</div>

  <div class="noprint">
    <button onclick="window.print()">🖨 พิมพ์ / บันทึกเป็น PDF</button>
  </div>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 500);
    });
  </script>
</body>
</html>`;
}

export default function PdfExport({ activities }: { activities: Activity[] }) {
  const [month, setMonth] = useState<string>("all");

  function handleExport(type: "กิจกรรม" | "อบรม") {
    const rows = activities
      .filter((a) => (a.activity_type || "กิจกรรม") === type)
      .filter((a) => {
        if (month === "all") return true;
        const m = parseInt(a.activity_date.slice(5, 7), 10);
        return m === parseInt(month, 10);
      })
      .sort((a, b) => a.activity_date.localeCompare(b.activity_date));

    const html = buildReportHtml(type, month, rows);
    const w = window.open("", "_blank");
    if (!w) {
      alert("กรุณาอนุญาต pop-up ของเว็บไซต์นี้ เพื่อเปิดหน้ารายงาน");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  const selectCls =
    "rounded-md border border-[var(--line)] bg-black/25 px-3.5 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] [color-scheme:dark]";

  return (
    <div className="card rounded-lg p-6">
      <h3 className="font-semibold text-[var(--text)]">ส่งออกรายงาน (PDF)</h3>
      <div className="gold-rule mb-1 mt-2" />
      <p className="mb-4 text-sm text-[var(--muted)]">
        เลือกเดือน แล้วดาวน์โหลดรายงานแยกตามประเภท (กิจกรรม / อบรม คนละไฟล์)
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            เลือกเดือน
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={selectCls}
          >
            <option value="all" style={{ backgroundColor: "#111729", color: "#e9ebf2" }}>
              ทั้งหมด (ทุกเดือน)
            </option>
            {THAI_MONTHS.map((m, i) => (
              <option
                key={m}
                value={`${i + 1}`}
                style={{ backgroundColor: "#111729", color: "#e9ebf2" }}
              >
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("กิจกรรม")}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500/90 px-5 py-2.5 text-sm font-semibold text-cyan-950 shadow-sm transition hover:bg-cyan-400"
          >
            <IconDoc className="h-4 w-4" />
            รายงานกิจกรรม
          </button>
          <button
            onClick={() => handleExport("อบรม")}
            className="btn-gold inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold shadow-sm transition hover:scale-[1.02]"
          >
            <IconDoc className="h-4 w-4" />
            รายงานการอบรม
          </button>
        </div>
      </div>
    </div>
  );
}
