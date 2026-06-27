// src/app/dashboard/_components/Sidebar.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Drawer, Button } from "@heroui/react";
import {
    House,
    Person,
    Plus,
    ListCheck,
    LayoutCellsLarge,
    CreditCard,
    Heart,
    Bookmark,
    Bars,
    ArrowLeftToLine
} from "@gravity-ui/icons";
import { authClient } from "@/app/lib/auth-client";

const sidebarRoutes = {
    ADMIN: [
        { label: "Overview", href: "/dashboard", icon: House },
        { label: "Manage Users", href: "/dashboard/admin/users", icon: Person },
        { label: "Applied Trainers", href: "/dashboard/admin/applied-trainers", icon: LayoutCellsLarge },
        { label: "Manage Trainers", href: "/dashboard/admin/manage-trainers", icon: Person },
        { label: "Manage Classes", href: "/dashboard/admin/manage-classes", icon: ListCheck },
        { label: "Add Forum Post", href: "/dashboard/admin/add-forum", icon: Plus },
        { label: "Manage Forums", href: "/dashboard/admin/manage-forums", icon: LayoutCellsLarge },
        { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
    ],
    TRAINER: [
        { label: "Overview", href: "/dashboard", icon: House },
        { label: "Add Class", href: "/dashboard/trainer/add-class", icon: Plus },
        { label: "My Classes", href: "/dashboard/trainer/my-classes", icon: ListCheck },
        { label: "Add Forum Post", href: "/dashboard/trainer/add-forum-post", icon: Plus },
        { label: "My Forum Posts", href: "/dashboard/trainer/my-forums", icon: LayoutCellsLarge },
    ],
    USER: [
        { label: "Overview", href: "/dashboard", icon: House },
        { label: "Booked Classes", href: "/dashboard/user/booked-classes", icon: Bookmark },
        { label: "Apply as Trainer", href: "/dashboard/user/apply-trainer", icon: Person },
        { label: "Favorite Classes", href: "/dashboard/user/favorites", icon: Heart },
    ],
};

export default function Sidebar({ role }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Safely handle the case if role comes down undefined or lowercase
    const activeRole = (role || "USER").toUpperCase();
    const currentRoutes = sidebarRoutes[activeRole] || sidebarRoutes.USER;

    // Trigger session destruction via Better-Auth
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/login");
                        router.refresh();
                    },
                },
            });
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    // Reusable core structural layout content
    const NavContent = () => (
        <div className="flex flex-col h-full justify-between flex-1">
            {/* Top Links Section */}
            <nav className="flex flex-col gap-2 mt-6">
                {currentRoutes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20"
                                : "text-foreground/70 hover:bg-default hover:text-foreground"
                                }`}
                        >
                            <route.icon className="size-5" />
                            {route.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions Section */}
            <div className="mt-auto pt-4 border-t border-divider">
                <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                    <ArrowLeftToLine className="size-5 rotate-180" />
                    {isLoggingOut ? "Logging out..." : "Log Out"}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* =========================================================
              DESKTOP SIDEBAR: Permanent, static left layout block
             ========================================================= */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-divider h-screen p-5 bg-background/50 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-2 px-2 pb-2">
                    <span className="text-xl font-black text-foreground tracking-wider">
                        OMNI<span className="text-[#FF6B00]">FLEX</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-default-100 text-default-600 px-1.5 py-0.5 rounded-md font-mono">
                        {activeRole}
                    </span>
                </div>
                <NavContent />
            </aside>

            {/* =========================================================
              MOBILE FLOATING TRIGGER BUTTON
             ========================================================= */}
            <div className="fixed bottom-5 right-5 z-50 lg:hidden">
                <Button
                    isIconOnly
                    onPress={() => setIsOpen(true)}
                    className="bg-[#FF6B00] text-white rounded-full shadow-lg size-14 min-w-14"
                >
                    <Bars className="size-6" />
                </Button>
            </div>

            {/* =========================================================
              HEROUI DRAWER MODAL (MOBILE)
             ========================================================= */}
            <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Backdrop>
                    <Drawer.Content placement="left" className="w-72 max-w-[80vw]">
                        <Drawer.Dialog className="p-5 h-full flex flex-col bg-background">
                            <Drawer.CloseTrigger className="absolute top-4 right-4" />
                            <Drawer.Header className="px-1 py-2 border-b border-divider">
                                <Drawer.Heading className="text-lg font-black tracking-wider">
                                    OMNI<span className="text-[#FF6B00]">FLEX</span>
                                </Drawer.Heading>
                            </Drawer.Header>
                            <Drawer.Body className="px-0 py-2 flex flex-col flex-1 h-full">
                                <NavContent />
                            </Drawer.Body>
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            </Drawer>
        </>
    );
}