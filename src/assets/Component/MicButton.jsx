import { Mic, MicOff } from "lucide-react";

export default function MicButton({ listening, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        listening
          ? "animate-pulse bg-red-500"
          : "bg-indigo-600 hover:bg-indigo-700"
      }`}

      aria-label={label || (listening ? "Stop" : "Speak")}
    >
      {listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
    </button>
  );
}
