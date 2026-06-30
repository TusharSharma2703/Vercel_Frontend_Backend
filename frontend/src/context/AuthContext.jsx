import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("focusroom_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("focusroom_user");
    if (savedUser && token) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("focusroom_token", data.token);
    localStorage.setItem("focusroom_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("focusroom_token", data.token);
    localStorage.setItem("focusroom_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("focusroom_token");
    localStorage.removeItem("focusroom_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
