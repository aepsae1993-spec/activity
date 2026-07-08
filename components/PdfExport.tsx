"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { TEACHERS, type Activity } from "@/lib/supabaseClient";
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
    // เดือนแบบย่อ (เช่น 23 มิ.ย. 2569) เพื่อประหยัดความกว้างคอลัมน์
    return new Date(d + "T00:00:00").toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
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
  rows: Activity[],
  qrMap: Record<string, string>,
  reporter: string,
  director: string
): string {
  const monthLabel =
    monthValue === "all"
      ? ""
      : `ประจำเดือน${THAI_MONTHS[parseInt(monthValue, 10) - 1]} `;
  const heading = `รายงาน${type} ${monthLabel}ปีการศึกษา ${ACADEMIC_YEAR}`;
  const accent = type === "อบรม" ? "#b8902a" : "#1f6f8b";

  const bodyRows = rows
    .map((a, i) => {
      const qr = qrMap[a.id];
      const fileCell = qr
        ? `<div class="qr"><img src="${qr}" alt="QR" /><span>สแกนเปิดไฟล์</span></div>`
        : '<span class="dim">-</span>';
      return `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${escapeHtml(a.title)}</td>
          <td>${escapeHtml(a.teacher_name || "-")}</td>
          <td class="c">${formatThaiDate(a.activity_date)}</td>
          <td class="c">${fileCell}</td>
        </tr>`;
    })
    .join("");

  const emptyRow = `<tr><td colspan="5" class="c empty">— ไม่มีข้อมูลในช่วงที่เลือก —</td></tr>`;
  const now = new Date();
  const printedDate = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // รูปแบบ 8/7/69 20:10 (วัน/เดือน/ปี พ.ศ. 2 หลัก + เวลา 24 ชม.)
  const printedDateTime =
    now.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    }) +
    " " +
    now.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
  /* margin:0 เพื่อไม่ให้เบราว์เซอร์เติมหัว/ท้ายกระดาษ (วันที่, ชื่อเรื่อง, about:blank, เลขหน้า) */
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; color: #1a1a1a; margin: 0; padding: 16mm 15mm 18mm; position: relative; }
  .stamp-tl { position: fixed; top: 8mm; left: 15mm; font-size: 12px; color: #888; }
  .pageno { position: absolute; right: 15mm; font-size: 12px; color: #888; }
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
  .dim { color: #aaa; }
  .qr { display: inline-flex; flex-direction: column; align-items: center; gap: 2px; }
  .qr img { width: 70px; height: 70px; }
  .qr span { font-size: 10px; color: #777; }
  /* ช่องครู: ไม่ตัดคำกลางชื่อ + ฟอนต์เล็กลงเล็กน้อยให้ชื่อยาวพอดี */
  td:nth-child(3) { word-break: keep-all; line-height: 1.35; font-size: 13px; }
  .sign { margin-top: 90px; display: flex; justify-content: space-between; gap: 24px; }
  .sign .box { text-align: center; font-size: 14px; color: #333; flex: 1; }
  .sign .line { margin-bottom: 6px; }
  .sign .role { margin-top: 2px; }
  .foot { position: fixed; bottom: 8mm; right: 15mm; font-size: 12px; color: #888; text-align: right; }
  @media print { .noprint { display: none !important; } }
  .noprint { text-align:center; margin: 18px 0 4px; }
  .noprint button { font-family:'Sarabun',sans-serif; background:${accent}; color:#fff; border:none; padding:10px 22px; border-radius:6px; font-size:15px; cursor:pointer; }
</style>
</head>
<body>
  <div class="stamp-tl">${printedDateTime}</div>
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
        <th style="width:40px" class="c">ลำดับ</th>
        <th>ชื่อ${type}</th>
        <th style="width:190px">ครูผู้รับผิดชอบ</th>
        <th style="width:82px" class="c">วันที่จัด</th>
        <th style="width:88px" class="c">ไฟล์รายงาน</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length ? bodyRows : emptyRow}
    </tbody>
  </table>

  <div class="sign">
    <div class="box">
      <div class="line">ลงชื่อ .........................................</div>
      <div>( ${
        reporter ? escapeHtml(reporter) : "........................................."
      } )</div>
      <div class="role">ผู้รายงาน</div>
    </div>
    <div class="box">
      <div class="line">ลงชื่อ .........................................</div>
      <div>( ${
        director ? escapeHtml(director) : "........................................."
      } )</div>
      <div class="role">ผู้อำนวยการโรงเรียนวัดบางขุด (อุ่นพิทยาคาร)</div>
    </div>
  </div>

  <div class="foot">พิมพ์เมื่อ ${printedDate}</div>

  <div class="noprint">
    <button onclick="window.print()">🖨 พิมพ์ / บันทึกเป็น PDF</button>
  </div>

  <script>
    window.addEventListener('load', function () {
      // คำนวณจำนวนหน้าจริง แล้วปั๊มเลขหน้า (เช่น 1/1) มุมบนขวาของทุกหน้า
      try {
        var mm = 96 / 25.4;               // px ต่อ 1 มิลลิเมตร ที่ 96dpi
        var pageH = 297 * mm;             // ความสูง A4 เต็มหน้า (margin:0)
        var total = Math.max(1, Math.ceil(document.body.scrollHeight / pageH));
        for (var i = 0; i < total; i++) {
          var el = document.createElement('div');
          el.className = 'pageno';
          el.style.top = (i * pageH + 8 * mm) + 'px';
          el.textContent = (i + 1) + '/' + total;
          document.body.appendChild(el);
        }
      } catch (e) {}
      setTimeout(function () { window.print(); }, 500);
    });
  </script>
</body>
</html>`;
}

export default function PdfExport({ activities }: { activities: Activity[] }) {
  const [month, setMonth] = useState<string>("all");
  const [reporter, setReporter] = useState<string>("");
  const [director, setDirector] = useState<string>("นายณรงค์ เนตรลา");
  const [busy, setBusy] = useState<string | null>(null);

  async function handleExport(type: "กิจกรรม" | "อบรม") {
    const rows = activities
      .filter((a) => (a.activity_type || "กิจกรรม") === type)
      .filter((a) => {
        if (month === "all") return true;
        const m = parseInt(a.activity_date.slice(5, 7), 10);
        return m === parseInt(month, 10);
      })
      .sort((a, b) => a.activity_date.localeCompare(b.activity_date));

    setBusy(type);
    // สร้าง QR code (data URL) สำหรับลิงก์ไฟล์รายงานของแต่ละรายการ
    const qrMap: Record<string, string> = {};
    await Promise.all(
      rows
        .filter((a) => a.file_url)
        .map(async (a) => {
          try {
            qrMap[a.id] = await QRCode.toDataURL(a.file_url as string, {
              margin: 1,
              width: 140,
            });
          } catch {
            /* ข้ามถ้าสร้าง QR ไม่สำเร็จ */
          }
        })
    );
    setBusy(null);

    const html = buildReportHtml(type, month, rows, qrMap, reporter, director);
    const w = window.open("", "_blank");
    if (!w) {
      alert("กรุณาอนุญาต pop-up ของเว็บไซต์นี้ เพื่อเปิดหน้ารายงาน");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  const fieldCls =
    "w-full rounded-md border border-[var(--line)] bg-black/25 px-3.5 py-2.5 text-[var(--text)] outline-none transition placeholder:text-slate-500 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] [color-scheme:dark]";
  const labelCls =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";
  const optStyle = { backgroundColor: "#111729", color: "#e9ebf2" };

  return (
    <div className="card rounded-lg p-6">
      <h3 className="font-semibold text-[var(--text)]">ส่งออกรายงาน (PDF)</h3>
      <div className="gold-rule mb-1 mt-2" />
      <p className="mb-4 text-sm text-[var(--muted)]">
        เลือกเดือน + ผู้ลงนาม แล้วดาวน์โหลดรายงานแยกตามประเภท (กิจกรรม / อบรม คนละไฟล์)
      </p>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>เลือกเดือน</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={fieldCls}
          >
            <option value="all" style={optStyle}>
              ทั้งหมด (ทุกเดือน)
            </option>
            {THAI_MONTHS.map((m, i) => (
              <option key={m} value={`${i + 1}`} style={optStyle}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>ผู้รายงาน (ลงนามซ้าย)</label>
          <select
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
            className={fieldCls}
          >
            <option value="" style={optStyle}>
              — เว้นว่างให้เซ็นเอง —
            </option>
            {TEACHERS.map((name) => (
              <option key={name} value={name} style={optStyle}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>ผอ. (ลงนามขวา)</label>
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            placeholder="เว้นว่างให้เซ็นเอง"
            className={fieldCls}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("กิจกรรม")}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500/90 px-5 py-2.5 text-sm font-semibold text-cyan-950 shadow-sm transition hover:bg-cyan-400 disabled:opacity-60"
          >
            <IconDoc className="h-4 w-4" />
            {busy === "กิจกรรม" ? "กำลังสร้าง..." : "รายงานกิจกรรม"}
          </button>
          <button
            onClick={() => handleExport("อบรม")}
            disabled={busy !== null}
            className="btn-gold inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold shadow-sm transition hover:scale-[1.02] disabled:opacity-60"
          >
            <IconDoc className="h-4 w-4" />
            {busy === "อบรม" ? "กำลังสร้าง..." : "รายงานการอบรม"}
          </button>
        </div>
      </div>
  );
}
