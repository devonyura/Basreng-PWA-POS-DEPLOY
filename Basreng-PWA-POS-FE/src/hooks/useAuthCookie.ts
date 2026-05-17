import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth as useAuthFromContext } from "../context/AuthContext";
export type { BranchData } from "../context/AuthContext";

export const useAuth = () => {
  const context = useAuthFromContext();
  const history = useHistory();
  const { token } = context;

  useEffect(() => {
    // Jika tidak ada token dan bukan di halaman login, redirect ke login
    if (!token && window.location.pathname !== "/login") {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token, history]);

  return context;
};
