import { CheckCircle2, Languages, Mic, Volume2 } from "lucide-react";

const S = {
  idle: {
    label: "Ready",
    c: "bg-slate-200 text-slate-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  listening: {
    label: "Listening...",
    c: "bg-red-100 text-red-700",
    icon: <Mic className="h-3.5 w-3.5" />,
  },
  translating: {
    label: "Translating...",
    c: "bg-amber-100 text-amber-700",
    icon: <Languages className="h-3.5 w-3.5" />,
  },
  speaking: {
    label: "Speaking...",
    c: "bg-teal-100 text-teal-700",
    icon: <Volume2 className="h-3.5 w-3.5" />,
  },
};

export default function StatusBadge({ stage }) {
  const s = S[stage] || S.idle;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition duration-200 hover:shadow-sm ${s.c}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}
