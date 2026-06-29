"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ── Colour palette ────────────────────────────────────────────────────────────
const PRIMARY = "#FF6B00";
const BAR_COLOURS = ["#FF6B00", "#FF8C38", "#FFB37A", "#FFCFA5", "#FF5200", "#FFA060", "#FF7A20"];
const PIE_COLOURS = { admin: "#FF6B00", trainer: "#3B82F6", user: "#10B981" };

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
    <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center flex-shrink-0 text-xl">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 leading-none">{value ?? "—"}</p>
      <p className="text-xs font-semibold text-zinc-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Custom tooltip for bar chart
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-zinc-700 dark:text-zinc-200">{label}</p>
      <p className="text-[#FF6B00] font-semibold">{payload[0].value} classes</p>
    </div>
  );
};

// Custom tooltip for pie chart
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold capitalize" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">{payload[0].value} users ({payload[0].payload.percent}%)</p>
    </div>
  );
};

// Custom pie label - Modified to display raw count instead of percentage
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold" fontSize={11} fontWeight={700}>
      {value}
    </text>
  );
};

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);

  const getToken = async () => {
    const tokenResponse = await authClient.token();
    const token = tokenResponse?.data?.token || tokenResponse?.token;
    if (!token) throw new Error("Auth token missing.");
    return token;
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const base = process.env.NEXT_PUBLIC_SERVER_URL;

        // Fetch all three data sources in parallel
        const [usersRes, classesRes, txRes] = await Promise.all([
          fetch(`${base}/api/admin/users`, { headers }),
          fetch(`${base}/api/admin/classes`, { headers }),
          fetch(`${base}/api/admin/transactions`, { headers }),
        ]);

        const [users, classes, transactions] = await Promise.all([
          usersRes.json(),
          classesRes.json(),
          txRes.json(),
        ]);

        if (!usersRes.ok) throw new Error(users.error || "Failed to load users.");
        if (!classesRes.ok) throw new Error(classes.error || "Failed to load classes.");
        if (!txRes.ok) throw new Error(transactions.error || "Failed to load transactions.");

        // ── Derive stats ──────────────────────────────────────────────
        const approvedClasses = classes.filter((c) => c.status === "approved");

        // Classes by category (approved only for the chart)
        const categoryMap = {};
        approvedClasses.forEach((c) => {
          const cat = c.category || "Other";
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const categoryData = Object.entries(categoryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        // Role distribution
        const roleCounts = { admin: 0, trainer: 0, user: 0 };
        users.forEach((u) => {
          const r = u.role?.toLowerCase();
          if (r in roleCounts) roleCounts[r]++;
          else roleCounts.user++;
        });
        const total = users.length || 1;
        const roleData = Object.entries(roleCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          percent: ((value / total) * 100).toFixed(1),
          fill: PIE_COLOURS[name],
        }));

        // Find the logged-in admin profile
        const session = await authClient.getSession();
        const sessionEmail = session?.data?.user?.email;
        const profile = users.find((u) => u.email === sessionEmail) || null;

        setAdminProfile(profile || session?.data?.user || null);
        setOverview({
          totalUsers: users.length,
          approvedClasses: approvedClasses.length,
          transactions: transactions.length,
          categoryData,
          roleData,
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-5 animate-pulse">
        <div className="h-6 w-40 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />)}
        </div>
        <div className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <span className="text-[#FF6B00] font-bold text-lg">✦</span>
        <div>
          <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Admin Overview</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">Platform health at a glance</p>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="👥" label="Total Users" value={overview.totalUsers} />
        <StatCard icon="✅" label="Approved Classes" value={overview.approvedClasses} />
        <StatCard icon="💳" label="Transactions" value={overview.transactions} />
      </div>

      {/* ── Admin Profile Card ──────────────────────────────────────────────── */}
      {adminProfile && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="relative flex-shrink-0">
            {adminProfile.image ? (
              <img
                src={adminProfile.image}
                alt={adminProfile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#FF6B00]/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 border-2 border-[#FF6B00]/30 flex items-center justify-center">
                <span className="text-xl font-black text-[#FF6B00]">
                  {adminProfile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-zinc-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{adminProfile.name}</p>
            <p className="text-[11px] text-zinc-400 truncate">{adminProfile.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FF6B00] border border-orange-200 dark:border-orange-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                Administrator
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                Active
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Platform Control</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Full access</p>
          </div>
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart — Classes by Category */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Classes by Category</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Approved classes only</p>
          </div>

          {overview.categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-xs text-zinc-400">
              No approved classes yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.categoryData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,107,0,0.06)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {overview.categoryData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOURS[i % BAR_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — User Role Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">User Role Distribution</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{overview.totalUsers} total users</p>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={overview.roleData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
              >
                {overview.roleData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {value} — {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}