    "use client";

    import { useEffect, useState, useCallback, useRef } from "react";
    import Link from "next/link";
    import { motion, AnimatePresence } from "motion/react";

    const CATEGORIES = ["All", "Mass Gain", "Cardio", "Strength", "Powerlifting", "Fat Loss", "Yoga"];
    const LIMIT = 9;

    const DIFFICULTY_STYLES = {
        Beginner:     "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
        Intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25",
        Advanced:     "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/25",
    };

    // ── Animation Variants ────────────────────────────────────────────
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        show:   { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
    };

    const staggerContainer = {
        hidden: {},
        show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
    };

    const cardVariant = {
        hidden: { opacity: 0, y: 24, scale: 0.98 },
        show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const pillVariant = {
        hidden: { opacity: 0, scale: 0.85 },
        show:   { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
    };

    // ── ClassCard ─────────────────────────────────────────────────────
    function ClassCard({ cls }) {
        return (
            <motion.div
                variants={cardVariant}
                className="group bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl dark:hover:shadow-zinc-900/60 transition-all duration-300"
            >
                <div className="relative w-full h-48 overflow-hidden shrink-0">
                    <img
                        src={cls.image}
                        alt={cls.className}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#FF6B00] text-white px-2.5 py-1 rounded-full shadow-md">
                        {cls.category}
                    </span>
                    <span className="absolute top-3 right-3 text-[11px] font-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-700">
                        ${cls.price}
                    </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-[#FF6B00] transition-colors">
                        {cls.className}
                    </h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 mb-3">
                        by {cls.trainerName || "Trainer"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
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
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 flex-grow">
                        {cls.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
                        <div>
                            <span className="text-[18px] font-black text-[#FF6B00]">${cls.price}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">/session</span>
                        </div>
                        <Link
                            href={`/class/${cls._id}`}
                            className="py-2 px-4 text-[11px] font-bold rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── SkeletonCard ──────────────────────────────────────────────────
    function SkeletonCard() {
        return (
            <div className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-800" />
                <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                        <div className="h-5 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6" />
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-4/6" />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="h-6 w-14 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Page ─────────────────────────────────────────────────────
    export default function AllClassesPage() {
        const [classes, setClasses]       = useState([]);
        const [total, setTotal]           = useState(0);
        const [totalPages, setTotalPages] = useState(1);
        const [page, setPage]             = useState(1);
        const [loading, setLoading]       = useState(true);
        const [error, setError]           = useState("");
        const [search, setSearch]         = useState("");
        const [activeCategory, setActiveCategory] = useState("All");

        const isFilterChange = useRef(false);

        const fetchClasses = useCallback(async (searchVal, category, pageNum) => {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
                if (searchVal) params.set("search", searchVal);
                if (category !== "All") params.set("category", category);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/public?${params}`
                );
                if (!res.ok) {
                    const d = await res.json();
                    throw new Error(d.error || "Failed to load classes.");
                }
                const data = await res.json();
                setClasses(data.classes);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            isFilterChange.current = true;
            setPage(1);
            const timer = setTimeout(() => fetchClasses(search, activeCategory, 1), 400);
            return () => clearTimeout(timer);
        }, [search, activeCategory, fetchClasses]);

        useEffect(() => {
            if (isFilterChange.current) {
                isFilterChange.current = false;
                return;
            }
            fetchClasses(search, activeCategory, page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, [page]); // eslint-disable-line

        const startItem = total === 0 ? 0 : (page - 1) * LIMIT + 1;
        const endItem   = Math.min(page * LIMIT, total);

        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-[#090D16]">

                {/* ── Hero Header ── */}
                <div className="bg-white dark:bg-[#111214] border-b border-zinc-200 dark:border-zinc-800">
                    <div className="max-w-6xl mx-auto px-4 py-14 text-center">

                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 px-3 py-1 rounded-full mb-5"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            Explore All Classes
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                            className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-3"
                        >
                            Find Your <span className="text-[#FF6B00]">Perfect Class</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                            className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed"
                        >
                            Browse our curated fitness classes led by expert trainers. Filter by category and discover the right fit for your goals.
                        </motion.p>

                        {/* Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.22 }}
                            className="relative max-w-lg mx-auto mb-6"
                        >
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search classes by name..."
                                className="w-full pl-11 pr-10 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] transition-all shadow-sm"
                            />
                            <AnimatePresence>
                                {search && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        transition={{ duration: 0.15 }}
                                        onClick={() => setSearch("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Category Pills */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="flex flex-wrap items-center justify-center gap-2"
                        >
                            {CATEGORIES.map((cat) => (
                                <motion.button
                                    key={cat}
                                    variants={pillVariant}
                                    onClick={() => setActiveCategory(cat)}
                                    whileTap={{ scale: 0.93 }}
                                    className={`px-4 py-1.5 text-[12px] font-bold rounded-full border transition-all ${
                                        activeCategory === cat
                                            ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/20"
                                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-[#FF6B00]/50 hover:text-[#FF6B00]"
                                    }`}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* ── Content Area ── */}
                <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col min-h-[60vh]">

                    {/* Showing counter */}
                    <AnimatePresence mode="wait">
                        {!loading && !error && total > 0 && (
                            <motion.div
                                key="counter"
                                variants={fadeIn}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                className="flex items-center gap-2 mb-6"
                            >
                                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                                </svg>
                                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                                    Showing{" "}
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{startItem}–{endItem}</span>
                                    {" "}of{" "}
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{total}</span>
                                    {" "}classes
                                    {activeCategory !== "All" && <span> in <span className="text-[#FF6B00] font-bold">{activeCategory}</span></span>}
                                    {search && <span> for <span className="text-[#FF6B00] font-bold">&quot;{search}&quot;</span></span>}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                className="text-center py-20 flex-1"
                            >
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-red-500 mb-4">{error}</p>
                                <button
                                    onClick={() => fetchClasses(search, activeCategory, page)}
                                    className="text-xs px-5 py-2 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#e05e00] transition-colors"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Skeleton */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Empty state */}
                    <AnimatePresence>
                        {!loading && !error && classes.length === 0 && (
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                className="text-center py-24 flex-1"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1">No classes found</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                    {search || activeCategory !== "All" ? "Try adjusting your search or filter." : "No approved classes available yet."}
                                </p>
                                {(search || activeCategory !== "All") && (
                                    <button
                                        onClick={() => { setSearch(""); setActiveCategory("All"); }}
                                        className="mt-5 text-xs px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors font-semibold"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cards Grid */}
                    <AnimatePresence mode="wait">
                        {!loading && !error && classes.length > 0 && (
                            <motion.div
                                key={`${page}-${activeCategory}-${search}`}
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {classes.map((cls) => (
                                    <ClassCard key={cls._id} cls={cls} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── PAGINATION — Forum style ── */}
                    <AnimatePresence>
                        {!loading && !error && totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, delay: 0.2 }}
                                className="flex items-center justify-center gap-2 mt-10 flex-wrap"
                            >
                                {/* Previous */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    ← Previous
                                </motion.button>

                                {/* Page number pills */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <motion.button
                                        key={p}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors ${
                                            page === p
                                                ? "bg-[#FF6B00] text-white border border-[#FF6B00] shadow-sm"
                                                : "text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        }`}
                                    >
                                        {p}
                                    </motion.button>
                                ))}

                                {/* Next */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next →
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Page indicator text */}
                    {!loading && !error && totalPages > 1 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center text-[11px] text-zinc-400 mt-3"
                        >
                            Page <span className="font-bold text-zinc-600 dark:text-zinc-300">{page}</span> of{" "}
                            <span className="font-bold text-zinc-600 dark:text-zinc-300">{totalPages}</span>
                        </motion.p>
                    )}
                </div>
            </div>
        );
    }