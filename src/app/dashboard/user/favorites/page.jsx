"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const DIFFICULTY_STYLES = {
    Beginner:     "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    Advanced:     "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20",
};

export default function FavoriteClassesPage() {
    const [favorites, setFavorites]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState("");
    const [removingId, setRemovingId]     = useState(null); // classId being removed
    const [confirmId, setConfirmId]       = useState(null); // classId pending confirm

    // ── Fetch favorites ─────────────────────────────────────────
    const fetchFavorites = async () => {
        setLoading(true);
        setError("");
        try {
            const tokenRes = await authClient.token();
            const token    = tokenRes?.data?.token || tokenRes?.token;
            if (!token) throw new Error("Session invalid. Please re-login.");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to load favorites.");
            }
            setFavorites(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFavorites(); }, []);

    // ── Remove favorite ─────────────────────────────────────────
    const handleRemove = async (classId) => {
        setRemovingId(classId);
        setConfirmId(null);
        try {
            const tokenRes = await authClient.token();
            const token    = tokenRes?.data?.token || tokenRes?.token;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/${classId}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to remove.");
            }
            // Optimistic remove from local state
            setFavorites((prev) => prev.filter((c) => c._id.toString() !== classId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setRemovingId(null);
        }
    };

    // ── Loading ─────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    <div className="h-4 w-36 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                            <div className="w-full h-44 bg-zinc-100 dark:bg-zinc-800" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                    <div className="h-5 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="h-6 w-12 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                    <div className="h-8 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ───────────────────────────────────────────────────
    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-6">
                <div className="text-center py-16 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-red-500 mb-1">Failed to load favorites</p>
                    <p className="text-xs text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchFavorites}
                        className="text-xs px-4 py-2 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#e05e00] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Main render ─────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 text-zinc-800 dark:text-zinc-100">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Favorite Classes</h1>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Classes you've saved for quick access</p>
                    </div>
                </div>
                {favorites.length > 0 && (
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                        {favorites.length} saved
                    </span>
                )}
            </div>

            {/* Empty State */}
            {favorites.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-1">No favorites yet</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">Browse classes and hit the heart to save them here.</p>
                    <Link
                        href="/all_classes"
                        className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl hover:bg-[#e05e00] transition-colors shadow-md shadow-[#FF6B00]/20"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                        </svg>
                        Browse Classes
                    </Link>
                </div>
            )}

            {/* Favorites Grid */}
            {favorites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favorites.map((cls) => {
                        const classId      = cls._id.toString();
                        const isRemoving   = removingId === classId;
                        const isConfirming = confirmId === classId;

                        return (
                            <div
                                key={classId}
                                className="group bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative w-full h-44 overflow-hidden shrink-0">
                                    <img
                                        src={cls.image}
                                        alt={cls.className}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                                    {/* Category badge */}
                                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#FF6B00] text-white px-2.5 py-1 rounded-full shadow-md">
                                        {cls.category}
                                    </span>

                                    {/* Price badge */}
                                    <span className="absolute top-3 right-3 text-[11px] font-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-700">
                                        ${cls.price}
                                    </span>

                                    {/* Saved date — bottom of image */}
                                    {cls.savedAt && (
                                        <span className="absolute bottom-2 right-3 text-[9px] font-medium text-white/60">
                                            Saved {new Date(cls.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-[13px] font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-[#FF6B00] transition-colors mb-0.5">
                                        {cls.className}
                                    </h3>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3">
                                        by {cls.trainerName || "Trainer"}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[cls.difficulty] || DIFFICULTY_STYLES.Beginner}`}>
                                            {cls.difficulty || "Beginner"}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <circle cx="12" cy="12" r="10" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                            </svg>
                                            {cls.duration} min
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {cls.bookingCount || 0}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                        <div>
                                            <span className="text-[17px] font-black text-[#FF6B00]">${cls.price}</span>
                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">/session</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* View Details */}
                                            <Link
                                                href={`/class/${classId}`}
                                                className="py-2 px-3 text-[11px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#FF6B00]/50 hover:text-[#FF6B00] transition-all"
                                            >
                                                Details
                                            </Link>

                                            {/* Remove — inline confirm */}
                                            {isConfirming ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleRemove(classId)}
                                                        disabled={isRemoving}
                                                        className="h-8 px-2.5 text-[10px] font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isRemoving ? "..." : "Yes"}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(null)}
                                                        className="h-8 px-2.5 text-[10px] font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmId(classId)}
                                                    disabled={isRemoving}
                                                    className="h-8 px-3 text-[11px] font-bold rounded-xl border border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}