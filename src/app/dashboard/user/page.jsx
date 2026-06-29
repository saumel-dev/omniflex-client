"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

export default function UserOverviewPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ bookedClasses: 0, favorites: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const tokenResponse = await authClient.token();
        const token = tokenResponse?.data?.token || tokenResponse?.token;
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [sessionRes, bookingsRes, favRes, appRes] = await Promise.all([
          authClient.getSession(),
          fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/my-bookings`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-application/status`, { headers }),
        ]);

        const sessionData = sessionRes?.data;
        setUser(sessionData?.user || null);

        const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
        setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 3) : []);
        setStats((prev) => ({ ...prev, bookedClasses: Array.isArray(bookings) ? bookings.length : 0 }));

        const favs = favRes.ok ? await favRes.json() : [];
        setStats((prev) => ({ ...prev, favorites: Array.isArray(favs) ? favs.length : 0 }));

        if (appRes.ok) {
          const appData = await appRes.json();
          setApplication(appData.application || null);
        }
      } catch (err) {
        console.error("Overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  // ── FIX 1: Added "approved" to the status config ─────────────
  const applicationStatusConfig = {
    pending: {
      label: "Under Review",
      classes: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Your application is being reviewed by our team.",
    },
    approved: {
      label: "Approved",
      classes: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Congratulations! You are now a trainer.",
    },
    rejected: {
      label: "Not Approved",
      classes: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      description: "Unfortunately your application was not approved this time.",
    },
  };

  const statusCfg = applicationStatusConfig[application?.status];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">

      {/* Page Header */}
      <div className="flex items-center gap-2 pb-1">
        <span className="text-orange-500 font-bold text-lg">✦</span>
        <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.bookedClasses}</p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Booked Classes</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.favorites}</p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Favorites</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 capitalize">{user?.role || "User"}</p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Your Role</p>
          </div>
        </div>
      </div>

      {/* Profile + Application */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Profile Card — unchanged */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Your Profile</p>
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-orange-500">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 uppercase tracking-wide">
                {user?.role || "user"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link href="/dashboard/user/booked-classes" className="px-3 py-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-center">
              My Bookings
            </Link>
            <Link href="/dashboard/user/favorites" className="px-3 py-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-center">
              My Favorites
            </Link>
            <Link href="/dashboard/user/apply-trainer" className="col-span-2 px-3 py-2 text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-center">
              Apply as Trainer
            </Link>
          </div>
        </div>

        {/* ── FIX 1: Trainer Application Card — fully rebuilt ── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Trainer Application</p>

          {!application ? (
            <div className="flex flex-col items-center justify-center h-28 text-center">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">No application submitted</p>
              <p className="text-[11px] text-zinc-400 mb-3">Want to become a trainer?</p>
              <Link href="/dashboard/user/apply-trainer" className="text-[11px] font-bold text-orange-500 hover:underline">
                Apply Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status banner */}
              <div className={`flex items-start gap-2.5 px-3 py-3 rounded-xl border ${statusCfg?.classes || "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"}`}>
                <span className="mt-0.5">{statusCfg?.icon}</span>
                <div>
                  <p className="text-xs font-bold leading-tight">{statusCfg?.label || application.status}</p>
                  <p className="text-[11px] mt-0.5 opacity-80">{statusCfg?.description}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wide">Specialty</p>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{application.specialty}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wide">Experience</p>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{application.experience} yrs</p>
                </div>
              </div>

              {/* Admin feedback — only shown when rejected */}
              {application.status === "rejected" && application.adminFeedback && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wide">Admin Feedback</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{application.adminFeedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Recent Bookings</p>
          <Link href="/dashboard/user/booked-classes" className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors">
            View All →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-400">No bookings yet.</p>
            <Link href="/all_classes" className="text-[11px] font-bold text-orange-500 hover:underline mt-1 inline-block">
              Browse Classes →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking._id || booking.stripeSessionId}
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-orange-200 dark:hover:border-orange-900/40 transition-colors group"
              >
                {/* Image thumbnail */}
                <div className="w-full sm:w-16 h-28 sm:h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                  {booking.image ? (
                    <img
                      src={booking.image}
                      alt={booking.className}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                      <span className="text-orange-500 font-black text-base">
                        {booking.className?.charAt(0) || "C"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Name + Paid badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                      {booking.className}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex-shrink-0">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Paid
                    </span>
                  </div>

                  {/* Trainer + price meta */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {booking.trainerName}
                    </span>
                    {booking.bookedAt && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.bookedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* Category badge + price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {booking.category && (
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-[#FF6B00]/10 text-[#FF6B00] px-1.5 py-0.5 rounded-full">
                        {booking.category}
                      </span>
                    )}
                    <span className="text-[11px] font-black text-orange-500">${booking.price}</span>
                    <span className="text-[10px] text-zinc-400">/session</span>
                  </div>
                </div>

                {/* View Details */}
                <Link
                  href={`/class/${booking.classId}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-orange-500 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-500 hover:text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}