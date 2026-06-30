import React from "react";

const colors = ["#7c5cff", "#22d3ee", "#34d399", "#f59e0b", "#ec4899", "#60a5fa"];

function colorFor(name) {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function timeAgo(joinedAt) {
  const mins = Math.floor((Date.now() - joinedAt) / 60000);
  if (mins < 1) return "just joined";
  return `${mins}m in session`;
}

export default function ParticipantCard({ participant, isSelf, onReact }) {
  return (
    <div className="bg-panel border border-white/5 rounded-xl p-4 flex items-center gap-3 relative">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-ink shrink-0"
        style={{ backgroundColor: colorFor(participant.name) }}
      >
        {participant.name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{participant.name}</p>
          {isSelf && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">you</span>}
        </div>
        <p className="text-sm text-white/50 truncate">{participant.task}</p>
        <p className="text-[11px] text-white/30">{timeAgo(participant.joinedAt)}</p>
      </div>
      {!isSelf && (
        <button
          onClick={() => onReact(participant.userId)}
          title="Send a silent nudge"
          className="text-lg hover:scale-125 transition shrink-0"
        >
          👍
        </button>
      )}
    </div>
  );
}
