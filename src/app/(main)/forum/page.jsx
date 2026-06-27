"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function CommunityForumPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                ...(search && { search }),
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load posts.");

            setPosts(data.posts);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Debounce search — fire after user stops typing 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    const truncate = (text, len = 100) => {
        if (!text) return "";
        return text.length > len ? text.slice(0, len) + "..." : text;
    };

    // Skeleton cards
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden animate-pulse">
            <div className="h-44 bg-zinc-100 dark:bg-zinc-800" />
            <div className="p-4 space-y-3">
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg mt-2" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* ── Hero Header ────────────────────────────────────────────── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30 text-[11px] font-bold text-orange-500 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        Community
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight mb-3">
                        Community <span className="text-orange-500">Forum</span>
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        Connect with trainers, share your fitness journey, and grow with the community.
                    </p>
                </div>

                {/* ── Search Bar ─────────────────────────────────────────────── */}
                <div className="relative max-w-lg mx-auto mb-8">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search posts, authors..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl placeholder-zinc-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors text-zinc-800 dark:text-zinc-100 shadow-sm"
                    />
                </div>

                {/* ── Results count ──────────────────────────────────────────── */}
                {!loading && (
                    <p className="text-[11px] text-zinc-400 mb-4">
                        Showing <span className="font-bold text-orange-500">{posts.length}</span> of <span className="font-bold text-zinc-600 dark:text-zinc-300">{total}</span> posts
                        {search && <span> for &quot;<span className="font-semibold">{search}</span>&quot;</span>}
                    </p>
                )}

                {/* ── Posts Grid ─────────────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-3xl mb-3">🏋️</p>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">No posts found</p>
                        <p className="text-xs text-zinc-400 mt-1">Try a different search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {posts.map((post) => (
                            <div
                                key={post._id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col"
                            >
                                {/* Card Image */}
                                <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Role badge overlay */}
                                    <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                        post.authorRole === "admin"
                                            ? "bg-red-500 text-white"
                                            : "bg-orange-500 text-white"
                                    }`}>
                                        {post.authorRole === "admin" ? "Admin" : "Trainer"}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 flex flex-col flex-1">
                                    {/* Author + Date */}
                                    <div className="flex items-center gap-2 mb-2">
                                        {post.authorImage ? (
                                            <img
                                                src={post.authorImage}
                                                alt={post.authorName}
                                                className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[8px] font-bold text-orange-500">
                                                    {post.authorName?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                            {post.authorName} · {formatDate(post.createdAt)}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 leading-snug">
                                        {post.title}
                                    </h3>

                                    {/* Description preview */}
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 flex-1">
                                        {truncate(post.description, 110)}
                                    </p>

                                    {/* Footer: likes + read more */}
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                                {post.likes || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {post.comments?.length || 0}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/forum/${post._id}`}
                                            className="px-3 py-1.5 text-[11px] font-bold text-orange-500 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination ─────────────────────────────────────────────── */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {/* Previous */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors ${
                                    currentPage === page
                                        ? "bg-orange-500 text-white border border-orange-500 shadow-sm"
                                        : "text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Page indicator */}
                {!loading && totalPages > 1 && (
                    <p className="text-center text-[11px] text-zinc-400 mt-3">
                        Page <span className="font-bold text-zinc-600 dark:text-zinc-300">{currentPage}</span> of <span className="font-bold text-zinc-600 dark:text-zinc-300">{totalPages}</span>
                    </p>
                )}
            </div>
        </div>
    );
}