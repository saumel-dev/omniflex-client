"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("session_id");

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError("No session ID found.");
                setLoading(false);
                return;
            }
            try {
                const tokenResponse = await authClient.token();
                const token = tokenResponse?.data?.token || tokenResponse?.token;
                if (!token) throw new Error("Auth token missing.");

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment/verify?session_id=${sessionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Payment verification failed.");
                setBooking(data.booking);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Confirming your payment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-2">Payment Issue</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">{error}</p>
                    <Link
                        href="/classes"
                        className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        Back to Classes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-sm"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-5"
                >
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>

                <h1 className="text-xl font-black text-zinc-900 dark:text-white mb-1">Booking Confirmed!</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                    Your payment was successful. You&apos;re all set!
                </p>

                {/* Booking Details */}
                {/* Booking Details */}
                {booking && (
                    <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-zinc-800/70 p-4 mb-6 text-left space-y-3 transition-colors">

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">
                                Class
                            </span>

                            <span className="font-semibold text-zinc-900 dark:text-white text-right">
                                {booking.className}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">
                                Trainer
                            </span>

                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                {booking.trainerName}
                            </span>
                        </div>

                        <div className="border-t border-orange-200 dark:border-zinc-700 pt-3 flex items-center justify-between text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">
                                Amount Paid
                            </span>

                            <span className="text-lg font-black text-orange-500">
                                ${booking.price}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">
                                Transaction ID
                            </span>

                            <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 truncate max-w-[170px]">
                                {booking.stripeSessionId}
                            </span>
                        </div>

                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/dashboard/user/booked-classes"
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors text-center"
                    >
                        View My Classes
                    </Link>
                    <Link
                        href="/all_classes"
                        className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
                    >
                        Browse More Classes
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}