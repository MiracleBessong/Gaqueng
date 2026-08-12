import { Captions } from "lucide-react";

export default function CaptionPanel({ label, text, accent = "indigo" }) {
  const c = {
    indigo: "border-indigo-200 bg-indigo-50",
    teal: "border-teal-200 bg-teal-50",
    amber: "border-amber-200 bg-amber-50",
  };
  return (
    <div
      className={`rounded-2xl border-2 p-3 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${c[accent]}`}
    >
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Captions className="h-3.5 w-3.5" />
        {label}
      </p>

      <p className="text-base">{text || "…"}</p>
    </div>
  );
}
