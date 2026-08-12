import { ChevronLeft, ChevronRight, Mic, MicOff } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import ParticipantTile from "./ParticipantTile";

export default function ParticipantStrip({
  participants,
  stageIdentity,
  myIdentity,
  raisedHands,
  activeIdentity,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const strip = useMemo(
    () => participants.filter((p) => p.identity !== stageIdentity),
    [participants, stageIdentity],
  );

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * 220,
      behavior: "smooth",
    });
    requestAnimationFrame(updateScrollState);
    setTimeout(updateScrollState, 250);
  };

  if (strip.length === 0) return null;

  return (
    <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        className={`group hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 md:flex ${
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-25"
        }`}
        aria-label="Scroll participants left"
      >
        <ChevronLeft className="h-4 w-4 transition group-hover:scale-110" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden rounded-2xl bg-black/40 px-3 py-2 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-center text-[11px] font-medium text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Gaqueng
          </span>
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        >
          {strip.map((participant) => {
            const isActive = participant.identity === activeIdentity;
            const isYou = participant.identity === myIdentity;

            return (
              <div
                key={participant.identity}
                className={`group relative w-[154px] shrink-0 overflow-hidden rounded-xl border transition ${
                  isActive
                    ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.7)]"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <ParticipantTile
                  participant={participant}
                  isYou={isYou}
                  size="sm"
                  raisedHand={!!raisedHands?.[participant.identity]}
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                  <div className="truncate text-[11px] font-medium text-white">
                    {participant.identity} {isYou ? "(you)" : ""}
                  </div>

                  <div className="ml-2 flex items-center gap-1 text-white/80">
                    {participant.isMicrophoneEnabled === false ? (
                      <MicOff className="h-3.5 w-3.5" />
                    ) : (
                      <Mic className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        className={`group hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 md:flex ${
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-25"
        }`}
        aria-label="Scroll participants right"
      >
        <ChevronRight className="h-4 w-4 transition group-hover:scale-110" />
      </button>
    </div>
  );
}
