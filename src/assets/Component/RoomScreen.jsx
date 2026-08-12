import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { Room, RoomEvent, Track } from "livekit-client";
import { BarChart3, Circle, Presentation, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMeetingAssistant } from "../Hooks/useMeetingAssistant";
import { useRecording } from "../Hooks/useRecording";
import { useSpeechRecognition } from "../Hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../Hooks/useSpeechSynthesis";
import { useTranslation } from "../Hooks/useTranslation";
import { fetchLiveKitToken } from "../lib/api";
import AssistantPanel from "./AssistantPanel";
import ChatPanel from "./ChatPanel";
import ControlBar from "./ControlBar";
import LanguageSelector from "./LanguageSelector";
import ParticipantStrip from "./ParticipantStrip";
import ParticipantTile from "./ParticipantTile";
import PollPanel from "./PollPanel";

let reactionId = 0;
let chatMessageId = 0;
let pollMessageId = 0;

function makeReaction(emoji) {
  return {
    id: reactionId++,
    emoji,
    x: 10 + Math.random() * 80,
  };
}

function getParticipantScreenTrack(participant) {
  if (!participant) return null;
  const publications = Array.from(
    participant.videoTrackPublications?.values?.() || [],
  );
  const screenPublication = publications.find(
    (publication) => publication.source === Track.Source.ScreenShare,
  );
  return screenPublication?.track || null;
}

function isRoomReady(room) {
  return room && room.state === "connected" && room.localParticipant;
}

