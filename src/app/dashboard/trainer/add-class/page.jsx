"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

const CATEGORIES = ["Yoga", "Cardio", "Weights", "Combat", "Zumba", "CrossFit"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddClassPage() {
    const [loading, setLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        className: "",
        category: "Yoga",
        difficulty: "Beginner",
        duration: "",
        price: "",
        time: "08:00",
        description: "",
    });

    const handleDayToggle = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Please select a class image.");
        if (selectedDays.length === 0) return alert("Please pick at least one schedule day.");

        setLoading(true);
        try {
            const imgbbFormData = new FormData();
            imgbbFormData.append("image", imageFile);

            const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
                method: "POST",
                body: imgbbFormData,
            });
            const imgbbData = await imgbbRes.json();
            if (!imgbbData.success) throw new Error("Image upload failed");

            const imageUrl = imgbbData.data.url;

            // 2. Extract token properly using Better-Auth structure 
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            if (!token) {
                throw new Error("Authentication token could not be verified. Please log in again.");
            }

            const finalPayload = {
                ...formData,
                image: imageUrl,
                scheduleDays: selectedDays,
                price: parseFloat(formData.price),
            };

            // 3. Fire the request over to your backend port 5000
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Will now properly contain the string
                },
                body: JSON.stringify(finalPayload),
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.error || "Something went wrong");

            alert("Success! Your class has been submitted for admin approval.");

            setFormData({
                className: "",
                category: "Yoga",
                difficulty: "Beginner",
                duration: "",
                price: "",
                time: "08:00",
                description: "",
            });
            setSelectedDays([]);
            setImageFile(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col justify-center px-4 py-2">
            {/* The wrapper background card responds to both light mode and dark mode context classes */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">

                {/* Header Section */}
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="text-orange-500 font-bold text-lg">✦</span>
                    <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Add New Class</h1>
                </div>

                {/* Fixed Grid Split: Restored to multi-column responsive track layout */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-3.5 text-zinc-700 dark:text-zinc-300">

                    {/* Left Inputs Stream */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Class Name</label>
                            <input
                                type="text"
                                name="className"
                                placeholder="e.g. Power Yoga Flow"
                                required
                                value={formData.className}
                                onChange={handleInputChange}
                                className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat} className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                                >
                                    {DIFFICULTY_LEVELS.map((lvl) => (
                                        <option key={lvl} value={lvl} className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">{lvl}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    placeholder="e.g. 60 mins"
                                    required
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="25"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Class Image Banner</label>
                            <label className="flex items-center justify-center w-full h-14 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium px-3 truncate">
                                    {imageFile ? `✓ ${imageFile.name}` : "Choose fitness cover image"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Right Inputs Stream */}
                    <div className="space-y-3 flex flex-col justify-between">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Schedule Days</label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                                {DAYS.map((day) => {
                                    const isSelected = selectedDays.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => handleDayToggle(day)}
                                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${isSelected
                                                ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Preferred Start Time</label>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleInputChange}
                                className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
                            <textarea
                                name="description"
                                placeholder="Detail what students will achieve in this session..."
                                required
                                rows={2}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 resize-none h-[64px] transition-all"
                            />
                        </div>

                        {/* Premium Action Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Uploading Data..." : "Submit Class for Approval"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}