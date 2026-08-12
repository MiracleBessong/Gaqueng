import { Video } from "lucide-react";

export default function Header({ roomCode }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/95 px-4 py-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_10px_24px_rgba(99,102,241,0.28)] transition duration-300 hover:scale-105 hover:shadow-[0_14px_28px_rgba(99,102,241,0.38)]">
          <Video className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              Gaqueng
            </h1>
          </div>
          <p className="truncate text-xs text-slate-300">
            Real-time translation, assistance, collaboration
          </p>
        </div>

        {roomCode && (
          <div className="ml-auto hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/8">
            <span className="font-medium text-slate-400">Room</span>
            <span className="rounded-lg bg-white/10 px-2 py-1 font-semibold tracking-[0.16em] text-white">
              {roomCode}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
