"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const DIFFICULTY_STYLES = {
    Beginner:     "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    Intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25",
    Advanced:     "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/25",
};

export default function BookedClassesPage() {
    const [bookings, setBookings] = useState([]);
    const [classDetails, setClassDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const tokenResponse = await authClient.token();
                const token = tokenResponse?.data?.token || tokenResponse?.token;
                if (!token) throw new Error("Auth token missing.");

                // 1. Fetch user's bookings
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/my-bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load bookings.");

                const bookingList = Array.isArray(data) ? data : [];
                setBookings(bookingList);

                // 2. Fetch full class details for each booking in parallel
                if (bookingList.length > 0) {
                    const classFetches = bookingList.map((b) =>
                        fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/public/${b.classId}`)
                            .then((r) => r.json())
                            .then((cls) => ({ [b.classId]: cls }))
                            .catch(() => ({ [b.classId]: null }))
                    );
                    const results = await Promise.all(classFetches);
                    const merged = Object.assign({}, ...results);
                    setClassDetails(merged);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    // ── Loading skeleton ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">
                <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex gap-4 animate-pulse">
                            <div className="w-20 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                <div className="h-3 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-2">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-5 text-center">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">

            {/* Header */}
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-orange-500 font-bold text-lg">✦</span>
                <div>
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Booked Classes</h1>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        {bookings.length} class{bookings.length !== 1 ? "es" : ""} booked
                    </p>
                </div>
            </div>

            {/* Empty state */}
            {bookings.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-1">No classes booked yet</p>
                    <p className="text-xs text-zinc-400 mb-5">Browse our classes and book your first session.</p>
                    <Link
                        href="/all_classes"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Browse Classes
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => {
                        const cls = classDetails[booking.classId];
                        const scheduleText = cls?.scheduleDays?.length
                            ? `${cls.scheduleDays.join(", ")} at ${cls.time}`
                            : cls?.time || "—";

                        return (
                            <div
                                key={booking._id || booking.stripeSessionId}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
                            >
                                {/* Class image */}
                                <div className="w-full sm:w-20 h-32 sm:h-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                                    {cls?.image ? (
                                        <img
                                            src={cls.image}
                                            alt={booking.className}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Class info */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    {/* Class name + paid badge */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                                            {booking.className}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex-shrink-0">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Paid
                                        </span>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {/* Trainer */}
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {booking.trainerName}
                                        </span>

                                        {/* Duration */}
                                        {cls?.duration && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                                                </svg>
                                                {cls.duration} min
                                            </span>
                                        )}

                                        {/* Schedule */}
                                        {cls && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                {scheduleText}
                                            </span>
                                        )}
                                    </div>

                                    {/* Difficulty + booked date */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {cls?.difficulty && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[cls.difficulty] || DIFFICULTY_STYLES.Beginner}`}>
                                                {cls.difficulty}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-zinc-400">
                                            Booked on {formatDate(booking.bookedAt)}
                                        </span>
                                        <span className="text-[10px] font-bold text-orange-500">
                                            ${booking.price}
                                        </span>
                                    </div>
                                </div>

                                {/* View Details button */}
                                <Link
                                    href={`/class/${booking.classId}`}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-orange-500 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-500 hover:text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    View Details
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}