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
import { useState, useEffect } from "react";
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

  // Separate, isolated speech-recognition instance just for talking to the
  // assistant — independent of the main meeting mic, so using one never
  // interrupts the other.
  const {
      listening: askListening,
      start: startAskMic,
      stop: stopAskMic,
    } = useSpeechRecognition({
      lang: assistant.assistantLang || "en",
      onResult: (text) => setQuestion((q) => (q ? `${q} ${text}` : text)),
    });

    // Let RoomScreen know whether this mic is active (and how to stop it),
    // so it can release the mic before the main meeting mic tries to use it.
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
      // The main meeting mic and this one can't both hold the browser's
      // microphone at once — pause the main mic first if it's running.
      if (mainMicListening) onStopMainMic?.();
      startAskMic();
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bot className="h-4 w-4 text-violet-600" />
          Meeting Assistant
        </h3>

        {assistant.awake ? (
          <button
            type="button"
            onClick={assistant.sleep}
            className="text-xs text-slate-500 hover:underline"
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
            className="rounded-md bg-violet-600 px-2 py-1 text-xs text-white transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700"
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
              <Languages className="h-4 w-4 text-violet-500" />
              What language do you understand?
            </span>
          </p>
          <LanguageSelector
            value=""
            onChange={assistant.setLanguage}
            label="Choose…"
          />
        </div>
      )}
      {assistant.awake && assistant.assistantLang && (
        <form onSubmit={handleAsk} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Summarize… / Suggest questions… / Explain…"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handleMicToggle}
              aria-label={
                askListening ? "Stop dictating" : "Speak your question"
              }
              title={askListening ? "Stop dictating" : "Speak your question"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition duration-200 hover:-translate-y-0.5 ${
                askListening
                  ? "animate-pulse bg-red-500"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {askListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                assistant.ask("Summarize what has been said so far.")
              }
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
            >
              <span className="inline-flex items-center gap-1.5 text-slate-900">
                <Sparkles className="h-3.5 w-3.5" />
                Summarize
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                assistant.ask("Give me 3 questions to ask about this topic.")
              }
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs transition duration-200 text-slate-900 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
            >
              Suggest questions
            </button>
            <button
              type="submit"
              className="rounded-md bg-violet-600 px-3 py-1 text-xs text-white transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Ask
              </span>
            </button>
          </div>
        </form>
      )}
      <div className="pt-2 border-t border-violet-200">
        <h4 className="text-xs font-medium text-slate-600 mb-1">Recording</h4>
        {recording ? (
          <button
            type="button"
            onClick={onRecord}
            className="text-xs px-3 py-1 rounded-md bg-red-600 text-white"
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
            className="text-xs px-3 py-1 rounded-md bg-slate-700 text-white"
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
            className="block text-xs text-indigo-600 mt-1 hover:underline"
          >
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download recording
            </span>
          </a>
        )}
      </div>
      {history && (
        <div className="pt-2 border-t border-violet-200">
          <ConversationHistory history={history} onClear={onClearHistory} />
        </div>
      )}
    </div>
  );
}
