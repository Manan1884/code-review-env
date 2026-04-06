export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00ff88]"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
