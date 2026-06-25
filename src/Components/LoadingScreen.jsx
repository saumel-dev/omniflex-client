// src/components/LoadingScreen.jsx
"use client";

import { Spinner } from "@heroui/react";

export default function LoadingScreen({ label = "Loading application..." }) {
  return (
    <div className="fixed inset-0 w-screen h-screen z-9999 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
      <Spinner 
        size="lg" 
        classNames={{
          circle1: "border-b-[#FF6B00]",
          circle2: "border-b-[#FF6B00]",
          label: "text-default-500 font-medium text-sm select-none tracking-wide"
        }}
        label={label}
      />
    </div>
  );
}