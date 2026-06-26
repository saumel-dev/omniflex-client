"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { Button, Modal, AlertDialog, Surface, TextField, Label, Input } from "@heroui/react";
import { Pencil, TrashBin, ArrowRotateRight } from "@gravity-ui/icons";

const CATEGORIES = ["Mass Gain", "Cardio", "Strength", "Powerlifting", "Fat Loss", "Yoga"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function MyClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal Control States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Track current class selected for modifications
    const [selectedClass, setSelectedClass] = useState(null);
    const [editFormData, setEditFormData] = useState({
        className: "",
        category: "Yoga",
        difficulty: "Beginner",
        duration: "",
        price: "",
        time: "08:00",
        description: "",
    });

    // Fetch classes created by this trainer
    const fetchTrainerClasses = async () => {
        setLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trainer-classes`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to load your added classes.");
            const data = await res.json();
            setClasses(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainerClasses();
    }, []);

    // Setup form data when clicking edit
    const handleEditClick = (cls) => {
        setSelectedClass(cls);
        setEditFormData({
            className: cls.className,
            category: cls.category,
            difficulty: cls.difficulty,
            duration: cls.duration,
            price: cls.price,
            time: cls.time,
            description: cls.description,
        });
        setIsEditOpen(true);
    };

    // Submit patches to database
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/${selectedClass._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            setIsEditOpen(false);
            fetchTrainerClasses();
        } catch (error) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Execute item deletion
    const handleDeleteConfirm = async () => {
        setActionLoading(true);
        try {
            const tokenResponse = await authClient.token();
            const token = tokenResponse?.data?.token || tokenResponse?.token;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/classes/${selectedClass._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Deletion failed");

            setIsDeleteOpen(false);
            fetchTrainerClasses();
        } catch (error) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col justify-center px-4 py-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-5 shadow-sm transition-colors duration-200">

                {/* Header Title Section */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500 font-bold text-lg">✦</span>
                        <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">My Added Classes</h1>
                    </div>
                    <button
                        onClick={fetchTrainerClasses}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                        title="Reload Classes"
                    >
                        <ArrowRotateRight className={`w-4 h-4 ${loading ? "animate-spin text-orange-500" : ""}`}></ArrowRotateRight>
                    </button>
                </div>

                {/* Content Area Core */}
                {loading ? (
                    <div className="text-center py-10 text-xs text-zinc-400">Loading schedules records...</div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-10 text-xs text-zinc-400">No fitness sessions found. Add your first class to get started!</div>
                ) : (
                    <>
                        {/* 📱 MOBILE RESPONSIVE CARDS VIEW (No scroll needed, clear gaps) */}
                        <div className="block md:hidden space-y-3">
                            {classes.map((cls) => (
                                <div
                                    key={cls._id}
                                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col gap-3"
                                >
                                    <div className="flex gap-3 items-start">
                                        <img
                                            src={cls.image}
                                            alt={cls.className}
                                            className="w-16 h-12 object-cover rounded-md border border-zinc-200 dark:border-zinc-800 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-zinc-800 dark:text-zinc-100 text-sm truncate">{cls.className}</div>
                                            <div className="text-[10px] text-zinc-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                <span>Cat: {cls.category}</span>
                                                <span>•</span>
                                                <span>Lvl: {cls.difficulty}</span>
                                            </div>
                                            <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 mt-1">
                                                {cls.duration} — <span className="font-bold text-zinc-800 dark:text-zinc-100">${cls.price}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-full ${cls.status === "approved"
                                                ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900"
                                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                                                }`}>
                                                {cls.status || "pending"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Unscrollable Bottom Action Bar for Mobile */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                                        <button
                                            onClick={() => handleEditClick(cls)}
                                            className="p-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5"></Pencil> Edit Class
                                        </button>
                                        <button
                                            onClick={() => { setSelectedClass(cls); setIsDeleteOpen(true); }}
                                            className="p-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-medium transition-all"
                                        >
                                            <TrashBin className="w-3.5 h-3.5"></TrashBin> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 💻 DESKTOP TABLE VIEW */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50">
                                        <th className="p-3">Class Banner</th>
                                        <th className="p-3">Class Details</th>
                                        <th className="p-3">Price & Duration</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                                    {classes.map((cls) => (
                                        <tr key={cls._id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-950/40 transition-colors">
                                            <td className="p-3">
                                                <img
                                                    src={cls.image}
                                                    alt={cls.className}
                                                    className="w-16 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-800"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-zinc-800 dark:text-zinc-100">{cls.className}</div>
                                                <div className="text-[10px] text-zinc-400 flex gap-2 mt-0.5">
                                                    <span>Cat: {cls.category}</span>
                                                    <span>•</span>
                                                    <span>Lvl: {cls.difficulty}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-zinc-800 dark:text-zinc-200">${cls.price}</div>
                                                <div className="text-[10px] text-zinc-400">{cls.duration}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full ${cls.status === "approved"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900"
                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                                                    }`}>
                                                    {cls.status || "pending"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-1.5">
                                                <button
                                                    onClick={() => handleEditClick(cls)}
                                                    className="p-1.5 inline-flex items-center gap-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium transition-all"
                                                >
                                                    <Pencil className="w-3.5 h-3.5"></Pencil> Edit
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedClass(cls); setIsDeleteOpen(true); }}
                                                    className="p-1.5 inline-flex items-center gap-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[11px] font-medium transition-all"
                                                >
                                                    <TrashBin className="w-3.5 h-3.5"></TrashBin> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* HEROUI MODAL CONTAINER: CLASS MANAGEMENT EDIT SYSTEM */}
            {isEditOpen && (
                <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
                    <Modal.Backdrop>
                        <Modal.Container placement="auto">
                            <Modal.Dialog className="sm:max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                                <Modal.CloseTrigger onClick={() => setIsEditOpen(false)} />
                                <Modal.Header className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                    <Modal.Heading className="text-base font-bold text-zinc-800 dark:text-zinc-100">Modify Class Settings</Modal.Heading>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        Update details for <span className="font-semibold text-zinc-600 dark:text-zinc-300">{selectedClass?.className}</span>.
                                    </p>
                                </Modal.Header>
                                <Modal.Body className="p-5 max-h-[70vh] overflow-y-auto">
                                    <Surface variant="default">
                                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5">
                                            <TextField className="w-full" name="className" type="text" variant="secondary">
                                                <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Class Name</Label>
                                                <Input
                                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-3 focus:outline-none focus:border-orange-500"
                                                    value={editFormData.className}
                                                    onChange={(e) => setEditFormData({ ...editFormData, className: e.target.value })}
                                                    required
                                                />
                                            </TextField>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Category</label>
                                                    <select
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2"
                                                        value={editFormData.category}
                                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                                    >
                                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Difficulty</label>
                                                    <select
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2"
                                                        value={editFormData.difficulty}
                                                        onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                                                    >
                                                        {DIFFICULTY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <TextField className="w-full" name="duration" type="text" variant="secondary">
                                                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Duration</Label>
                                                    <Input
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-3 focus:outline-none"
                                                        value={editFormData.duration}
                                                        onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                                                        required
                                                    />
                                                </TextField>
                                                <TextField className="w-full" name="price" type="number" variant="secondary">
                                                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Price ($)</Label>
                                                    <Input
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-3 focus:outline-none"
                                                        value={editFormData.price}
                                                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                                        required
                                                    />
                                                </TextField>
                                            </div>

                                            <TextField className="w-full" name="time" type="time" variant="secondary">
                                                <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Preferred Time</Label>
                                                <Input
                                                    className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-3 focus:outline-none"
                                                    value={editFormData.time}
                                                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                                                    required
                                                />
                                            </TextField>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Description</label>
                                                <textarea
                                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg p-2 resize-none h-16"
                                                    value={editFormData.description}
                                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-2">
                                                <Button type="button" onClick={() => setIsEditOpen(false)} variant="secondary" className="h-8 text-xs px-3">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={actionLoading} className="h-8 text-xs px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg">
                                                    {actionLoading ? "Saving..." : "Save Modifications"}
                                                </Button>
                                            </div>
                                        </form>
                                    </Surface>
                                </Modal.Body>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
            )}

            {/* HEROUI ALERT DIALOG: DELETION SAFETY CONFIRMATION */}
            {isDeleteOpen && (
                <AlertDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                    <AlertDialog.Backdrop>
                        <AlertDialog.Container>
                            <AlertDialog.Dialog className="sm:max-w-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl p-4">
                                <AlertDialog.CloseTrigger onClick={() => setIsDeleteOpen(false)} />
                                <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />
                                    <AlertDialog.Heading className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Remove session permanently?</AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body className="py-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    <p>
                                        This will permanently remove <strong>{selectedClass?.className}</strong> from the schedules board. This action cannot be undone.
                                    </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer className="mt-4 flex justify-end gap-2">
                                    <Button onClick={() => setIsDeleteOpen(false)} variant="tertiary" className="h-8 text-xs px-3">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleDeleteConfirm} disabled={actionLoading} variant="danger" className="h-8 text-xs px-4 font-medium text-white rounded-lg">
                                        {actionLoading ? "Deleting..." : "Confirm Delete"}
                                    </Button>
                                </AlertDialog.Footer>
                            </AlertDialog.Dialog>
                        </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                </AlertDialog>
            )}
        </div>
    );
}