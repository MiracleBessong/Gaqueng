import { History, Languages, Trash2 } from "lucide-react";

export default function ConversationHistory({ history, onClear }) {
  if (!history.length) return null;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-indigo-500" />
          Live transcript
        </h3>

        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-600"
        >
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </span>
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((m, i) => (
          <div key={i} className="text-sm border-b border-slate-100 pb-1.5">
            <span className="font-medium text-slate-700">{m.speaker}:</span>{" "}
            <span className="text-slate-600">{m.original}</span>
            {m.translated && m.translated !== m.original && (
              <div className="flex items-start gap-2 pl-2 text-teal-700">
                <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{m.translated}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
