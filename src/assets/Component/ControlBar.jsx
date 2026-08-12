import { useMemo, useState } from "react";
import {
  BarChart3,
  Circle,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MonitorX,
  MoreHorizontal,
  PhoneOff,
  PanelRightOpen,
  SmilePlus,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "👏", "🎉"];

function ToolbarButton({
  onClick,
  active = false,
  danger = false,
  compact = false,
  badge,
  label,
  children,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      className={`group relative flex min-w-[50px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium leading-none transition duration-200 ${
        danger
          ? "bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-white"
          : active
            ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
            : "text-slate-300 hover:bg-white/8 hover:text-white"
      } ${compact ? "min-w-[44px] px-2" : ""}`}
    >
      {badge ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-semibold text-white">
          {badge}
        </span>
      ) : null}

      <span className="flex h-4 w-4 items-center justify-center transition duration-200 group-hover:scale-110">
        {children}
      </span>

      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function MoreMenu({ actions }) {
  return (
    <div className="absolute bottom-full right-0 z-40 mb-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/8"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-4 w-4 items-center justify-center">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </span>

          {action.badge ? (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {action.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default function ControlBar({
  listening,
  onMicClick,
  videoEnabled,
  onToggleVideo,
  handRaised,
  onToggleHand,
  onReact,
  participantsCount,
  recording,
  onRecord,
  onLeave,
  chatOpen,
  onToggleChat,
  screenSharing,
  onToggleScreenShare,
  onToggleSidebar,
  sidebarOpen,
  pollsOpen,
  onTogglePolls,
}) {
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const compactActions = useMemo(
    () => [
      {
        label: chatOpen ? "Hide Chat" : "Chat",
        icon: <MessageSquare className="h-4 w-4" />,
        onClick: () => {
          onToggleChat();
          setMoreOpen(false);
        },
      },
      {
        label: screenSharing ? "Stop Share" : "Share Screen",
        icon: screenSharing ? (
          <MonitorX className="h-4 w-4" />
        ) : (
          <MonitorUp className="h-4 w-4" />
        ),
        onClick: async () => {
          await onToggleScreenShare();
          setMoreOpen(false);
        },
      },
      {
        label: pollsOpen ? "Hide Polls" : "Polls",
        icon: <BarChart3 className="h-4 w-4" />,
        onClick: () => {
          onTogglePolls();
          setMoreOpen(false);
        },
      },
      {
        label: sidebarOpen ? "Hide AI" : "AI Panel",
        icon: <PanelRightOpen className="h-4 w-4" />,
        onClick: () => {
          onToggleSidebar();
          setMoreOpen(false);
        },
      },
      {
        label: recording ? "Stop Record" : "Record",
        icon: <Circle className={`h-4 w-4 ${recording ? "fill-current" : ""}`} />,
        onClick: () => {
          onRecord();
          setMoreOpen(false);
        },
      },
    ],
    [
      chatOpen,
      onRecord,
      onToggleChat,
      onTogglePolls,
      onToggleScreenShare,
      onToggleSidebar,
      pollsOpen,
      recording,
      screenSharing,
      sidebarOpen,
    ],
  );

  return (
    <div className="border-t border-white/10 bg-[#1c1c1c]/95 px-2 py-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="hidden items-center gap-1 text-[10px] text-slate-400 md:flex">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          Live meeting controls
        </div>

        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-1.5">
          <ToolbarButton
            onClick={onMicClick}
            active={listening}
            label="Talk"
          >
            {listening ? (
              <MicOff className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>

          <ToolbarButton
            onClick={onToggleVideo}
            active={videoEnabled}
            label="Video"
          >
            {videoEnabled ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <VideoOff className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>

          <ToolbarButton
            onClick={onToggleHand}
            active={handRaised}
            label="Hand"
          >
            <Hand className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="relative">
            <ToolbarButton
              onClick={() => {
                setReactionsOpen((open) => !open);
                setMoreOpen(false);
              }}
              active={reactionsOpen}
              label="React"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </ToolbarButton>

            {reactionsOpen ? (
              <div className="absolute bottom-full left-1/2 z-30 mb-2 flex -translate-x-1/2 gap-1 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(emoji);
                      setReactionsOpen(false);
                    }}
                    className="cursor-pointer rounded-xl p-2 text-lg transition hover:scale-110 hover:bg-white/8"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <ToolbarButton label="People" badge={participantsCount}>
            <Users className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="hidden sm:block">
            <ToolbarButton
              onClick={onToggleChat}
              active={chatOpen}
              label="Chat"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <div className="hidden md:block">
            <ToolbarButton
              onClick={onToggleScreenShare}
              active={screenSharing}
              label="Share"
            >
              {screenSharing ? (
                <MonitorX className="h-3.5 w-3.5" />
              ) : (
                <MonitorUp className="h-3.5 w-3.5" />
              )}
            </ToolbarButton>
          </div>

          <div className="hidden md:block">
            <ToolbarButton
              onClick={onTogglePolls}
              active={pollsOpen}
              label="Polls"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <div className="hidden lg:block">
            <ToolbarButton
              onClick={onToggleSidebar}
              active={sidebarOpen}
              label="AI"
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <div className="hidden md:block">
            <ToolbarButton
              onClick={onRecord}
              active={recording}
              label="Rec"
            >
              <Circle
                className={`h-3.5 w-3.5 ${recording ? "fill-current" : ""}`}
              />
            </ToolbarButton>
          </div>

          <div className="relative sm:hidden">
            <ToolbarButton
              onClick={() => {
                setMoreOpen((open) => !open);
                setReactionsOpen(false);
              }}
              active={moreOpen}
              compact
              label="More"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </ToolbarButton>

            {moreOpen ? <MoreMenu actions={compactActions} /> : null}
          </div>
        </div>

        <ToolbarButton onClick={onLeave} danger label="Leave">
          <PhoneOff className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
    </div>
  );
}
