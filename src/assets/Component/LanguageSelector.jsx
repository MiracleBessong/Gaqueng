import { Languages } from "lucide-react";
import { LANGUAGES } from "../lib/languages";

export default function LanguageSelector({ value, onChange, label }) {
  return (
    <div className="relative">
      <Languages className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-900 outline-none transition duration-200 focus:ring-2 focus:ring-indigo-500 hover:border-slate-400 scrollbar-thin"
      >
        {label && <option value="">{label}</option>}
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
