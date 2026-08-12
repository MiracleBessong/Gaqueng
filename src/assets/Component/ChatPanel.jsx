import { Lock, MessageSquareText, Send, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";

function MessageBubble({ message, mine }) {
  return (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur transition duration-300 hover:shadow-md">
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
          mine
            ? "rounded-br-md bg-indigo-600 text-black"
            : "rounded-bl-md bg-slate-100 text-slate-800"
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-75">
          <span>{mine ? "You" : message.sender}</span>
          <span className="normal-case tracking-normal opacity-70">
            {message.scope === "private" && message.to
              ? `to ${message.to}`
              : "Everyone"}
          </span>
        </div>
        <p className="break-words text-sm leading-relaxed">
          {mine ? message.text : message.translated || message.text}
        </p>
      </div>
    </div>
  );
}

export default function ChatPanel({
  messages,
  onSend,
  myName,
  participants = [],
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("group");
  const [recipient, setRecipient] = useState("");

  const directRecipients = useMemo(
    () => participants.filter((p) => p.identity !== myName),
    [participants, myName],
  );

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (message.scope !== "private") return true;
        return message.sender === myName || message.to === myName;
      }),
    [messages, myName],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (mode === "private" && !recipient) return;

    onSend({
      text: text.trim(),
      scope: mode === "private" ? "private" : "group",
      to: mode === "private" ? recipient : undefined,
    });
    setText("");
  };

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquareText className="h-4 w-4 text-indigo-500" />
            In-call chat
          </h3>

          <p className="text-xs text-slate-500">
            Group conversation and private side messages in one place.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {visibleMessages.length} message
          {visibleMessages.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mb-4 flex gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("group")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition duration-200 hover:-translate-y-0.5 ${
            mode === "group"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group chat
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("private")}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition duration-200 hover:-translate-y-0.5 ${
            mode === "group"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Private message
          </span>
        </button>
      </div>

      {mode === "private" && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label
            htmlFor="chat-recipient"
            className="mb-2 block text-xs font-medium uppercase tracking-0.18em text-slate-500"
          >
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-3.5 w-3.5" />
              Recipient
            </span>
          </label>
          <select
            id="chat-recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-xl border text-black border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose participant...</option>
            {directRecipients.map((participant) => (
              <option key={participant.identity} value={participant.identity}>
                {participant.identity}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 min-h-220px flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-50/80 p-3">
        {visibleMessages.length === 0 ? (
          <div className="flex h-full min-h-180px items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 text-center text-sm text-slate-400">
            Start the conversation with a quick message to everyone or a private
            note to one participant.
          </div>
        ) : (
          visibleMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.sender === myName}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === "private"
              ? "Write a private message..."
              : "Message everyone in the room..."
          }
          rows={3}
          className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-900">
            {mode === "private"
              ? recipient
                ? `Only you and ${recipient} can see this message.`
                : "Pick a recipient for a private message."
              : "Everyone in the room will see this message."}
          </p>
          <button
            type="submit"
            disabled={!text.trim() || (mode === "private" && !recipient)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
