"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

export default function TrainerOverviewPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOverview = async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ Correct token extraction for Better Auth — same as all your other pages
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            if (!token) throw new Error("Could not retrieve auth token. Please log in again.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-overview`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to load overview");

            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    // ── Loading State ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-4">
                {/* Stat card skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
                {/* Profile card skeleton */}
                <div className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                {/* Class preview skeletons */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error State ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-6">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-5 text-center">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Failed to load overview</p>
                    <p className="text-xs text-red-500 dark:text-red-500 mb-3">{error}</p>
                    <button
                        onClick={fetchOverview}
                        className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { profile, stats, classesPreview } = data;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">

            {/* ── SECTION HEADER ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 pb-1">
                <span className="text-orange-500 font-bold text-lg">✦</span>
                <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                    Dashboard Overview
                </h1>
            </div>

            {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Classes */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.totalClasses}</p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Classes Created</p>
                    </div>
                </div>

                {/* Total Students */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.totalStudents}</p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Students Enrolled</p>
                    </div>
                </div>

                {/* Forum Posts */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.totalForumPosts}</p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Forum Posts</p>
                    </div>
                </div>
            </div>

            {/* ── TRAINER PROFILE CARD ───────────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar */}
                {profile.image ? (
                    <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-orange-500">
                            {profile.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Info + Quick Links */}
                <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">{profile.name}</h2>
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
                                {profile.role}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{profile.email}</p>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                        <Link
                            href="/dashboard/trainer/add-class"
                            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-center"
                        >
                            + Add Class
                        </Link>
                        <Link
                            href="/dashboard/trainer/my-classes"
                            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-center"
                        >
                            My Classes
                        </Link>
                        <Link
                            href="/dashboard/trainer/add-forum-post"
                            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-center"
                        >
                            Add Forum Post
                        </Link>
                        <Link
                            href="/dashboard/trainer/my-forums"
                            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-center"
                        >
                            My Posts
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── RECENT CLASSES PREVIEW ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500 font-bold">✦</span>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Recent Classes</h3>
                    </div>
                    <Link
                        href="/dashboard/trainer/my-classes"
                        className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                        View All ({stats.totalClasses}) →
                    </Link>
                </div>

                {classesPreview.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400">
                        No classes yet. Click &quot;Add Class&quot; above to get started!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {classesPreview.map((cls) => (
                            <div
                                key={cls._id}
                                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors"
                            >
                                {/* Left: Image + Info */}
                                <div className="flex items-center gap-3">
                                    <img
                                        src={cls.image}
                                        alt={cls.className}
                                        className="w-12 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{cls.className}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                            {cls.category} <span className="text-zinc-300 dark:text-zinc-600">•</span> {cls.difficulty}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Price + Status */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">${cls.price}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full ${
                                        cls.status === "approved"
                                            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900"
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                                    }`}>
                                        {cls.status || "pending"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
