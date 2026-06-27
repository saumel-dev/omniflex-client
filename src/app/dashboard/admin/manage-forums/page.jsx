"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "react-toastify";

export default function ManageForumsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/forum-posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load forum posts.");
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (postId) => {
        setProcessingId(postId);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;
            if (!token) throw new Error("Auth token missing.");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/forum-posts/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Deletion failed.");

            toast.success("Post deleted.");
            setConfirmDelete(null);
            fetchPosts();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-2 space-y-3">
                <div className="h-6 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse">
                            <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                <div className="h-2.5 w-64 bg-zinc-100 dark:bg-zinc-800 rounded" />
                            </div>
                            <div className="h-7 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                            <div className="h-7 w-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
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
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Manage Forum Posts</h1>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{posts.length} total post{posts.length !== 1 ? "s" : ""} across all trainers and admins</p>
                </div>
            </div>

            {/* Empty State */}
            {posts.length === 0 ? (
                <div className="text-center py-16 text-xs text-zinc-400">No forum posts found.</div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
                        >
                            {/* Post Image */}
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-14 h-14 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                            />

                            {/* Post Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{post.title}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                    {post.authorName} · {formatDate(post.createdAt)} · {post.likes || 0} likes · {post.comments?.length || 0} comments
                                </p>
                            </div>

                            {/* Author Role Badge */}
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full border flex-shrink-0 ${
                                post.authorRole === "admin"
                                    ? "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50"
                                    : "bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                            }`}>
                                {post.authorRole === "admin" ? "Admin" : "Trainer"}
                            </span>

                            {/* Delete with inline confirm */}
                            {confirmDelete === post._id ? (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        disabled={processingId === post._id}
                                        className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === post._id ? "..." : "Yes, Delete"}
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(post._id)}
                                    disabled={processingId === post._id}
                                    className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                    title="Delete post"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}