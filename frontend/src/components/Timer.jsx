import React, { useEffect, useState } from "react";

export default function Timer({ durationMinutes, onComplete }) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!completed) {
        setCompleted(true);
        onComplete?.();
      }
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, completed, onComplete]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="absolute -rotate-90 w-48 h-48">
        <circle cx="96" cy="96" r={radius} stroke="#1f2533" strokeWidth="10" fill="none" />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke={completed ? "#34d399" : "#7c5cff"}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="text-center">
        <div className="text-4xl font-bold font-mono">
          {mins}:{secs}
        </div>
        <div className="text-xs text-white/40 mt-1">{completed ? "Session complete!" : "remaining"}</div>
      </div>
    </div>
  );
}
