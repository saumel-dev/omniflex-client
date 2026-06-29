"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const DIFFICULTY_STYLES = {
    Beginner:     "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    Intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25",
    Advanced:     "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/25",
};

export default function ClassDetailsPage() {
    const { id }   = useParams();
    const router   = useRouter();

    const [cls, setCls]               = useState(null);
    const [related, setRelated]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");

    // Favorite state
    const [isFavorited, setIsFavorited]   = useState(false);
    const [favLoading, setFavLoading]     = useState(false);

    // ✅ Booking state
    const [isBooked, setIsBooked]         = useState(false);
    const [bookingCheckDone, setBookingCheckDone] = useState(false);

    // Session
    const [session, setSession] = useState(null);

    // ── 1. Get session ──────────────────────────────────────────
    useEffect(() => {
        authClient.getSession().then((s) => setSession(s?.data || null));
    }, []);

    // ── 2. Fetch class + related ────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const [clsRes, relRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/public/${id}`),
                    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/public/${id}/related`),
                ]);
                if (!clsRes.ok) {
                    const d = await clsRes.json();
                    throw new Error(d.error || "Class not found.");
                }
                const [clsData, relData] = await Promise.all([clsRes.json(), relRes.json()]);
                setCls(clsData);
                setRelated(Array.isArray(relData) ? relData : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // ── 3. Check favorite + booking status once session is ready ─
    useEffect(() => {
        if (!session?.user || !id) return;

        const checkStatuses = async () => {
            try {
                const tokenRes = await authClient.token();
                const token    = tokenRes?.data?.token || tokenRes?.token;
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };

                // Run both checks in parallel
                const [favRes, bookingRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/check/${id}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/bookings/check/${id}`, { headers }),
                ]);

                if (favRes.ok) {
                    const d = await favRes.json();
                    setIsFavorited(d.isFavorited);
                }

                if (bookingRes.ok) {
                    const d = await bookingRes.json();
                    setIsBooked(d.isBooked);
                }
            } catch {
                // silently fail
            } finally {
                setBookingCheckDone(true);
            }
        };

        checkStatuses();
    }, [session, id]);

    // ── 4. Toggle favorite ──────────────────────────────────────
    const handleFavorite = async () => {
        if (!session?.user) { router.push("/login"); return; }
        setFavLoading(true);
        try {
            const tokenRes = await authClient.token();
            const token    = tokenRes?.data?.token || tokenRes?.token;
            if (isFavorited) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/${id}`, {
                    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setIsFavorited(false);
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ classId: id }),
                });
                if (res.ok) setIsFavorited(true);
                else { const d = await res.json(); alert(d.error || "Failed to add favorite."); }
            }
        } catch { alert("Something went wrong."); }
        finally { setFavLoading(false); }
    };

    // ── Loading ─────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-[#090D16]">
                <div className="w-full h-72 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                        <div className="h-56 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                    </div>
                    <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !cls) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-[#090D16] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">{error || "Class not found"}</p>
                    <button onClick={() => router.back()} className="mt-4 text-xs px-4 py-2 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#e05e00] transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const scheduleText = cls.scheduleDays?.length
        ? `${cls.scheduleDays.join(", ")} at ${cls.time}`
        : cls.time || "Schedule TBD";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#090D16]">

            {/* ── Hero Banner ── */}
            <div className="relative w-full h-72 md:h-80 overflow-hidden">
                <img src={cls.image} alt={cls.className} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 flex items-center gap-1.5 h-8 px-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6B00] text-white px-2.5 py-1 rounded-full">{cls.category}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLES[cls.difficulty] || DIFFICULTY_STYLES.Beginner}`}>{cls.difficulty}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">{cls.className}</h1>
                    <p className="text-sm text-white/70 mt-1">by {cls.trainerName}</p>
                </div>
                <div className="absolute top-4 right-4 text-right">
                    <span className="text-2xl font-black text-[#FF6B00] drop-shadow-lg">${cls.price}</span>
                    <p className="text-[10px] text-white/60 mt-0.5">per session</p>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">About This Class</h2>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{cls.description}</p>
                    </div>

                    <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Class Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: "Duration", value: `${cls.duration} min`, icon: <><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></> },
                                { label: "Schedule", value: scheduleText, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/> },
                                { label: "Enrolled", value: `${cls.bookingCount || 0} students`, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/> },
                                { label: "Category", value: cls.category, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z"/> },
                                { label: "Trainer", value: cls.trainerName, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/> },
                            ].map(({ label, value, icon }) => (
                                <div key={label} className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icon}</svg>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-white">{value}</p>
                                </div>
                            ))}
                            {/* Difficulty separate for badge render */}
                            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Difficulty</span>
                                </div>
                                <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[cls.difficulty] || DIFFICULTY_STYLES.Beginner}`}>{cls.difficulty}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                            <div className="mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-3xl font-black text-[#FF6B00]">${cls.price}</span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1.5">per session</span>
                            </div>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span className="font-semibold">{cls.bookingCount || 0} booked</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                                    </svg>
                                    <span className="font-semibold">{cls.duration} min</span>
                                </div>
                            </div>

                            {/* ✅ Book Now / Already Booked — role-aware */}
                            {(() => {
                                const role = session?.user?.role;
                                const isAdminOrTrainer = role === "admin" || role === "trainer";

                                if (isAdminOrTrainer) {
                                    return (
                                        <div className="w-full flex items-center justify-center gap-2 h-11 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 text-sm font-bold rounded-xl mb-3 cursor-not-allowed">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                            </svg>
                                            Not Available for {role === "admin" ? "Admins" : "Trainers"}
                                        </div>
                                    );
                                }

                                if (isBooked) {
                                    return (
                                        <div className="w-full flex items-center justify-center gap-2 h-11 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-bold rounded-xl mb-3 cursor-default">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                            </svg>
                                            Already Booked
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        href={session?.user ? `/payment/${cls._id}` : "/login"}
                                        className="w-full flex items-center justify-center gap-2 h-11 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#FF6B00]/25 mb-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                        </svg>
                                        {bookingCheckDone ? `Book Now — $${cls.price}` : "Loading..."}
                                    </Link>
                                );
                            })()}

                            {/* Add to Favorites */}
                            <button
                                onClick={handleFavorite}
                                disabled={favLoading}
                                className={`w-full flex items-center justify-center gap-2 h-10 text-sm font-bold rounded-xl border transition-all disabled:opacity-50 ${
                                    isFavorited
                                        ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#FF6B00]/50 hover:text-[#FF6B00]"
                                }`}
                            >
                                <svg className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                                {favLoading ? "Saving..." : isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">Schedule</span>
                            </div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">{scheduleText}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Classes */}
            {related.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 pb-14">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                            More <span className="text-[#FF6B00]">{cls.category}</span> Classes
                        </h2>
                        <Link href="/all_classes" className="flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline">
                            View all
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {related.map((r) => (
                            <Link key={r._id} href={`/class/${r._id}`} className="group flex items-center gap-3 bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 hover:border-[#FF6B00]/40 hover:shadow-md transition-all">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <img src={r.image} alt={r.className} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    <span className="absolute top-1 left-1 text-[8px] font-bold bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full">{r.category}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#FF6B00] transition-colors">{r.className}</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{r.duration} min · {r.difficulty}</p>
                                    <p className="text-[12px] font-black text-[#FF6B00] mt-1">${r.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}