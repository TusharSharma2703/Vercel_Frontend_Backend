import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import api, { API_BASE_URL } from "../api";
import Timer from "../components/Timer.jsx";
import ParticipantCard from "../components/ParticipantCard.jsx";

const EMOJIS = ["👍", "🔥", "💪", "☕", "👏", "🚀"];

export default function Room() {
  const { code } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [task, setTask] = useState("Getting focused...");
  const [notices, setNotices] = useState([]);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const socketRef = useRef(null);

  // Load room details
  useEffect(() => {
    api
      .get(`/rooms/${code}`)
      .then(({ data }) => setRoom(data.room))
      .catch(() => setError("Room not found or has ended"));
  }, [code]);

  // Connect socket once room is confirmed
  useEffect(() => {
    if (!room) return;

    const socket = io(API_BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", { roomCode: code, task });
    });

    socket.on("room:participants", (list) => setParticipants(list));

    socket.on("room:notice", (notice) => {
      setNotices((prev) => [...prev.slice(-4), { ...notice, id: Date.now() }]);
    });

    socket.on("reaction:receive", (reaction) => {
      const id = Date.now() + Math.random();
      setFloatingReactions((prev) => [...prev, { ...reaction, id }]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 1800);
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const updateTask = (newTask) => {
    setTask(newTask);
    socketRef.current?.emit("task:update", { task: newTask });
  };

  const sendReaction = (emoji, targetUserId) => {
    socketRef.current?.emit("reaction:send", { emoji, targetUserId });
  };

  const handleSessionComplete = () => {
    socketRef.current?.emit("session:complete");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const leaveRoom = () => {
    socketRef.current?.disconnect();
    navigate("/");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-ink">
        <p className="mb-4 text-xl">{error}</p>
        <button onClick={() => navigate("/")} className="px-5 py-2 font-semibold rounded-lg bg-accent">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!room) {
    return <div className="flex items-center justify-center min-h-screen bg-ink text-white/50">Loading room...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* Floating reactions layer */}
      <div className="fixed z-50 flex flex-col items-end gap-1 pointer-events-none bottom-24 right-8">
        {floatingReactions.map((r) => (
          <div key={r.id} className="text-3xl reaction-float">
            {r.emoji} <span className="text-xs align-middle text-white/40">{r.fromName}</span>
          </div>
        ))}
      </div>

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div>
          <h1 className="text-lg font-bold">{room.name}</h1>
          <button
            onClick={copyCode}
            className="font-mono text-xs tracking-widest transition text-white/40 hover:text-accent2"
          >
            CODE: {code} {copied ? "✓ copied" : "(click to copy)"}
          </button>
        </div>
        <button
          onClick={leaveRoom}
          className="text-sm border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition"
        >
          Leave Room
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[280px_1fr] gap-10">
        {/* Timer + task panel */}
        <div className="flex flex-col items-center gap-6">
          <Timer
            durationMinutes={room.durationMinutes}
            startedAt={room.startedAt}
            onComplete={handleSessionComplete}
          />
          <div className="w-full">
            <label className="text-xs text-white/40">What are you working on?</label>
            <input
              value={task}
              onChange={(e) => updateTask(e.target.value)}
              placeholder="e.g. Writing report"
              className="w-full px-3 py-2 mt-1 text-sm transition border rounded-lg outline-none bg-white/5 border-white/10 focus:border-accent"
            />
          </div>
          <div className="w-full">
            <p className="mb-2 text-xs text-white/40">Send a nudge to everyone</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji, null)}
                  className="w-10 h-10 text-xl transition border rounded-lg bg-white/5 hover:bg-white/10 border-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Participants + activity */}
        <div>
          <h2 className="flex items-center gap-2 mb-3 font-semibold">
            <span className="w-2 h-2 rounded-full bg-focus pulse-ring" />
            Live in this room ({participants.length})
          </h2>
          <div className="grid gap-3 mb-8 sm:grid-cols-2">
            {participants.map((p) => (
              <ParticipantCard
                key={p.socketId}
                participant={p}
                isSelf={p.userId === user.id}
                onReact={(targetUserId) => sendReaction("👍", targetUserId)}
              />
            ))}
          </div>

          <h2 className="mb-3 text-sm font-semibold text-white/60">Activity</h2>
          <div className="space-y-1.5">
            {notices.length === 0 && <p className="text-sm text-white/30">No activity yet.</p>}
            {notices.map((n) => (
              <p key={n.id} className="text-sm text-white/50">
                {n.type === "join" && "🟢"} {n.type === "leave" && "⚪"} {n.type === "complete" && "🎉"} {n.message}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
