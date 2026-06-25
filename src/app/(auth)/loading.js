// src/app/loading.js
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-sm select-none">
      
      {/* Universal Pure Tailwind Spinner Wrapper */}
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Animated Outer Ring (OmniFlex Primary Color) */}
        <div className="absolute w-full h-full rounded-full border-4 border-default-200 border-t-[#FF6B00] animate-spin"></div>
        
        {/* Decorative Inner Core Glowing Pulse */}
        <div className="w-4 h-4 rounded-full bg-[#FF6B00]/40 animate-pulse"></div>
      </div>

      {/* Loading Label Context */}
      <p className="text-default-500 font-semibold text-sm tracking-wide animate-pulse">
        Please wait...
      </p>
    </div>
  );
}