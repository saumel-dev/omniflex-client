// src/app/dashboard/layout.js
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import DashNavbar from "./_components/DashNavbar";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";

export default async function DashboardLayout({ children }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const userRole = (session.user?.role || "USER").toUpperCase();

    return (
        <div className="flex min-h-screen">
            {/* SIDEBAR */}
            <Sidebar role={userRole} />

            {/* MAIN SCREEN AREA */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* DASHBOARD NAVBAR */}
                <DashNavbar user={session.user} />

                {/* PAGE BODY */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-default-50/30">
                    {children}
                </main>
            </div>
        </div>
    );
}