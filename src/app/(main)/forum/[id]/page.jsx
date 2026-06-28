"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

export default function ForumPostDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Vote state
    const [voteLoading, setVoteLoading] = useState(false);

    // Comment state
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    // Reply state — track which comment is open for reply
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);

    // Delete state
    const [deletingId, setDeletingId] = useState(null);

    const getToken = async () => {
        const tokenResponse = await authClient.token();
        return tokenResponse?.data?.token || tokenResponse?.token;
    };

    // Fetch current logged-in user
    useEffect(() => {
        const loadUser = async () => {
            try {
                const session = await authClient.getSession();
                setCurrentUser(session?.data?.user || null);
            } catch {
                setCurrentUser(null);
            }
        };
        loadUser();
    }, []);

    const fetchPost = async () => {
        try {
            const token = await getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}`, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load post.");
            setPost(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    const handleVote = async (type) => {
        if (!currentUser) return router.push("/login");
        setVoteLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}/vote`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPost((prev) => ({ ...prev, likes: data.likes, dislikes: data.dislikes, likedBy: data.likedBy, dislikedBy: data.dislikedBy }));
        } catch (err) {
            console.error(err.message);
        } finally {
            setVoteLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!currentUser) return router.push("/login");
        if (!commentText.trim()) return;
        setCommentLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: commentText.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCommentText("");
            fetchPost();
        } catch (err) {
            console.error(err.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const handlePostReply = async (commentId) => {
        if (!currentUser) return router.push("/login");
        if (!replyText.trim()) return;
        setReplyLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}/comments/${commentId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: replyText.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReplyText("");
            setReplyingTo(null);
            fetchPost();
        } catch (err) {
            console.error(err.message);
        } finally {
            setReplyLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setDeletingId(commentId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchPost();
        } catch (err) {
            console.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        setDeletingId(replyId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts/${id}/comments/${commentId}/replies/${replyId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchPost();
        } catch (err) {
            console.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const hasLiked = post?.likedBy?.includes(currentUser?.id);
    const hasDisliked = post?.dislikedBy?.includes(currentUser?.id);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 animate-pulse">
                <div className="h-64 bg-zinc-200 dark:bg-zinc-800" />
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="space-y-2">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-500">Post not found.</p>
                    <button onClick={() => router.push("/forum")} className="mt-3 text-xs text-orange-500 font-bold hover:underline">
                        ← Back to Forum
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">

            {/* ── Hero Banner ────────────────────────────────────────────────── */}
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-zinc-900">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Gradient overlay — fades to page bg at bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-zinc-50 dark:to-zinc-950" />

                {/* Back button */}
                <button
                    onClick={() => router.push("/forum")}
                    className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Forum
                </button>
            </div>

            {/* ── Post Content ───────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-3 sm:px-4 -mt-8 relative z-10 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                >
                    {/* Author Row */}
                    <div className="flex items-center gap-3 mb-4">
                        {post.authorImage ? (
                            <img src={post.authorImage} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-md flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-md flex-shrink-0">
                                <span className="text-sm font-bold text-white">{post.authorName?.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{post.authorName}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    post.authorRole === "admin"
                                        ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                                        : "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"
                                }`}>
                                    {post.authorRole === "admin" ? "Admin" : "Trainer"}
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-4 leading-tight">
                        {post.title}
                    </h1>

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 whitespace-pre-line break-words overflow-wrap-anywhere">
                        {post.description}
                    </p>

                    {/* ── Like / Dislike ─────────────────────────────────────── */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 flex-wrap">
                        <button
                            onClick={() => handleVote("like")}
                            disabled={voteLoading}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                                hasLiked
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:text-orange-500"
                            } disabled:opacity-50`}
                        >
                            <svg className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {post.likes || 0}
                        </button>

                        <button
                            onClick={() => handleVote("dislike")}
                            disabled={voteLoading}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                                hasDisliked
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-red-400 hover:text-red-500"
                            } disabled:opacity-50`}
                        >
                            <svg className="w-4 h-4" fill={hasDisliked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904a3.61 3.61 0 01.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                            {post.dislikes || 0}
                        </button>

                        <span className="text-[11px] text-zinc-400 ml-auto flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comments?.length || 0} comment{post.comments?.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* ── Comments Section ───────────────────────────────────── */}
                    <div>
                        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Comments ({post.comments?.length || 0})
                        </h2>

                        {/* Write a comment box */}
                        {currentUser ? (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-5">
                                <div className="flex gap-2 sm:gap-3">
                                    {currentUser.image ? (
                                        <img src={currentUser.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-zinc-200 dark:border-zinc-700" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-orange-500">{currentUser.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <textarea
                                            rows={2}
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            style={{ backgroundColor: "white", colorScheme: "light" }} className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none transition-all"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={handlePostComment}
                                                disabled={commentLoading || !commentText.trim()}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                {commentLoading ? "Posting..." : "Post Comment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-5 text-center">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    <button onClick={() => router.push("/login")} className="text-orange-500 font-bold hover:underline">Log in</button> to leave a comment.
                                </p>
                            </div>
                        )}

                        {/* Comment List */}
                        <div className="space-y-4">
                            {post.comments?.length === 0 && (
                                <p className="text-xs text-zinc-400 text-center py-6">No comments yet. Be the first!</p>
                            )}

                            {post.comments?.map((comment) => (
                                <AnimatePresence key={comment._id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                                    >
                                        {/* Comment Header */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                {comment.authorImage ? (
                                                    <img src={comment.authorImage} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-zinc-200 dark:border-zinc-700" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[10px] font-bold text-zinc-500">{comment.authorName?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{comment.authorName}</span>
                                                    <p className="text-[10px] text-zinc-400">{formatDate(comment.createdAt)}</p>
                                                </div>
                                            </div>
                                            {/* Delete own comment */}
                                            {currentUser?.email === comment.authorEmail && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    disabled={deletingId === comment._id}
                                                    className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Comment Text */}
                                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed mb-2 ml-7 sm:ml-9 break-words">{comment.text}</p>

                                        {/* Reply Button */}
                                        {currentUser && (
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                className="ml-7 sm:ml-9 flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-orange-500 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                Reply
                                            </button>
                                        )}

                                        {/* Reply Input */}
                                        <AnimatePresence>
                                            {replyingTo === comment._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-7 sm:ml-9 mt-3 overflow-hidden"
                                                >
                                                    <div className="flex gap-2">
                                                        <textarea
                                                            rows={2}
                                                            placeholder={`Reply to ${comment.authorName}...`}
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            style={{ backgroundColor: "white", colorScheme: "light" }} className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-1.5 gap-2">
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                            className="px-2.5 py-1 text-[11px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handlePostReply(comment._id)}
                                                            disabled={replyLoading || !replyText.trim()}
                                                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {replyLoading ? "Posting..." : "Reply"}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Nested Replies */}
                                        {comment.replies?.length > 0 && (
                                            <div className="ml-7 sm:ml-9 mt-3 space-y-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-3">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply._id} className="flex items-start justify-between gap-2">
                                                        <div className="flex gap-2 flex-1 min-w-0">
                                                            {reply.authorImage ? (
                                                                <img src={reply.authorImage} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-zinc-200 dark:border-zinc-700" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-[9px] font-bold text-zinc-500">{reply.authorName?.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{reply.authorName}</span>
                                                                    <span className="text-[10px] text-zinc-400">{formatDate(reply.createdAt)}</span>
                                                                </div>
                                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{reply.text}</p>
                                                            </div>
                                                        </div>
                                                        {/* Delete own reply */}
                                                        {currentUser?.email === reply.authorEmail && (
                                                            <button
                                                                onClick={() => handleDeleteReply(comment._id, reply._id)}
                                                                disabled={deletingId === reply._id}
                                                                className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
