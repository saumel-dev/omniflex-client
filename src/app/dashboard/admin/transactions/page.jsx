"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError("");
            try {
                const tokenRes = await authClient.token();
                const token    = tokenRes?.data?.token || tokenRes?.token;
                if (!token) throw new Error("Auth token missing.");

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/transactions`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load transactions.");
                setTransactions(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.price || 0), 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    const truncateId = (id) => {
        if (!id) return "—";
        return id.length > 24 ? id.slice(0, 24) + "…" : id;
    };

    // ── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
                <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse ml-auto" />
                            <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-6">
                <div className="text-center py-16 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-red-500 mb-1">Failed to load transactions</p>
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    // ── Main ──────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 text-zinc-800 dark:text-zinc-100">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Transactions</h1>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">All platform payment history</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                    {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
                </span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-col gap-4 mb-6">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-black text-[#FF6B00]">${totalRevenue.toLocaleString()}</p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Total Revenue</p>
                    </div>
                </div>

                {/* Total Transactions */}
                <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">{transactions.length}</p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Total Payments</p>
                    </div>
                </div>

                {/* Average Order Value */}
                {/* <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">
                            ${transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : "0.00"}
                        </p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Avg. per Booking</p>
                    </div>
                </div> */}
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1">No transactions yet</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">Payments will appear here once users start booking classes.</p>
                </div>
            )}

            {/* Table */}
            {transactions.length > 0 && (
                <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">User</th>
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">Class</th>
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">Amount</th>
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">Date</th>
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">Transaction ID</th>
                                    <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {transactions.map((t, idx) => (
                                    <tr
                                        key={t._id || idx}
                                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                                    >
                                        {/* User */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-black text-[#FF6B00]">
                                                        {t.userEmail?.charAt(0)?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                                                        {t.userName || "Unknown"}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[160px]">
                                                        {t.userEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Class */}
                                        <td className="px-5 py-3.5">
                                            <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                                                {t.className || "—"}
                                            </p>
                                            {t.trainerName && (
                                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                                    by {t.trainerName}
                                                </p>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                                                ${t.price?.toLocaleString() || "0"}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-[12px] text-zinc-600 dark:text-zinc-400">
                                                {formatDate(t.bookedAt)}
                                            </span>
                                        </td>

                                        {/* Transaction ID */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md"
                                                title={t.stripeSessionId}
                                            >
                                                {truncateId(t.stripeSessionId)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                {t.paymentStatus || "paid"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}