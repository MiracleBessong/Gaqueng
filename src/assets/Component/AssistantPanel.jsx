import {
  Bot,
  Circle,
  Download,
  Languages,
  Mic,
  MicOff,
  MoonStar,
  Sparkles,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSpeechRecognition } from "../Hooks/useSpeechRecognition";
import ConversationHistory from "./ConversationHistory";
import LanguageSelector from "./LanguageSelector";

export default function AssistantPanel({
  assistant,
  recording,
  onRecord,
  recordUrl,
  history,
  onClearHistory,
  mainMicListening,
  onStopMainMic,
  onAskMicActiveChange,
}) {
  const [question, setQuestion] = useState("");

  const {
    listening: askListening,
    start: startAskMic,
    stop: stopAskMic,
  } = useSpeechRecognition({
    lang: assistant.assistantLang || "en",
    onResult: (text) => setQuestion((q) => (q ? `${q} ${text}` : text)),
  });

  useEffect(() => {
    onAskMicActiveChange?.(askListening, stopAskMic);
  }, [askListening, stopAskMic, onAskMicActiveChange]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    assistant.ask(question.trim());
    setQuestion("");
  };

  const handleMicToggle = () => {
    if (askListening) {
      stopAskMic();
    } else {
      if (mainMicListening) onStopMainMic?.();
      startAskMic();
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bot className="h-4 w-4 text-[#0A84FF]" />
          Meeting Assistant
        </h3>

        {assistant.awake ? (
          <button
            type="button"
            onClick={assistant.sleep}
            className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="inline-flex items-center gap-1.5">
              <MoonStar className="h-3.5 w-3.5" />
              Sleep
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={assistant.wake}
            className="cursor-pointer rounded-full bg-[#0A84FF] px-3 py-1.5 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0077ED]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Hi meeting assistant
            </span>
          </button>
        )}
      </div>

      {assistant.awake && !assistant.assistantLang && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Languages className="h-4 w-4 text-[#0A84FF]" />
              What language do you understand?
            </span>
          </p>

          <LanguageSelector
            value=""
            onChange={assistant.setLanguage}
            label="Choose..."
          />
        </div>
      )}

      {assistant.awake && assistant.assistantLang && (
        <form onSubmit={handleAsk} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Summarize... / Suggest questions... / Explain..."
              className="flex-1 rounded-[18px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20"
            />

            <button
              type="button"
              onClick={handleMicToggle}
              aria-label={
                askListening ? "Stop dictating" : "Speak your question"
              }
              title={askListening ? "Stop dictating" : "Speak your question"}
              className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition duration-200 hover:-translate-y-0.5 ${
                askListening
                  ? "animate-pulse bg-red-500"
                  : "bg-[#0A84FF] hover:bg-[#0077ED]"
              }`}
            >
              {askListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                assistant.ask("Summarize what has been said so far.")
              }
              className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Summarize
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                assistant.ask("Give me 3 questions to ask about this topic.")
              }
              className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            >
              Suggest questions
            </button>

            <button
              type="submit"
              className="cursor-pointer rounded-full bg-[#0A84FF] px-4 py-2 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0077ED]"
            >
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Ask
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <h4 className="mb-2 text-xs font-medium text-slate-600">Recording</h4>

        {recording ? (
          <button
            type="button"
            onClick={onRecord}
            className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-red-400"
          >
            <span className="inline-flex items-center gap-1.5">
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRecord}
            className="cursor-pointer rounded-full bg-[#0A84FF] px-4 py-2 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0077ED]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Circle className="h-3.5 w-3.5 fill-current" />
              Record
            </span>
          </button>
        )}

        {recordUrl && (
          <a
            href={recordUrl}
            download="meeting.webm"
            className="mt-2 block text-xs text-[#0A84FF] hover:underline"
          >
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download recording
            </span>
          </a>
        )}
      </div>

      {history && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <ConversationHistory history={history} onClear={onClearHistory} />
        </div>
      )}
    </div>
  );
}
