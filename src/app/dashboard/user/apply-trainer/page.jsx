"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";

const SPECIALTIES = ["Mass Gain", "Cardio", "Strength", "Powerlifting", "Fat Loss", "Yoga"];

export default function ApplyTrainerPage() {
    const [loading, setLoading] = useState(false);
    const [existingApplication, setExistingApplication] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [formData, setFormData] = useState({
        experience: "",
        specialty: "Yoga",
        bio: "",
    });

    // Check if user already has a pending/rejected application
    useEffect(() => {
        const checkApplication = async () => {
            try {
                const tokenResponse = await authClient.token();
                const token = tokenResponse?.data?.token || tokenResponse?.token;
                if (!token) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-application/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.application) setExistingApplication(data.application);
                }
            } catch (err) {
                // No existing application — that's fine
            } finally {
                setCheckingStatus(false);
            }
        };
        checkApplication();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.experience || isNaN(formData.experience) || Number(formData.experience) < 0) {
            return toast.error("Please enter a valid number of years of experience.");
        }
        if (formData.bio.trim().length < 30) {
            return toast.error("Bio must be at least 30 characters.");
        }

        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Authentication token missing. Please log in again.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-application`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Application submission failed.");

            toast.success("Application submitted! The admin will review it shortly.");
            setExistingApplication({ ...formData, status: "pending" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Loading check ──────────────────────────────────────────────────────────
    if (checkingStatus) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
            </div>
        );
    }

    // ── Already applied — show status card ───────────────────────────────────
    if (existingApplication) {
        const isPending = existingApplication.status === "pending";
        const isRejected = existingApplication.status === "rejected";

        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-orange-500 font-bold text-lg">✦</span>
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Apply as Trainer</h1>
                </div>

                <div className={`rounded-xl border p-6 ${
                    isPending
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                }`}>
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        isPending ? "bg-amber-100 dark:bg-amber-900/40" : "bg-red-100 dark:bg-red-900/40"
                    }`}>
                        {isPending ? (
                            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h2 className={`text-sm font-bold mb-1 ${
                        isPending ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"
                    }`}>
                        {isPending ? "Application Under Review" : "Application Rejected"}
                    </h2>

                    <p className={`text-xs mb-4 ${
                        isPending ? "text-amber-600 dark:text-amber-500" : "text-red-600 dark:text-red-500"
                    }`}>
                        {isPending
                            ? "Your trainer application has been submitted and is awaiting admin review. We'll update your role once a decision is made."
                            : "Unfortunately your application was not approved this time."}
                    </p>

                    {/* Show admin feedback if rejected */}
                    {isRejected && existingApplication.adminFeedback && (
                        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-4">
                            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Admin Feedback</p>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300">{existingApplication.adminFeedback}</p>
                        </div>
                    )}

                    {/* Submitted details summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Specialty</p>
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{existingApplication.specialty}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Experience</p>
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{existingApplication.experience} years</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Application Form ─────────────────────────────────────────────────
    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-2">
            {/* Page Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-500 font-bold text-lg">✦</span>
                <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Apply as Trainer</h1>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                {/* Card Header */}
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Share your credentials and specialty. Our admin team will review your application and get back to you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Years of Experience */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Years of Experience
                        </label>
                        <input
                            type="number"
                            name="experience"
                            placeholder="e.g. 3"
                            required
                            min="0"
                            max="50"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full h-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all"
                        />
                    </div>

                    {/* Specialty */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Specialty
                        </label>
                        <select
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleInputChange}
                            className="w-full h-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all appearance-none cursor-pointer"
                        >
                            {SPECIALTIES.map((s) => (
                                <option key={s} value={s} className="bg-white dark:bg-zinc-950">
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Bio / Description
                        </label>
                        <textarea
                            name="bio"
                            placeholder="Tell us about your training background, certifications, and what you'd like to teach..."
                            required
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 resize-none transition-all"
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">{formData.bio.length} / 30 characters minimum</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting Application..." : "Submit Application"}
                    </button>
                </form>
            </div>
        </div>
    );
}