import { AudioLines } from "lucide-react";
import { useState } from "react";

export default function Waveform() {
  const [bars] = useState(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        height: 20 + Math.random() * 80,
        delay: Math.random() * 1,
      })),
    [],
  );

  return (
    <div className="flex h-8 items-end gap-1">
      <AudioLines className="mb-1 mr-1 h-4 w-4 text-indigo-300" />
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="w-1.5 bg-indigo-400 rounded-full animate-pulse"
          style={{
            height: `${bar.height}%`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
