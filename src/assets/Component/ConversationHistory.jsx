import { History, Languages, Trash2 } from "lucide-react";

export default function ConversationHistory({ history, onClear }) {
  if (!history.length) return null;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-sm backdrop-blur transition duration-300 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <History className="h-4 w-4 text-[#0A84FF]" />
          Live transcript
        </h3>

        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
        >
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </span>
        </button>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl bg-[#F6F6F8] p-3">
        {history.map((m, i) => (
          <div
            key={i}
            className="rounded-[20px] border border-slate-200 bg-white px-3 py-3 shadow-sm"
          >
            <div className="mb-1 text-sm">
              <span className="font-semibold text-slate-900">{m.speaker}</span>
            </div>

            <div className="text-sm leading-relaxed text-slate-700">
              {m.original}
            </div>

            {m.translated && m.translated !== m.original && (
              <div className="mt-2 flex items-start gap-2 rounded-2xl bg-[#F2F8FF] px-3 py-2 text-sm text-[#0A84FF]">
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
