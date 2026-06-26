"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/app/lib/auth-client";

// ── Badge style maps ──────────────────────────────────────────────
const ROLE_STYLES = {
    admin:   "bg-violet-500/10 text-violet-500 border border-violet-500/25",
    trainer: "bg-sky-500/10 text-sky-500 border border-sky-500/25",
    user:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
};

const STATUS_STYLES = {
    active:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    blocked: "bg-red-500/10 text-red-500 border border-red-500/25",
};

const ACTION_META = {
    block:      { label: "Block User",       desc: "This user will be soft-blocked. They can still browse but cannot make any changes on the platform.", confirmColor: "bg-red-600 hover:bg-red-700" },
    unblock:    { label: "Unblock User",     desc: "This user will be fully restored to active status with all privileges.", confirmColor: "bg-emerald-600 hover:bg-emerald-700" },
    "make-admin": { label: "Promote to Admin", desc: "This user will be granted full Admin privileges. This action can only be undone by another Admin.", confirmColor: "bg-[#FF6B00] hover:bg-[#e05e00]" },
};

export default function ManageUsersPage() {
    const [users, setUsers]                   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState("");
    const [search, setSearch]                 = useState("");
    const [actionLoading, setActionLoading]   = useState(null); // userId being actioned
    const [selfEmail, setSelfEmail]           = useState("");

    // Confirmation modal
    const [modal, setModal] = useState({
        open: false, userId: null, userName: "", action: null,
    });

    // ── 1. Get current admin's email to identify self in table ────
    useEffect(() => {
        authClient.getSession().then((s) => {
            setSelfEmail(s?.data?.user?.email || "");
        });
    }, []);

    // ── 2. Fetch users (debounced on search) ──────────────────────
    const fetchUsers = useCallback(async (q = "") => {
        setLoading(true);
        setError("");
        try {
            const tokenRes = await authClient.token();
            const token    = tokenRes?.data?.token || tokenRes?.token;
            if (!token) throw new Error("Session invalid. Please re-login.");

            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to load users.");
            }
            setUsers(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(search), 400);
        return () => clearTimeout(timer);
    }, [search, fetchUsers]);

    // ── 3. Open confirmation modal ────────────────────────────────
    const openModal = (user, action) =>
        setModal({ open: true, userId: user._id, userName: user.name || "this user", action });

    const closeModal = () =>
        setModal({ open: false, userId: null, userName: "", action: null });

    // ── 4. Execute confirmed action ───────────────────────────────
    const executeAction = async () => {
        const { userId, action } = modal;
        closeModal();
        setActionLoading(userId);

        try {
            const tokenRes = await authClient.token();
            const token    = tokenRes?.data?.token || tokenRes?.token;

            const base = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/users/${userId}`;
            let url, body;

            if (action === "block")        { url = `${base}/status`;     body = { status: "blocked" }; }
            else if (action === "unblock") { url = `${base}/status`;     body = { status: "active" };  }
            else                           { url = `${base}/make-admin`; body = {};                    }

            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Action failed.");
            }

            // Optimistic local update — no full re-fetch needed
            setUsers((prev) =>
                prev.map((u) => {
                    if (u._id !== userId) return u;
                    if (action === "block")        return { ...u, status: "blocked" };
                    if (action === "unblock")      return { ...u, status: "active" };
                    if (action === "make-admin")   return { ...u, role: "admin" };
                    return u;
                })
            );
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Manage Users</h1>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Block, unblock, or promote platform members</p>
                    </div>
                </div>
                {!loading && (
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                        {users.length} {users.length === 1 ? "user" : "users"}
                    </span>
                )}
            </div>

            {/* ── Search Bar ── */}
            <div className="relative mb-5">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-[3px] border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="text-center py-12 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-red-500 mb-1">Failed to load users</p>
                    <p className="text-xs text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => fetchUsers(search)}
                        className="text-xs px-4 py-2 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#e05e00] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Table ── */}
            {!loading && !error && (
                <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {users.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No users found</p>
                            {search && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">No results for "{search}"</p>}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                                        <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-5 py-3.5 w-[42%]">User</th>
                                        <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-4 py-3.5">Role</th>
                                        <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-4 py-3.5">Status</th>
                                        <th className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-4 py-3.5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {users.map((user) => {
                                        const isSelf      = user.email === selfEmail;
                                        const isBlocked   = user.status === "blocked";
                                        const isAdmin     = user.role === "admin";
                                        const isActioning = actionLoading === user._id;
                                        const initials    = (user.name || "?").charAt(0).toUpperCase();

                                        return (
                                            <tr key={user._id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">

                                                {/* USER */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 border border-[#FF6B00]/20 flex items-center justify-center shrink-0">
                                                                <span className="text-[#FF6B00] font-bold text-sm">{initials}</span>
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[13px] font-semibold text-zinc-900 dark:text-white truncate">
                                                                    {user.name || "Unnamed User"}
                                                                </span>
                                                                {isSelf && (
                                                                    <span className="text-[9px] font-bold tracking-wider uppercase bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-1.5 py-0.5 rounded-full shrink-0">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ROLE */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ROLE_STYLES[user.role] || ROLE_STYLES.user}`}>
                                                        {user.role || "user"}
                                                    </span>
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[user.status] || STATUS_STYLES.active}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isBlocked ? "bg-red-500" : "bg-emerald-500"}`} />
                                                        {user.status || "active"}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-4 py-3.5">
                                                    {isSelf ? (
                                                        <span className="text-xs text-zinc-300 dark:text-zinc-600 select-none">—</span>
                                                    ) : isActioning ? (
                                                        <div className="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {/* Block / Unblock */}
                                                            {isBlocked ? (
                                                                <button
                                                                    onClick={() => openModal(user, "unblock")}
                                                                    className="h-7 px-3 text-[11px] font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                                                                >
                                                                    Unblock
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => openModal(user, "block")}
                                                                    className="h-7 px-3 text-[11px] font-bold rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                                                >
                                                                    Block
                                                                </button>
                                                            )}

                                                            {/* Make Admin — hidden if already admin */}
                                                            {!isAdmin && (
                                                                <button
                                                                    onClick={() => openModal(user, "make-admin")}
                                                                    className="h-7 px-3 text-[11px] font-bold rounded-lg border border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all"
                                                                >
                                                                    Make Admin
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Confirmation Modal ── */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {ACTION_META[modal.action]?.label}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                                    You are about to perform this action on{" "}
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{modal.userName}"</span>.{" "}
                                    {ACTION_META[modal.action]?.desc}
                                </p>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                            <button
                                onClick={closeModal}
                                className="h-8 px-4 text-[11px] font-bold tracking-wider uppercase rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className={`h-8 px-5 text-[11px] font-bold tracking-wider uppercase rounded-lg text-white transition-colors shadow-sm ${ACTION_META[modal.action]?.confirmColor}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}