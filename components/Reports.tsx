"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import type { Activity } from "@/lib/supabaseClient";

const COLORS = [
  "#6366f1",
  "#d946ef",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
];

// สีคงที่ตามประเภท: กิจกรรม = เขียว, อบรม = เหลือง
const TYPE_COLORS: Record<string, string> = {
  กิจกรรม: "#10b981",
  อบรม: "#f59e0b",
};

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl border border-white/60 p-5 shadow-lg shadow-indigo-200/40">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-xl`}
      />
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg`}
      >
        {icon}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-0.5 text-3xl font-extrabold text-indigo-950">
        {value}
      </div>
    </div>
  );
}

export default function Reports({ activities }: { activities: Activity[] }) {
  const stats = useMemo(() => {
    const totalCount = activities.length;
    const withFile = activities.filter((a) => a.file_url).length;

    const byType = new Map<string, number>();
    activities.forEach((a) => {
      const t = a.activity_type?.trim() || "กิจกรรม";
      byType.set(t, (byType.get(t) ?? 0) + 1);
    });

    const byTeacher = new Map<string, number>();
    activities.forEach((a) => {
      const name = a.teacher_name?.trim() || "ไม่ระบุครู";
      byTeacher.set(name, (byTeacher.get(name) ?? 0) + 1);
    });

    const byDate = new Map<string, number>();
    activities.forEach((a) => {
      byDate.set(a.activity_date, (byDate.get(a.activity_date) ?? 0) + 1);
    });

    // จัดเรียงให้ "กิจกรรม" มาก่อน "อบรม" เสมอ เพื่อให้สีคงที่
    const TYPE_ORDER = ["กิจกรรม", "อบรม"];
    const typeData = Array.from(byType.entries())
      .map(([name, value]) => ({ name, value }))
      .sort(
        (a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name)
      );

    const teacherData = Array.from(byTeacher.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const dateData = Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date: date.slice(5), count }));

    return { totalCount, withFile, typeData, teacherData, dateData };
  }, [activities]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="จำนวนกิจกรรมทั้งหมด"
          value={`${stats.totalCount}`}
          icon="📋"
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard
          label="ครูผู้รับผิดชอบ"
          value={`${stats.teacherData.length}`}
          icon="👩‍🏫"
          gradient="from-fuchsia-500 to-pink-500"
        />
        <StatCard
          label="กิจกรรมที่มีไฟล์แนบ"
          value={`${stats.withFile}`}
          icon="📎"
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {activities.length === 0 ? (
        <div className="glass rounded-3xl border border-white/60 py-16 text-center shadow-lg">
          <div className="mb-3 text-5xl">📊</div>
          <p className="text-slate-500">ยังไม่มีข้อมูลสำหรับสร้างรายงาน</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl border border-white/60 p-6 shadow-lg shadow-indigo-200/40">
            <h3 className="mb-4 font-bold text-indigo-950">
              สัดส่วนตามประเภท (กิจกรรม / อบรม)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label
                >
                  {stats.typeData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={TYPE_COLORS[entry.name] ?? COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} รายการ`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-3xl border border-white/60 p-6 shadow-lg shadow-indigo-200/40">
            <h3 className="mb-4 font-bold text-indigo-950">
              สัดส่วนกิจกรรมตามครูผู้รับผิดชอบ
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.teacherData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label
                >
                  {stats.teacherData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} กิจกรรม`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-3xl border border-white/60 p-6 shadow-lg shadow-indigo-200/40 lg:col-span-2">
            <h3 className="mb-4 font-bold text-indigo-950">
              จำนวนกิจกรรมรายวัน (14 วันล่าสุด)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dateData}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} กิจกรรม`, ""]} />
                <Bar
                  dataKey="count"
                  fill="url(#barFill)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
