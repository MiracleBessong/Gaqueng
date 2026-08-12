import {
  BarChart3,
  CheckCircle2,
  PlusCircle,
  Vote,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function PollPanel({
  polls,
  myName,
  participants = [],
  onCreatePoll,
  onVote,
  onClosePoll,
}) {
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("Yes\nNo\nMaybe");

  const participantCount = participants.length || 1;

  const activePolls = useMemo(
    () => polls.filter((poll) => poll.status === "open"),
    [polls],
  );

  const closedPolls = useMemo(
    () => polls.filter((poll) => poll.status === "closed"),
    [polls],
  );

  const handleCreate = (e) => {
    e.preventDefault();
    const options = optionsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!question.trim() || options.length < 2) return;

    onCreatePoll({
      question: question.trim(),
      options,
    });

    setQuestion("");
    setOptionsText("Yes\nNo\nMaybe");
  };

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur transition duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-amber-500" />
          Live polls
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Run instant meeting polls and watch live results update for everyone.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div>
          <label
            htmlFor="poll-question"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Poll question
          </label>
          <input
            id="poll-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What should we decide next?"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="options"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Options
          </label>
          <textarea
            id="options"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={4}
            placeholder={"Option 1\nOption 2\nOption 3"}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
          <p className="mt-2 text-xs text-slate-500">
            Put one option on each line. At least 2 options are required.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <span className="inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Launch poll
          </span>
        </button>
      </form>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {activePolls.length === 0 && closedPolls.length === 0 ? (
          <div className="flex `min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-400">
            No polls yet. Launch one to capture a quick decision from the room.
          </div>
        ) : null}

        {activePolls.map((poll) => {
          const myVote = poll.votes[myName];
          const totalVotes = Object.keys(poll.votes).length;

          return (
            <div
              key={poll.id}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Vote className="h-3.5 w-3.5" />
                      Live poll
                    </span>
                  </p>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900">
                    {poll.question}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Created by {poll.createdBy} · {totalVotes}/
                    {participantCount} voted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onClosePoll(poll.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Close poll
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                {poll.options.map((option) => {
                  const voteCount = Object.values(poll.votes).filter(
                    (vote) => vote === option,
                  ).length;
                  const percent =
                    totalVotes > 0
                      ? Math.round((voteCount / totalVotes) * 100)
                      : 0;
                  const selected = myVote === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onVote(poll.id, option)}
                      className={`w-full rounded-2xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 ${
                        selected
                          ? "border-indigo-400 bg-white shadow-sm"
                          : "border-slate-200 bg-white/80 hover:border-indigo-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-800">
                          {option}
                        </span>
                        <span className="text-xs text-slate-500">
                          {voteCount} vote{voteCount === 1 ? "" : "s"} ·{" "}
                          {percent}%
                        </span>
                      </div>
                      <ProgressBar value={percent} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {closedPolls.length > 0 && (
          <div className="space-y-3">
            <div className="pt-2">
              <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Closed polls
                </span>
              </h4>
            </div>

            {closedPolls.map((poll) => {
              const totalVotes = Object.keys(poll.votes).length;

              return (
                <div
                  key={poll.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-slate-900">
                      {poll.question}
                    </h5>
                    <p className="mt-1 text-xs text-slate-500">
                      Final result · {totalVotes} total vote
                      {totalVotes === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {poll.options.map((option) => {
                      const voteCount = Object.values(poll.votes).filter(
                        (vote) => vote === option,
                      ).length;
                      const percent =
                        totalVotes > 0
                          ? Math.round((voteCount / totalVotes) * 100)
                          : 0;

                      return (
                        <div
                          key={option}
                          className="rounded-2xl border border-slate-200 bg-white p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-800">
                              {option}
                            </span>
                            <span className="text-xs text-slate-500">
                              {voteCount} vote{voteCount === 1 ? "" : "s"} ·{" "}
                              {percent}%
                            </span>
                          </div>
                          <ProgressBar value={percent} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
