// src/app/dashboard/_components/DashNavbar.jsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@heroui/react";
import { ArrowLeft } from "@gravity-ui/icons";

export default function DashNavbar({ user }) {
  const pathname = usePathname();
  
  const pageTitle = pathname.split("/").pop() === "dashboard" 
    ? "Overview" 
    : pathname.split("/").pop().replace(/-/g, " ");

  return (
    <header className="w-full h-16 border-b border-divider flex items-center justify-between px-6 bg-background/30 backdrop-blur-sm">
      {/* Active Page Header Title */}
      <h1 className="text-lg font-bold capitalize text-foreground/90 tracking-tight">
        {pageTitle}
      </h1>

      {/* Actions & User Info Area */}
      <div className="flex items-center gap-6">
        
        {/* DESKTOP VIEW: Back to Site Button Link */}
        <Link 
          href="/" 
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-default-500 border border-divider bg-default-50 hover:bg-default-100 hover:text-foreground transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to Site
        </Link>

        {/* MOBILE VIEW: Compact Back to Site Icon Link */}
        <Link 
          href="/" 
          className="flex sm:hidden items-center justify-center p-2 rounded-xl text-default-500 border border-divider bg-default-50 hover:bg-default-100 hover:text-foreground transition-all"
          aria-label="Back to Site"
        >
          <ArrowLeft className="size-4" />
        </Link>
      </div>
    </header>
  );
}