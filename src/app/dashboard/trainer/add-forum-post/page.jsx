"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { Button, TextField, Label, Input, Surface } from "@heroui/react";

export default function AddForumPostPage() {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Please select a cover image for your article.");
        if (description.length < 100) return alert("Your content text must pass the 100 characters minimum threshold.");

        setLoading(true);
        try {
            // 1. Upload Cover Image Asset to ImgBB
            const imgbbFormData = new FormData();
            imgbbFormData.append("image", imageFile);

            const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
                method: "POST",
                body: imgbbFormData,
            });
            const imgbbData = await imgbbRes.json();
            if (!imgbbData.success) throw new Error("Image upload infrastructure failure.");

            const imageUrl = imgbbData.data.url;

            // 2. Fetch session token via the confirmed Better-Auth bridge method
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            if (!token) {
                throw new Error("Authentication verification failed. Please re-login.");
            }

            // 3. Dispatch payload bundle to server
            const finalPayload = {
                title,
                description,
                image: imageUrl
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forum-posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(finalPayload)
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.error || "Internal operation sync failure");

            alert("Success! Your forum post has been published to the community board.");

            // Clear inputs cleanly
            setTitle("");
            setDescription("");
            setImageFile(null);
            setImagePreview(null);

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col justify-center px-4 py-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">
                
                {/* Header Block with primary brand style (#FF6B00) */}
                <div className="flex items-center gap-2 mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="text-[#FF6B00] font-bold text-lg">✦</span>
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Add Forum Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-zinc-700 dark:text-zinc-300">
                    
                    {/* Title input field wrapper */}
                    <TextField className="w-full" name="title" variant="secondary">
                        <Label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Title</Label>
                        <Input
                            type="text"
                            placeholder="Enter article title..."
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] transition-all"
                        />
                    </TextField>

                    {/* Selector element for upload state tracking */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Post Image</label>
                        {!imagePreview ? (
                            <label className="flex items-center justify-center w-full h-14 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium px-3 truncate">
                                    Choose cover image for your post
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center justify-between w-full h-14 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 px-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">✓ Image Loaded:</span>
                                    <span className="text-[11px] text-zinc-500 truncate max-w-[200px] sm:max-w-xs">{imageFile?.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="text-[11px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider transition-colors"
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description Area mapping counter limits visually */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description</label>
                            <span className={`text-[10px] font-bold ${description.length >= 100 ? "text-[#FF6B00]" : "text-zinc-400"}`}>
                                ({description.length}/100 MIN)
                            </span>
                        </div>
                        <textarea
                            placeholder="Detail your forum article topic parameters here..."
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:bg-white dark:focus:bg-zinc-950 h-28 resize-none transition-all"
                        />
                    </div>

                    {/* Live Image Preview Window Container matching screenshot template */}
                    {imagePreview && (
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Image Preview</label>
                            <div className="w-full h-44 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                                <img
                                    src={imagePreview}
                                    alt="Live Forum Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submission Button Trigger using the precise primary brand color variant styling */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-9 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Publishing Post Content..." : "Publish Post"}
                    </button>

                </form>
            </div>
        </div>
    );
}