import {
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  PlusCircle,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [myLang, setMyLang] = useState("en");
  const [mode, setMode] = useState("create");
  const [showRoomCode, setShowRoomCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    const code = roomCode.trim().toUpperCase();
    onJoin({ name: name.trim(), roomCode: code, myLang });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A84FF] via-[#5E5CE6] to-[#64D2FF] text-white shadow-[0_12px_30px_rgba(10,132,255,0.28)]">
            <Video className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Gaqueng
            </h2>
            <p className="text-sm text-slate-500">
              Create or enter a multilingual meeting room in seconds.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="name-input"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Your name
          </label>

          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada"
              className="w-full rounded-[20px] border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="language"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Your language (you speak + want to hear)
          </label>

          <LanguageSelector value={myLang} onChange={setMyLang} />
        </div>

        <div>
          <label
            htmlFor="room-code"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Room code (your secret password)
          </label>

          <div className="relative">
            <input
              id="room-code"
              type={showRoomCode ? "text" : "password"}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. CLASS-7B"
              className="w-full rounded-[20px] border border-slate-300 bg-white px-4 py-3 pr-12 text-sm uppercase text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20"
            />

            <button
              type="button"
              onClick={() => setShowRoomCode((value) => !value)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={showRoomCode ? "Hide room code" : "Show room code"}
              title={showRoomCode ? "Hide room code" : "Show room code"}
            >
              {showRoomCode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl bg-[#F2F2F7] p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 font-medium transition duration-200 ${
              mode === "create"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create new room
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 font-medium transition duration-200 ${
              mode === "join"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Join existing
            </span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-[#0A84FF] py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0077ED]"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            {mode === "create" ? "Create & enter" : "Enter room"}
          </span>
        </button>
      </form>
    </div>
  );
}
