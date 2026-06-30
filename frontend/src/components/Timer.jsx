import React, { useEffect, useMemo, useState } from "react";

export default function Timer({ durationMinutes, startedAt, onComplete }) {
  const totalSeconds = durationMinutes * 60;

  const endTime = useMemo(() => {
    const start = startedAt ? new Date(startedAt).getTime() : Date.now();
    return start + totalSeconds * 1000;
  }, [startedAt, totalSeconds]);

  const computeRemaining = () => Math.max(0, Math.round((endTime - Date.now()) / 1000));

  const [secondsLeft, setSecondsLeft] = useState(computeRemaining);
  const [completed, setCompleted] = useState(secondsLeft <= 0);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!completed) {
        setCompleted(true);
        onComplete?.();
      }
      return;
    }
    const interval = setInterval(() => {
      const remaining = computeRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="absolute w-48 h-48 -rotate-90">
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
        <div className="font-mono text-4xl font-bold">
          {mins}:{secs}
        </div>
        <div className="mt-1 text-xs text-white/40">{completed ? "Session complete!" : "remaining"}</div>
      </div>
    </div>
  );
}