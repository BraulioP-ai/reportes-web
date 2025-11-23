import { useState, useEffect } from "react";
import { API_URL } from "../constants/api";

export const useBackendStatus = () => {
  const [status, setStatus] = useState("Desconectado ❌");

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(API_URL + "/");
        if (!r.ok) throw new Error();
        setStatus("Conectado ✅");
      } catch {
        setStatus("Desconectado ❌");
      }
    };
    
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
};