import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // ไม่ throw เพื่อให้ build ผ่านได้ แต่จะเตือนตอนรันจริงถ้ายังไม่ได้ตั้งค่า env
  console.warn(
    "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// ใช้ค่า placeholder ที่เป็น URL ถูกต้องเพื่อให้ build ผ่านได้แม้ยังไม่ตั้ง env
// (ค่าจริงจะถูกแทนที่ตอน build/run บน Vercel หรือจาก .env.local)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// ชื่อ bucket สำหรับเก็บไฟล์รายงานใน Supabase Storage
export const REPORTS_BUCKET = "reports";

export const ACTIVITY_TYPES = ["กิจกรรม", "อบรม"] as const;

// รายชื่อครูผู้รับผิดชอบ (สำหรับดรอปดาวน์)
export const TEACHERS = [
  "นายไพวัลย์ คนเพียร",
  "นางรุ้งทอง กรังพานิชย์",
  "นางสาวอรพิน โพธิ์โสภา",
  "นางสาวรัฐตนา บัวสี",
  "นายประวีณ เส็งเรียบ",
  "ว่าที่ร้อยตรีธนัตถ์ เอี่ยมนาค",
  "นางสาวจารุวรรณ คำประเสริฐ",
  "นางสาววนิดา เหมือนถนอม",
  "นายจิรายุ คำสกุล",
  "นางสาวสุภาภรณ์ ยันศิริ",
  "นางสาวสุภาภรณ์ ศรีสงคราม",
] as const;

export type Activity = {
  id: string;
  title: string;
  activity_type: string;
  teacher_name: string;
  activity_date: string; // YYYY-MM-DD
  notes: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};
