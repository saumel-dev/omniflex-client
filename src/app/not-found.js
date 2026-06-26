// src/app/not-found.jsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "@gravity-ui/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 text-center select-none">
      
      {/* Dynamic Brand Color Illustration (404 Accent Box) */}
      <div className="relative mb-8 flex items-center justify-center">
        <h1 className="text-[12rem] font-black tracking-tighter text-default-100 dark:text-default-50/5 leading-none">
          404
        </h1>
        <div className="absolute rotate-12 w-24 h-24 rounded-2xl bg-[#FF6B00] opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute -rotate-12 w-20 h-20 rounded-3xl bg-[#FF6B00] border-4 border-[#FF6B00] shadow-xl shadow-[#FF6B00]/20 flex items-center justify-center text-white text-2xl font-black">
          !
        </div>
      </div>

      {/* Error Message */}
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Page Not Found
        </h2>
        <p className="text-sm text-default-500 leading-relaxed">
          The page you are looking for might have been removed. <br></br> Lets get you back on track!
        </p>
      </div>

      {/* Back to Home Action Button */}
      <div className="mt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-lg shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/30 transition-all transform active:scale-95"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}