import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = localToken || sessionToken;

      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data.user);
        } catch {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const res = await API.post("/auth/login", {email, password,});

      // Remove old tokens first
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Remember Me checked
      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
      } 
      // Remember Me unchecked
      else {
        sessionStorage.setItem("token", res.data.token);
      }
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data || {
        message: "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);

      // Registration remains persistent
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data || {
        message: "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{user, loading, login, register, logout,}}>
      {children}
    </AuthContext.Provider>
  );
};