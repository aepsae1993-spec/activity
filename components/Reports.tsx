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
import { IconLayers, IconUser, IconPaperclip } from "@/components/Icons";

// จานสีหรูบนพื้นเข้ม
const COLORS = [
  "#d4af37",
  "#8aa0c8",
  "#5fb0a5",
  "#c98a6b",
  "#a98ec9",
  "#cbb26b",
  "#7f93b8",
  "#bf7f8f",
];

const TYPE_COLORS: Record<string, string> = {
  กิจกรรม: "#22d3ee",
  อบรม: "#f59e0b",
};

const legendStyle = (v: string) => (
  <span style={{ color: "#c9cee0", fontSize: 13 }}>{v}</span>
);

const tooltipProps = {
  contentStyle: {
    background: "#111729",
    border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: 8,
    color: "#e9ebf2",
  },
  itemStyle: { color: "#e9ebf2" },
  labelStyle: { color: "#97a0b5" },
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card rounded-lg p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line-gold)] text-[var(--gold)]">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold text-[var(--text)]">
        {value}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`card rounded-lg p-6 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="font-semibold text-[var(--text)]">{title}</h3>
      <div className="gold-rule mb-4 mt-2" />
      {children}
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

    const TYPE_ORDER = ["กิจกรรม", "อบรม"];
    const typeData = Array.from(byType.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name));

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
          label="กิจกรรมทั้งหมด"
          value={`${stats.totalCount}`}
          icon={<IconLayers className="h-5 w-5" />}
        />
        <StatCard
          label="ครูผู้รับผิดชอบ"
          value={`${stats.teacherData.length}`}
          icon={<IconUser className="h-5 w-5" />}
        />
        <StatCard
          label="รายการที่มีไฟล์แนบ"
          value={`${stats.withFile}`}
          icon={<IconPaperclip className="h-5 w-5" />}
        />
      </div>

      {activities.length === 0 ? (
        <div className="card rounded-lg py-16 text-center">
          <p className="text-[var(--muted)]">ยังไม่มีข้อมูลสำหรับสร้างรายงาน</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="สัดส่วนตามประเภท (กิจกรรม / อบรม)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="#0b1020"
                  strokeWidth={2}
                >
                  {stats.typeData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={TYPE_COLORS[entry.name] ?? COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(v) => [`${v} รายการ`, ""]} />
                <Legend formatter={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="สัดส่วนตามครูผู้รับผิดชอบ">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.teacherData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="#0b1020"
                  strokeWidth={2}
                >
                  {stats.teacherData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(v) => [`${v} กิจกรรม`, ""]} />
                <Legend formatter={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="จำนวนกิจกรรมรายวัน (14 วันล่าสุด)" wide>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dateData}>
                <defs>
                  <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e7c970" />
                    <stop offset="100%" stopColor="#b8902a" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#97a0b5" }} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#97a0b5" }}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={{ fill: "rgba(212,175,55,0.08)" }}
                  formatter={(v) => [`${v} กิจกรรม`, ""]}
                />
                <Bar dataKey="count" fill="url(#goldBar)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
