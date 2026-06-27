"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";

export default function ManageTrainersPage() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null); // track which trainer is pending confirmation

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/trainers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load trainers.");
            setTrainers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrainers(); }, []);

    const handleDemote = async (trainerId) => {
        setProcessingId(trainerId);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/trainers/${trainerId}/demote`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Demotion failed.");

            toast.success("Trainer demoted to user.");
            setConfirmId(null);
            fetchTrainers();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-3">
                <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-none">
                            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                <div className="h-2.5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            </div>
                            <div className="h-7 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-lg">✦</span>
                    <div>
                        <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Manage Trainers</h1>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{trainers.length} active trainer{trainers.length !== 1 ? "s" : ""} on the platform</p>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {trainers.length === 0 ? (
                <div className="text-center py-16 text-xs text-zinc-400">
                    No trainers found on the platform yet.
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Trainer</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Action</p>
                    </div>

                    {/* Trainer Rows */}
                    {trainers.map((trainer) => (
                        <div
                            key={trainer._id}
                            className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-none hover:bg-zinc-50/60 dark:hover:bg-zinc-950/40 transition-colors"
                        >
                            {/* Trainer Info */}
                            <div className="flex items-center gap-3 min-w-0">
                                {trainer.image ? (
                                    <img
                                        src={trainer.image}
                                        alt={trainer.name}
                                        className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-orange-500">
                                            {trainer.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{trainer.name}</span>
                            </div>

                            {/* Email */}
                            <p className="text-xs text-zinc-400 truncate">{trainer.email}</p>

                            {/* Action */}
                            <div className="flex items-center gap-2">
                                {confirmId === trainer._id ? (
                                    // Confirmation state — two small buttons
                                    <>
                                        <button
                                            onClick={() => handleDemote(trainer._id)}
                                            disabled={processingId === trainer._id}
                                            className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {processingId === trainer._id ? "..." : "Confirm"}
                                        </button>
                                        <button
                                            onClick={() => setConfirmId(null)}
                                            disabled={processingId === trainer._id}
                                            className="px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setConfirmId(trainer._id)}
                                        className="px-3 py-1.5 text-[11px] font-bold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Demote to User
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}