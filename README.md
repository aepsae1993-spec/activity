# 📋 ระบบรายงานกิจกรรม (Activity Report)

เว็บแอพสำหรับ **บันทึกกิจกรรม** และดู **รายงาน/สรุป/กราฟ** แบบรายวันและรายประเภท
ไม่มีระบบล็อกอิน — ใครเข้าก็บันทึกได้

**Stack:** Next.js 15 (App Router) · Tailwind CSS · Supabase (PostgreSQL) · Recharts · Deploy บน Vercel

---

## ฟีเจอร์
- บันทึกกิจกรรม: ชื่อกิจกรรม, **ชื่อครูผู้รับผิดชอบ**, วันที่, หมายเหตุ, **แนบไฟล์รายงาน**
- ไฟล์รายงานเก็บใน Supabase Storage (bucket `reports`) เปิดดู/ดาวน์โหลดได้
  - แยกเก็บเป็น 2 โฟลเดอร์ตามประเภท: `activity/` (กิจกรรม) และ `training/` (อบรม)
- ดูรายการกิจกรรมล่าสุดแบบการ์ดสีสดใส + ลบได้
- หน้ารายงาน: การ์ดสรุป, กราฟวงกลมตามครูผู้รับผิดชอบ, กราฟแท่งจำนวนกิจกรรมรายวัน
- **ส่งออก PDF**: เลือกเดือน (หรือทั้งหมด) แล้วดาวน์โหลดรายงานแยกไฟล์ตามประเภท (กิจกรรม / อบรม) พร้อมหัวกระดาษ + โลโก้โรงเรียน
- ดีไซน์หรูหรา ทันสมัย โทนไล่สี (glassmorphism)

---

## 1) ติดตั้งและรันบนเครื่อง (Local)

```bash
npm install
```

คัดลอกไฟล์ env แล้วใส่ค่าจาก Supabase:

```bash
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # Mac/Linux
```

จากนั้นรัน:

```bash
npm run dev
```

เปิด http://localhost:3000

---

## 2) ตั้งค่า Supabase (เก็บข้อมูล)

1. สมัคร/เข้า https://supabase.com แล้วสร้าง **New Project**
2. ไปที่เมนู **SQL Editor → New query** วางเนื้อหาจากไฟล์ [`supabase/schema.sql`](supabase/schema.sql) แล้วกด **Run**
   (สคริปต์นี้สร้างทั้งตาราง `activities` และ Storage bucket `reports` สำหรับเก็บไฟล์รายงานให้อัตโนมัติ)
3. ไปที่ **Project Settings → API** คัดลอก 2 ค่า:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. นำ 2 ค่านี้ไปใส่ใน `.env.local` (สำหรับ local) และใน Vercel (สำหรับ production)

---

## 3) ขึ้น GitHub

```bash
git init
git add .
git commit -m "initial: activity report app"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

---

## 4) Deploy บน Vercel

1. เข้า https://vercel.com → **Add New → Project** → เลือก repo จาก GitHub
2. Framework Preset จะถูกตรวจเป็น **Next.js** อัตโนมัติ
3. ในขั้นตอน **Environment Variables** ใส่:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | (Project URL จาก Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key จาก Supabase) |
   | `NEXT_PUBLIC_DELETE_PASSWORD` | รหัสผ่านสำหรับยืนยันการลบกิจกรรม (ไม่ตั้งจะใช้ `admin1234`) |
4. กด **Deploy** — เสร็จแล้วจะได้ URL ใช้งานจริง

> ทุกครั้งที่ `git push` ขึ้น branch `main` Vercel จะ deploy ใหม่ให้อัตโนมัติ

---

## โครงสร้างโปรเจกต์

```
app/
  layout.tsx        ฟอนต์ไทย + โครงหน้า
  page.tsx          หน้าหลัก (แท็บ บันทึก / รายงาน)
  globals.css
components/
  ActivityForm.tsx  ฟอร์มบันทึกกิจกรรม
  ActivityList.tsx  ตารางรายการ + ปุ่มลบ
  Reports.tsx       การ์ดสรุป + กราฟ
lib/
  supabaseClient.ts client ของ Supabase + types
supabase/
  schema.sql        สคริปต์สร้างตาราง
```

---

## หมายเหตุด้านความปลอดภัย
แอพนี้เปิดให้ทุกคนอ่าน/เขียนข้อมูลได้ (ไม่มีล็อกอิน) เหมาะกับการใช้ภายในหรือทดลอง
หากต้องการจำกัดสิทธิ์ ควรเพิ่ม **Supabase Auth** และปรับ RLS policy ใน `schema.sql` ภายหลัง
