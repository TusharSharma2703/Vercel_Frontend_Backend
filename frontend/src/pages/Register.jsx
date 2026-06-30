import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm bg-panel rounded-2xl p-8 shadow-glow border border-white/5">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🚀</div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Join FocusRoom in seconds</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-accent transition"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-accent hover:opacity-90 transition rounded-lg py-2.5 font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
