"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";

export default function AppliedTrainersPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/trainer-applications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load applications.");
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const openModal = (app) => {
        setSelectedApp(app);
        setShowRejectBox(false);
        setFeedback("");
    };

    const closeModal = () => {
        setSelectedApp(null);
        setShowRejectBox(false);
        setFeedback("");
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/trainer-applications/${selectedApp._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action: "approve" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Approval failed.");

            toast.success(`${selectedApp.applicantName} is now a Trainer!`);
            closeModal();
            fetchApplications();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!feedback.trim()) return toast.error("Please write feedback before rejecting.");
        setActionLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/trainer-applications/${selectedApp._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action: "reject", feedback: feedback.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Rejection failed.");

            toast.success("Application rejected with feedback.");
            closeModal();
            fetchApplications();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-3">
                <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto px-4 py-2 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-orange-500 font-bold text-lg">✦</span>
                    <div>
                        <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Trainer Applications</h1>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{applications.length} pending application{applications.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* Application List */}
                {applications.length === 0 ? (
                    <div className="text-center py-16 text-xs text-zinc-400">
                        No pending trainer applications at this time.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <div
                                key={app._id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                            >
                                {/* Left: Avatar + Info */}
                                <div className="flex items-center gap-3">
                                    {app.applicantImage ? (
                                        <img
                                            src={app.applicantImage}
                                            alt={app.applicantName}
                                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-orange-500">
                                                {app.applicantName?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{app.applicantName}</p>
                                        <p className="text-[11px] text-zinc-400">{app.applicantEmail}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40">
                                                {app.specialty}
                                            </span>
                                            <span className="text-[11px] text-zinc-400">{app.experience} yrs exp</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: View Details Button */}
                                <button
                                    onClick={() => openModal(app)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-orange-500 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MODAL ─────────────────────────────────────────────────────────── */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Application Details</h2>
                            <button
                                onClick={closeModal}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Name</p>
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{selectedApp.applicantName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Email</p>
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 break-all">{selectedApp.applicantEmail}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Specialty</p>
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{selectedApp.specialty}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Experience</p>
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{selectedApp.experience} years</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bio</p>
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                                    {selectedApp.bio}
                                </p>
                            </div>

                            {/* Rejection Feedback Box — appears when Reject is clicked */}
                            {showRejectBox && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Rejection Feedback</p>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter rejection feedback..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-orange-300 dark:border-orange-700 rounded-lg p-2.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer — Action Buttons */}
                        <div className="flex gap-3 p-5 pt-0">
                            {/* Approve Button */}
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {actionLoading ? "Processing..." : "Approve"}
                            </button>

                            {/* Reject / Confirm Reject Button */}
                            {!showRejectBox ? (
                                <button
                                    onClick={() => setShowRejectBox(true)}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                </button>
                            ) : (
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {actionLoading ? "Processing..." : "Confirm Reject"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}