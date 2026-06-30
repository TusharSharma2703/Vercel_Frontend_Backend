import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState(25);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const { data } = await api.post("/rooms", { name: roomName, durationMinutes: Number(duration) });
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setJoining(true);
    try {
      const code = joinCode.trim().toUpperCase();
      await api.get(`/rooms/${code}`); // verify it exists first
      navigate(`/room/${code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-bold text-lg">FocusRoom</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">Hi, {user?.name?.split(" ")[0]}</span>
          <button
            onClick={logout}
            className="text-sm text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-2">Let's get focused 🔥</h1>
        <p className="text-white/50 mb-10">Create a room and invite teammates, or join one with a code.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={handleCreate} className="bg-panel border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span>✨</span> Create a Room
            </h2>
            <input
              type="text"
              placeholder="Room name e.g. Deep Work Squad"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition"
            />
            <div>
              <label className="text-sm text-white/50">Session length (minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition"
              />
            </div>
            <button
              disabled={creating}
              className="w-full bg-accent hover:opacity-90 transition rounded-lg py-2.5 font-semibold disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Room"}
            </button>
          </form>

          <form onSubmit={handleJoin} className="bg-panel border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span>🔑</span> Join a Room
            </h2>
            <p className="text-white/50 text-sm">Got a 6-character code from a friend? Enter it below.</p>
            <input
              type="text"
              placeholder="e.g. 7K2QXM"
              required
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent2 transition tracking-[0.3em] font-mono text-center text-lg"
            />
            <button
              disabled={joining}
              className="w-full bg-accent2 text-ink hover:opacity-90 transition rounded-lg py-2.5 font-semibold disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>

        {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
      </main>
    </div>
  );
}
