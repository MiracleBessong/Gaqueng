import { Hand, Mic, MicOff, MonitorUp } from "lucide-react";
import { ParticipantEvent, Track } from "livekit-client";

import { useEffect, useMemo, useRef } from "react";

const SIZE_CLASSES = {
  sm: "h-[88px] w-[154px]",
  lg: "h-full w-full",
  md: "w-full aspect-video",
};

function getVideoPublications(participant) {
  return Array.from(participant.videoTrackPublications?.values?.() || []);
}

export default function ParticipantTile({
  participant,
  isYou,
  size = "md",
  raisedHand = false,
  micActive,
}) {
  const videoRef = useRef(null);

  const preferredVideoPublication = useMemo(() => {
    const publications = getVideoPublications(participant);
    return (
      publications.find(
        (publication) => publication.source === Track.Source.ScreenShare,
      ) || publications[0]
    );
  }, [participant]);

  const hasScreenShare =
    preferredVideoPublication?.source === Track.Source.ScreenShare;

  useEffect(() => {
    const setupTracks = () => {
      const publications = Array.from(
        participant.videoTrackPublications?.values?.() || [],
      );
      const screenPub = publications.find(
        (p) => p.source === Track.Source.ScreenShare,
      );
      const chosenPub = screenPub || publications[0];

      if (chosenPub?.track && videoRef.current) {
        chosenPub.track.attach(videoRef.current);
      } else if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    setupTracks();

    participant.on(ParticipantEvent.TrackPublished, setupTracks);
    participant.on(ParticipantEvent.TrackSubscribed, setupTracks);
    participant.on(ParticipantEvent.LocalTrackPublished, setupTracks);
    participant.on(ParticipantEvent.TrackUnpublished, setupTracks);
    participant.on(ParticipantEvent.LocalTrackUnpublished, setupTracks);

    return () => {
      participant.off(ParticipantEvent.TrackPublished, setupTracks);
      participant.off(ParticipantEvent.TrackSubscribed, setupTracks);
      participant.off(ParticipantEvent.LocalTrackPublished, setupTracks);
      participant.off(ParticipantEvent.TrackUnpublished, setupTracks);
      participant.off(ParticipantEvent.LocalTrackUnpublished, setupTracks);
      try {
        participant.videoTrackPublications.forEach((p) => {
          p.track?.detach();
        });
      } catch (e) {
        console.warn("Cleanup error", e);
      }
    };
  }, [participant]);

  if (size === "sm") {
    return (
      <div
        className={`relative overflow-hidden bg-slate-900 ${SIZE_CLASSES[size]}`}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          autoPlay
          playsInline
        />

        {raisedHand ? (
          <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow">
            <Hand className="h-3.5 w-3.5" />
          </div>
        ) : null}

        {hasScreenShare ? (
          <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-blue-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <MonitorUp className="h-3 w-3" />
            Share
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black ${SIZE_CLASSES[size]}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        autoPlay
        playsInline
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 py-4">
        <div className="flex items-end justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur-md">
            {(micActive ?? participant.isMicrophoneEnabled) === false ? (
                          <MicOff className="h-4 w-4 text-red-300" />
                        ) : (
                          <Mic className="h-4 w-4 text-emerald-300" />
                        )}
            <span>
              {participant.identity} {isYou ? "(you)" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasScreenShare ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-300 backdrop-blur">
                <MonitorUp className="h-3.5 w-3.5" />
                Sharing screen
              </div>
            ) : null}

            {raisedHand ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-lg">
                <Hand className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
