// src/app/loading.js
export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-transparent">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#FF6B00]"></div>
    </div>
  );
}