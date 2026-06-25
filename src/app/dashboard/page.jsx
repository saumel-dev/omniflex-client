// src/app/dashboard/page.jsx
import { redirect } from "next/navigation";
import AdminDashboard from "./admin/page";
import TrainerDashboard from "./trainer/page";
import UserDashboard from "./user/page";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";

// Import your sub-view panels from your components area


export default async function DashboardPage() {
    // 1. Double-check authentication on the server for safety
    const session = await auth.api.getSession({
        headers: await headers(), // This gives Better-Auth access to cookies and auth tokens
    });

    // If a logged-out user tries to type "/dashboard" manually in the URL, kick them out
    if (!session || !session.user) {
        redirect("/login");
    }

    const role = (session.user?.role || "USER").toUpperCase();

    // 2. Inject the correct page content dynamically into the layout's {children}
    return (
        <>
            {role === "ADMIN" && <AdminDashboard />}
            {role === "TRAINER" && <TrainerDashboard />}
            {role === "USER" && <UserDashboard />}
        </>
    );
}