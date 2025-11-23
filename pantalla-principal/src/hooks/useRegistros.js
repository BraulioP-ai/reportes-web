import { useState, useEffect } from "react";
import { API_URL } from "../constants/api";

export const useRegistros = (usuario) => {
  const [currentCapture, setCurrentCapture] = useState(null);
  const [events, setEvents] = useState([]);

  const fetchRegistros = async () => {
    try {
      const r = await fetch(API_URL + "/registros");
      const data = await r.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const last = data[0];
        setCurrentCapture({
          plateNumber: last.Placa,
          status: last.EstadoAutorizacion,
          modo: last.ModoAcceso,
          owner: last.NombreCompleto || "Visitante",
          vehicleInfo: last.Marca || last.Modelo 
            ? `${last.Marca || "Sin marca"} ${last.Modelo || ""}`.trim() 
            : "No registrado",
        });
        
        setEvents(
          data.slice(0, 25).map((e) => ({
            plate: e.Placa,
            status: e.EstadoAutorizacion,
            modo: e.ModoAcceso,
            timestamp: new Date(e.FechaHora).toLocaleTimeString("es-MX"),
          }))
        );
      }
    } catch (e) {
      console.error("❌ Error obteniendo registros:", e);
      setEvents([]); // Asegurar que siempre sea array
    }
  };

  useEffect(() => {
    if (!usuario) return;
    fetchRegistros();
    const interval = setInterval(fetchRegistros, 6000);
    return () => clearInterval(interval);
  }, [usuario]);

  return { currentCapture, events, fetchRegistros };
};