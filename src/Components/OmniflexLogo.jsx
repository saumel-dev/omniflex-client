import Link from 'next/link';
import React from 'react';

export default function OmniflexLogo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-2 italic font-black select-none">
        {/* Typography */}
        <span className="text-3xl uppercase tracking-tighter text-dark dark:text-white">
          OMNI<span className="text-[#FF6B00]">FLEX</span>
        </span>
      </div>
    </Link>
  );
}