import { ArrowRight, LogIn, PlusCircle, User, Video } from "lucide-react";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";

// First screen: create or join a room by code. The code IS the password —
// anyone with it can join. No accounts.
export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [myLang, setMyLang] = useState("en");
  const [mode, setMode] = useState("create");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    const code = roomCode.trim().toUpperCase();
    onJoin({ name: name.trim(), roomCode: code, myLang });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-white/50 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)]">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
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
            className="block text-sm font-medium mb-2"
          >
            Your name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition duration-200 focus:ring-2 focus:ring-indigo-500 hover:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-2">
            Your language (you speak + want to hear)
          </label>
          <LanguageSelector value={myLang} onChange={setMyLang} />
        </div>

        <div>
          <label htmlFor="room-code" className="block text-sm font-medium mb-2">
            Room code (your secret password)
          </label>
          <input
            id="room-code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="e.g. CLASS-7B"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
          />
        </div>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-lg ${mode === "create" ? "bg-indigo-600 text-white" : "bg-slate-100"}`}
          >
            <span className="inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create new room
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-lg ${mode === "join" ? "bg-indigo-600 text-white" : "bg-slate-100"}`}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Join existing
            </span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700"
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
