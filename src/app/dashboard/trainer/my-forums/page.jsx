"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";

export default function MyForumPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Alert Dialog Confirmation Modal states
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // 1. Fetch current trainer's exclusive posts from the secure backend
    const fetchMyPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            if (!token) {
                throw new Error("Authentication state verified as invalid. Re-login.");
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-forum-posts`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to load dashboard posts context.");
            }

            const data = await res.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    // 2. Open confirmation alert dialog tracking targeted record
    const triggerDeleteConfirmation = (post) => {
        setPostToDelete(post);
        setIsAlertOpen(true);
    };

    // 3. Confirm deletion logic processing payload removal asynchronously
    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        setDeleteLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${postToDelete._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Could not complete deletion target pipeline.");
            }

            // Sync visual UI local array context cleanly 
            setPosts(posts.filter((p) => p._id !== postToDelete._id));
            setIsAlertOpen(false);
            setPostToDelete(null);
        } catch (err) {
            alert(`Error deleting post: ${err.message}`);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full text-center py-10 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="font-semibold mb-2">Error Processing View Data</p>
                <p className="text-xs">{error}</p>
                <button onClick={fetchMyPosts} className="mt-4 text-xs px-4 py-1.5 bg-[#FF6B00] text-white rounded font-bold hover:bg-[#e05e00] transition-colors">
                    Retry Sync
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 text-zinc-800 dark:text-zinc-100">
            {/* Header Area Block */}
            <div className="flex items-center gap-2.5 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="w-6 h-6 flex items-center justify-center bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded text-[#FF6B00]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">My Forum Posts</h1>
            </div>

            {/* Empty Condition State Wrapper */}
            {posts.length === 0 ? (
                <div className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-16 px-4 text-center">
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No community articles posted yet.</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Publish insightful records on the platform.</p>
                </div>
            ) : (
                /* Main Grid Structure System mapping dynamically to Card elements */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post) => (
                        <div 
                            key={post._id} 
                            className="bg-white dark:bg-[#111214] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-md dark:shadow-xl group"
                        >
                            {/* Card Image Banner Box container section */}
                            <div className="w-full h-44 bg-zinc-100 dark:bg-zinc-950 relative overflow-hidden shrink-0 border-b border-zinc-200 dark:border-zinc-900">
                                {post.image ? (
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-700 text-xs">
                                        No Image Managed
                                    </div>
                                )}
                            </div>

                            {/* Text Metadata Details Block Content */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-1 mb-1 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00] transition-colors">
                                    {post.title}
                                </h3>
                                
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal line-clamp-3 mb-4 leading-relaxed flex-grow">
                                    {post.description}
                                </p>

                                <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium border-t border-zinc-100 dark:border-zinc-900/60 pt-3 mt-auto">
                                    {/* String conversion for date stamps */}
                                    <span>
                                        {post.createdAt ? new Date(post.createdAt).toISOString() : "Unknown Timestamp"}
                                    </span>

                                    {/* Likes and Comment metrics row */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                                            <svg className="w-3.5 h-3.5 text-red-500 fill-red-500" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                            <span className="font-bold">{post.likes || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                                            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="font-bold">{post.commentsCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trigger Controller Action Box Container Footer */}
                            <div className="px-4 pb-4 pt-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => triggerDeleteConfirmation(post)}
                                    className="w-full h-8 bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-500 dark:text-red-400 hover:text-white dark:hover:text-white font-bold text-[11px] tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h10M4 7h16" />
                                    </svg>
                                    Delete Post
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CUSTOM ALERT DIALOG POPUP MODAL COMPONENT */}
            {isAlertOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md p-5 shadow-2xl transition-all scale-100">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-full shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Confirm Post Removal</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Are you sure you want to delete <span className="text-zinc-900 dark:text-white font-semibold">"{postToDelete?.title}"</span>? This action is absolute and cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Footer Actions Control Block */}
                        <div className="flex items-center justify-end gap-2.5 mt-5 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={() => { setIsAlertOpen(false); setPostToDelete(null); }}
                                className="h-8 px-4 border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[10px] tracking-wider uppercase rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={confirmDeletePost}
                                className="h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] tracking-wider uppercase rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center"
                            >
                                {deleteLoading ? "Processing..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}