export default function RoomScreen({
  name,
  roomCode,
  myLang,
  setMyLang,
  onLeave,
}) {
  const [participants, setParticipants] = useState([]);
  const [history, setHistory] = useState([]);
  const [stage, setStage] = useState("idle");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState({});
  const [reactions, setReactions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pollsOpen, setPollsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recordingConsentOpen, setRecordingConsentOpen] = useState(false);

  const roomRef = useRef(null);
  const screenTrackRef = useRef(null);
  const mountedRef = useRef(true);
  const assistantMicRef = useRef({ active: false, stop: null });
  const { translate } = useTranslation();
  const { speak, speaking, stop: stopSpeak } = useSpeechSynthesis();
  const {
    recording,
    url: recordUrl,
    start: recStart,
    stop: recStop,
  } = useRecording();

  const translateRef = useRef(translate);
  const speakRef = useRef(speak);
  const stopSpeakRef = useRef(stopSpeak);

  useEffect(() => {
    translateRef.current = translate;
  }, [translate]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    stopSpeakRef.current = stopSpeak;
  }, [stopSpeak]);

  const myLangRef = useRef(myLang);
  useEffect(() => {
    myLangRef.current = myLang;
  }, [myLang]);

  const updateParticipants = useCallback(() => {
    if (!roomRef.current) return;
    const all = [
      roomRef.current.localParticipant,
      ...roomRef.current.remoteParticipants.values(),
    ];
    setParticipants(all);
  }, []);

  const handleAskMicActiveChange = useCallback((active, stop) => {
    assistantMicRef.current = { active, stop };
  }, []);

  const broadcastData = useCallback(async (topic, payload) => {
    const room = roomRef.current;
    if (!isRoomReady(room)) return;

    try {
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(payload)),
        { reliable: true, topic },
      );
    } catch (e) {
      console.error(`Failed to publish ${topic}`, e);
    }
  }, []);

  const pushReaction = useCallback((emoji) => {
    const reaction = makeReaction(emoji);
    setReactions((items) => [...items, reaction]);
    setTimeout(() => {
      setReactions((items) => items.filter((item) => item.id !== reaction.id));
    }, 2500);
  }, []);

  const handleMyResult = useCallback(
    async (text) => {
      setStage("idle");
      const msg = {
        speaker: name,
        original: text,
        sourceLang: myLangRef.current,
        ts: Date.now(),
      };
      setHistory((h) => [...h, msg]);
      await broadcastData("transcript", msg);
    },
    [broadcastData, name],
  );

  const {
    listening,
    start: startMic,
    stop: stopMic,
  } = useSpeechRecognition({
    lang: myLang,
    onResult: handleMyResult,
  });

  const stopMicRef = useRef(stopMic);
  useEffect(() => {
    stopMicRef.current = stopMic;
  }, [stopMic]);

  useEffect(() => {
    let cancelled = false; // scoped to THIS effect run only
    let localRoom = null; // the Room instance THIS run creates
    mountedRef.current = true;

    const connectRoom = async () => {
      try {
        const token = await fetchLiveKitToken(roomCode, name);
        if (cancelled) return; // cleaned up while the token request was in flight

        const room = new Room({ adaptiveStream: true, dynacast: true });
        localRoom = room;
        roomRef.current = room;

        const syncParticipants = () => {
          if (cancelled) return;
          updateParticipants();
        };

        room.on(RoomEvent.ParticipantConnected, syncParticipants);
        room.on(RoomEvent.ParticipantDisconnected, syncParticipants);
        room.on(RoomEvent.TrackPublished, syncParticipants);
        room.on(RoomEvent.TrackUnpublished, syncParticipants);
        room.on(RoomEvent.TrackSubscribed, syncParticipants);
        room.on(RoomEvent.TrackUnsubscribed, syncParticipants);
        room.on(RoomEvent.LocalTrackPublished, syncParticipants);
        room.on(RoomEvent.LocalTrackUnpublished, syncParticipants);

        room.on(RoomEvent.Reconnecting, () => {
          if (cancelled) return;
          setConnected(false);
        });

        room.on(RoomEvent.Reconnected, () => {
          if (cancelled) return;
          setConnected(true);
          updateParticipants();
        });

        room.on(RoomEvent.Disconnected, () => {
          if (cancelled) return;
          setConnected(false);
          setScreenSharing(false);
          setVideoEnabled(false);
        });

        room.on(RoomEvent.ParticipantConnected, async () => {
          await broadcastData("meta", {
            type: "lang",
            name,
            lang: myLangRef.current,
          });
        });

        room.on(
          RoomEvent.DataReceived,
          async (payload, _participant, _kind, topic) => {
            if (cancelled) return;
            const decoded = new TextDecoder().decode(payload);

            if (topic === "transcript") {
              const msg = JSON.parse(decoded);
              setHistory((h) => [...h, msg]);
              setStage("translating");

              const translated = await translateRef.current(
                msg.original,
                msg.sourceLang,
                myLangRef.current,
              );

              setHistory((h) =>
                h.map((m) => (m === msg ? { ...m, translated } : m)),
              );

              setStage("speaking");
              await speakRef.current(translated, myLangRef.current);
              if (!cancelled) setStage("idle");
              return;
            }

            if (topic === "hand") {
              const { identity, raised } = JSON.parse(decoded);
              setRaisedHands((h) => ({ ...h, [identity]: raised }));
              return;
            }

            if (topic === "reaction") {
              const { emoji } = JSON.parse(decoded);
              pushReaction(emoji);
              return;
            }

            if (topic === "chat") {
              const message = JSON.parse(decoded);
              const me = room.localParticipant.identity;
              const visibleToMe =
                message.scope !== "private" ||
                message.sender === me ||
                message.to === me;

              if (visibleToMe) {
                // Don't translate our own outgoing message — it's already
                // in our language, and it's added locally in handleSendChat.
                if (message.sender === me) return;

                let translated = message.text;
                if (
                  message.sourceLang &&
                  message.sourceLang !== myLangRef.current
                ) {
                  translated = await translateRef.current(
                    message.text,
                    message.sourceLang,
                    myLangRef.current,
                  );
                }

                setChatMessages((messages) => [
                  ...messages,
                  { ...message, translated },
                ]);
              }
              return;
            }

            if (topic === "poll-create") {
              const poll = JSON.parse(decoded);
              setPolls((items) => {
                const exists = items.some((item) => item.id === poll.id);
                return exists ? items : [...items, poll];
              });
              return;
            }

            if (topic === "poll-vote") {
              const { pollId, voter, option } = JSON.parse(decoded);
              setPolls((items) =>
                items.map((poll) =>
                  poll.id === pollId
                    ? {
                        ...poll,
                        votes: {
                          ...poll.votes,
                          [voter]: option,
                        },
                      }
                    : poll,
                ),
              );
              return;
            }

            if (topic === "poll-close") {
              const { pollId } = JSON.parse(decoded);
              setPolls((items) =>
                items.map((poll) =>
                  poll.id === pollId ? { ...poll, status: "closed" } : poll,
                ),
              );
            }
          },
        );

        await room.connect(import.meta.env.VITE_LIVEKIT_URL, token);

        if (cancelled) {
          room.disconnect();
          return;
        }

        setConnected(true);
        updateParticipants();

        try {
          await room.localParticipant.setCameraEnabled(true);
          if (!cancelled) setVideoEnabled(true);
        } catch (cameraError) {
          console.error("Camera start failed", cameraError);
          if (!cancelled) setVideoEnabled(false);
        }

        try {
          await room.localParticipant.setMicrophoneEnabled(false);
        } catch (micError) {
          console.error("Microphone init failed", micError);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e.message || "Connection failed");
        }
      }
    };

    connectRoom();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      stopMicRef.current?.();
      stopSpeakRef.current?.();

      try {
        screenTrackRef.current?.stop?.();
        screenTrackRef.current?.mediaStreamTrack?.stop?.();
      } catch (e) {
        console.warn("Screen track cleanup failed", e);
      }

      // Only disconnect the Room THIS run created — never a Room a
      // different (e.g. later) effect run may have already put in roomRef.
      localRoom?.disconnect();
      if (roomRef.current === localRoom) {
        roomRef.current = null;
      }
    };
  }, [broadcastData, name, roomCode, updateParticipants, pushReaction]);

  const handleMicClick = () => {
    if (speaking) {
      stopSpeakRef.current?.();
      setStage("idle");
      return;
    }

    if (listening) {
      stopMicRef.current?.();
      setStage("idle");
      return;
    }

    // The assistant panel's mic and this mic can't both hold the browser's
    // microphone at once — release the assistant's mic first if it's on.
    if (assistantMicRef.current.active) {
      assistantMicRef.current.stop?.();
    }

    setStage("listening");
    startMic();
  };

  const handleToggleVideo = async () => {
    const room = roomRef.current;
    if (!isRoomReady(room)) return;

    const next = !videoEnabled;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setVideoEnabled(next);
    } catch (e) {
      console.error("Failed to toggle camera", e);
    }
  };

  const handleToggleHand = async () => {
    const next = !handRaised;
    setHandRaised(next);
    setRaisedHands((h) => ({ ...h, [name]: next }));
    await broadcastData("hand", { identity: name, raised: next });
  };

  const handleReact = async (emoji) => {
    pushReaction(emoji);
    await broadcastData("reaction", { emoji });
  };

  const handleSendChat = async ({ text, scope, to }) => {
    const message = {
      id: `${Date.now()}-${chatMessageId++}`,
      sender: name,
      text,
      sourceLang: myLangRef.current,
      scope,
      to: scope === "private" ? to : undefined,
      ts: Date.now(),
    };

    setChatMessages((messages) => [...messages, message]);
    await broadcastData("chat", message);
  };

  const handleToggleScreenShare = async () => {
    const room = roomRef.current;
    if (!isRoomReady(room)) return;

    if (screenTrackRef.current) {
      const trackToStop = screenTrackRef.current;
      // Reset local truth immediately — even if unpublish below fails,
      // we never want to get stuck re-entering the "stop" branch forever.
      screenTrackRef.current = null;

      try {
        await room.localParticipant.unpublishTrack(trackToStop);
      } catch (e) {
        console.error("Failed to unpublish screen share", e);
      } finally {
        try {
          trackToStop.mediaStreamTrack?.stop?.();
          trackToStop.stop?.();
        } catch (e) {
          console.warn("Screen track cleanup failed", e);
        }
        setScreenSharing(false);
        updateParticipants();
      }
      return;
    }

    try {
      const tracks = await room.localParticipant.createScreenTracks({
        audio: false,
      });

      const track = Array.isArray(tracks) ? tracks[0] : tracks;
      if (!track) return;

      screenTrackRef.current = track;

      const mediaStreamTrack = track.mediaStreamTrack;
      if (mediaStreamTrack) {
        mediaStreamTrack.onended = async () => {
          const trackToStop = screenTrackRef.current;
          screenTrackRef.current = null;

          try {
            if (trackToStop && isRoomReady(roomRef.current)) {
              await roomRef.current.localParticipant.unpublishTrack(
                trackToStop,
              );
            }
          } catch (e) {
            console.error("Failed to stop screen share after end", e);
          } finally {
            try {
              trackToStop?.stop?.();
              trackToStop?.mediaStreamTrack?.stop?.();
            } catch (e) {
              console.warn("Failed to stop screen cleanup", e);
            }
            setScreenSharing(false);
            updateParticipants();
          }
        };
      }

      await room.localParticipant.publishTrack(track, {
        source: Track.Source.ScreenShare,
      });

      setScreenSharing(true);
      updateParticipants();
    } catch (e) {
      console.error("Failed to start screen share", e);
      // publishTrack or createScreenTracks failed — make sure we don't
      // leave a half-created track referenced.
      if (screenTrackRef.current) {
        try {
          screenTrackRef.current.stop?.();
          screenTrackRef.current.mediaStreamTrack?.stop?.();
        } catch (e) {
          console.error(e);
        }
        screenTrackRef.current = null;
      }
      setScreenSharing(false);
    }
  };

  const handleRecordToggle = async () => {
    if (recording) {
      recStop();
      return;
    }
    setRecordingConsentOpen(true);
  };

  const confirmRecording = async () => {
    setRecordingConsentOpen(false);
    await recStart();
  };

  const handleCreatePoll = async ({ question, options }) => {
    const poll = {
      id: `${Date.now()}-${pollMessageId++}`,
      question,
      options,
      createdBy: name,
      status: "open",
      votes: {},
      ts: Date.now(),
    };

    setPolls((items) => [...items, poll]);
    await broadcastData("poll-create", poll);
  };

  const handleVotePoll = async (pollId, option) => {
    setPolls((items) =>
      items.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              votes: {
                ...poll.votes,
                [name]: option,
              },
            }
          : poll,
      ),
    );

    await broadcastData("poll-vote", {
      pollId,
      voter: name,
      option,
    });
  };

  const handleClosePoll = async (pollId) => {
    setPolls((items) =>
      items.map((poll) =>
        poll.id === pollId ? { ...poll, status: "closed" } : poll,
      ),
    );

    await broadcastData("poll-close", { pollId });
  };

  const assistant = useMeetingAssistant({
    transcript: history.map((m) => `${m.speaker}: ${m.original}`).join("\n"),
    history,
  });

  const screenShareParticipant = useMemo(
    () =>
      participants.find((participant) =>
        getParticipantScreenTrack(participant),
      ),
    [participants],
  );

  const lastSpeaker = history[history.length - 1]?.speaker;

  const stageParticipant =
    participants.find((p) => p.identity === lastSpeaker) ||
    participants.find((p) => p.identity === name) ||
    participants[0];

  const featuredParticipant = screenShareParticipant || stageParticipant;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-red-600">
            Connection failed
          </h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={onLeave}
            className="mt-4 cursor-pointer text-sm text-indigo-600"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-sm text-slate-300">Connecting to room...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 h-64 overflow-hidden">
        {reactions.map((reaction) => (
          <span
            key={reaction.id}
            className="absolute bottom-0 text-3xl"
            style={{
              left: `${reaction.x}%`,
              animation: "float-up 2.5s ease-out forwards",
            }}
          >
            {reaction.emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-220px); opacity: 0; }
        }
      `}</style>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4">
          <ParticipantStrip
            participants={participants}
            stageIdentity={featuredParticipant?.identity}
            myIdentity={name}
            raisedHands={raisedHands}
            activeIdentity={lastSpeaker || featuredParticipant?.identity}
          />
        </div>

        <div className="absolute right-4 top-4 z-20">
          <div className="rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
            Room {roomCode}
          </div>
        </div>

        <div className="absolute right-4 top-16 z-20 flex items-center gap-2">
          {screenSharing && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur">
              <Presentation className="h-3.5 w-3.5" />
              Sharing
            </span>
          )}
          {recording && (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-300 backdrop-blur">
              <Circle className="h-3.5 w-3.5 fill-current animate-pulse" />
              Recording
            </span>
          )}
        </div>

        <div className="h-full pt-[116px]">
          {featuredParticipant ? (
            <ParticipantTile
              participant={featuredParticipant}
              isYou={featuredParticipant.identity === name}
              size="lg"
              raisedHand={!!raisedHands[featuredParticipant.identity]}
              micActive={
                featuredParticipant.identity === name ? listening : undefined
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Waiting for participants...
            </div>
          )}
        </div>

        {stage !== "idle" ? (
          <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-4 py-2 text-xs text-white backdrop-blur-md">
            {stage === "listening"
              ? "Listening..."
              : stage
                ? "Translating..."
                : "Speaking..."}
          </div>
        ) : null}
        {(sidebarOpen || chatOpen || pollsOpen) && (
          <button
            type="button"
            aria-label="Close overlay"
            className="fixed inset-0 z-30 cursor-default bg-black/55 backdrop-blur-sm"
            onClick={() => {
              setSidebarOpen(false);
              setChatOpen(false);
              setPollsOpen(false);
            }}
          />
        )}

        <aside
          className={`fixed inset-y-0 right-0 z-40 w-[380px] max-w-full overflow-y-auto border-l border-white/10 bg-slate-950/96 p-4 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">AI workspace</h3>
              <p className="text-xs text-slate-400">
                Assistant, language, recording
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/15"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Your language
              </h3>
              <div className="mt-3">
                <LanguageSelector value={myLang} onChange={setMyLang} />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Live translations and spoken replies are tuned to this language.
              </p>
            </div>

            <AssistantPanel
              assistant={assistant}
              recording={recording}
              onRecord={handleRecordToggle}
              recordUrl={recordUrl}
              history={history}
              onClearHistory={() => setHistory([])}
              mainMicListening={listening}
              onStopMainMic={stopMicRef.current}
              onAskMicActiveChange={handleAskMicActiveChange}
            />
          </div>
        </aside>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[390px] max-w-full overflow-y-auto border-r border-white/10 bg-slate-950/96 p-4 transition-transform duration-300 ${
            chatOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-300" />
                Meeting chat
              </h3>
              <p className="text-xs text-slate-400">
                Group and private conversations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/15"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <ChatPanel
            messages={chatMessages}
            onSend={handleSendChat}
            myName={name}
            participants={participants}
          />
        </aside>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[390px] max-w-full overflow-y-auto border-r border-white/10 bg-slate-950/96 p-4 transition-transform duration-300 ${
            pollsOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-amber-300" />
                Live polls
              </h3>
              <p className="text-xs text-slate-400">
                Create polls and vote in real time
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPollsOpen(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/15"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <PollPanel
            polls={polls}
            myName={name}
            participants={participants}
            onCreatePoll={handleCreatePoll}
            onVote={handleVotePoll}
            onClosePoll={handleClosePoll}
          />
        </aside>
      </div>

      <ControlBar
        listening={listening}
        onMicClick={handleMicClick}
        videoEnabled={videoEnabled}
        onToggleVideo={handleToggleVideo}
        handRaised={handRaised}
        onToggleHand={handleToggleHand}
        onReact={handleReact}
        participantsCount={participants.length}
        recording={recording}
        onRecord={handleRecordToggle}
        onLeave={onLeave}
        chatOpen={chatOpen}
        onToggleChat={() => {
          setChatOpen((open) => !open);
          setPollsOpen(false);
        }}
        screenSharing={screenSharing}
        onToggleScreenShare={handleToggleScreenShare}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        pollsOpen={pollsOpen}
        onTogglePolls={() => {
          setPollsOpen((open) => !open);
          setChatOpen(false);
        }}
      />

      {recordingConsentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-2xl text-red-300">
                <Circle className="h-7 w-7 fill-current" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-red-300">
                  Recording consent
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  Start recording this meeting?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Recording will capture your local meeting audio so you can
                  download it after the session. Make sure everyone in the room
                  knows the meeting is being recorded.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRecordingConsentOpen(false)}
                className="cursor-pointer rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRecording}
                className="cursor-pointer rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                I have consent - start recording
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
