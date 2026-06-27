"use client";

import { useState, useEffect, useMemo } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function ManageClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [processingId, setProcessingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/classes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load classes.");
            setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    const getToken = async () => {
        const tokenResponse = await authClient.token();
        return tokenResponse?.data?.token || tokenResponse?.token;
    };

    const handleApprove = async (classId) => {
        setProcessingId(classId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/classes/${classId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "approved" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Approval failed.");
            toast.success("Class approved successfully.");
            fetchClasses();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (classId) => {
        setProcessingId(classId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/classes/${classId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "rejected" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Rejection failed.");
            toast.success("Class rejected.");
            fetchClasses();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (classId) => {
        setProcessingId(classId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/classes/${classId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Deletion failed.");
            toast.success("Class deleted.");
            setConfirmDelete(null);
            fetchClasses();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredClasses = useMemo(() => {
        if (activeFilter === "All") return classes;
        return classes.filter((c) => c.status === activeFilter.toLowerCase());
    }, [classes, activeFilter]);

    // Count per tab
    const counts = useMemo(() => ({
        All: classes.length,
        Pending: classes.filter((c) => c.status === "pending").length,
        Approved: classes.filter((c) => c.status === "approved").length,
        Rejected: classes.filter((c) => c.status === "rejected").length,
    }), [classes]);

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-4">
                <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />)}
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-none">
                            <div className="w-16 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                <div className="h-2.5 w-28 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                                <div className="h-7 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                                <div className="h-7 w-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
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
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Manage Classes</h1>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{classes.length} total class{classes.length !== 1 ? "es" : ""} submitted by trainers</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${activeFilter === filter
                                ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-orange-300 dark:hover:border-orange-800"
                            }`}
                    >
                        {filter}
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeFilter === filter
                                ? "bg-white/20 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                            }`}>
                            {counts[filter]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Classes List */}
            {filteredClasses.length === 0 ? (
                <div className="text-center py-16 text-xs text-zinc-400">
                    No {activeFilter.toLowerCase() === "all" ? "" : activeFilter.toLowerCase()} classes found.
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {filteredClasses.map((cls, index) => (
                        <div
                            key={cls._id}
                            className={`flex items-center gap-4 px-4 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-950/40 transition-colors ${index !== filteredClasses.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
                                }`}
                        >
                            {/* Class Image */}
                            <img
                                src={cls.image}
                                alt={cls.className}
                                className="w-16 h-11 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                            />

                            {/* Class Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{cls.className}</p>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                    {cls.trainerName} · {cls.category}
                                </p>
                            </div>

                            {/* Right: Status + Price + Actions */}
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${cls.status === "approved"
                                        ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50"
                                        : cls.status === "rejected"
                                            ? "bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50"
                                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                                    }`}>
                                    {cls.status || "pending"}
                                </span>

                                {/* Price */}
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 w-12 text-right">
                                    ${cls.price}
                                </span>

                                {/* Approve Button — show if not already approved */}
                                {cls.status !== "approved" && (
                                    <button
                                        onClick={() => handleApprove(cls._id)}
                                        disabled={processingId === cls._id}
                                        className="px-2.5 py-1.5 text-[11px] font-bold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === cls._id ? "..." : "Approve"}
                                    </button>
                                )}

                                {/* Reject Button — show if not already rejected */}
                                {cls.status !== "rejected" && (
                                    <button
                                        onClick={() => handleReject(cls._id)}
                                        disabled={processingId === cls._id}
                                        className="px-2.5 py-1.5 text-[11px] font-bold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === cls._id ? "..." : "Reject"}
                                    </button>
                                )}

                                {/* Delete Button with inline confirm */}
                                {confirmDelete === cls._id ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDelete(cls._id)}
                                            disabled={processingId === cls._id}
                                            className="px-2 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {processingId === cls._id ? "..." : "Yes"}
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(null)}
                                            className="px-2 py-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(cls._id)}
                                        disabled={processingId === cls._id}
                                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                                        title="Delete class"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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