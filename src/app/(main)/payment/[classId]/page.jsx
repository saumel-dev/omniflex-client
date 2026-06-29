"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import Link from "next/link";

export default function PaymentPage() {
    const { classId } = useParams();
    const router = useRouter();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch class details to show order summary
    useEffect(() => {
        const fetchClass = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/public/${classId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Class not found.");
                setClassData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (classId) fetchClass();
    }, [classId]);

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        setError("");
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Please log in to continue.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ classId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to start checkout.");

            // Redirect to Stripe's hosted checkout page
            window.location.href = data.url;

        } catch (err) {
            setError(err.message);
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error && !classData) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-red-500 font-semibold mb-3">{error}</p>
                    <Link href="/classes" className="text-xs text-orange-500 font-bold hover:underline">← Back to Classes</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Back link */}
                <Link
                    href={`/class/${classId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-orange-500 transition-colors mb-6"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Class
                </Link>

                {/* Page Title */}
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">Complete Booking</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                    Review your order details below and proceed to our secure{" "}
                    <span className="text-orange-500 font-semibold">Stripe</span> checkout.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ── Order Summary ─────────────────────────────────────── */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Order Summary</h2>

                        {/* Class Image */}
                        {classData?.image && (
                            <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
                                <img
                                    src={classData.image}
                                    alt={classData.className}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Order Details */}
                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 dark:text-zinc-500">Item</span>
                                <span className="font-bold text-zinc-800 dark:text-zinc-100">{classData?.className}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 dark:text-zinc-500">Trainer</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{classData?.trainerName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 dark:text-zinc-500">Category</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{classData?.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 dark:text-zinc-500">Duration</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{classData?.duration} min</span>
                            </div>

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2.5 mt-2.5 flex items-center justify-between">
                                <span className="font-bold text-zinc-800 dark:text-zinc-100">Total Due</span>
                                <span className="text-lg font-black text-orange-500">${classData?.price}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Payment Panel ─────────────────────────────────────── */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Payment</h2>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure Checkout
                            </span>
                        </div>

                        {/* Info box */}
                        <div className="flex gap-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                You will be redirected to <span className="font-bold text-zinc-700 dark:text-zinc-300">Stripe</span> to complete your purchase securely. We do not store any of your payment information.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-4">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {checkoutLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Redirecting to Stripe...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Proceed to Checkout
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-zinc-400 mt-3">
                            Powered by <span className="font-bold">Stripe</span> · Your payment is encrypted and secure
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}