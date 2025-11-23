import { ShieldCheck, ShieldAlert, ShieldQuestion, NotebookPen } from "lucide-react";

export const normalizeStatus = (status, modo) => {
  const s = (status || "").toLowerCase().trim();
  const m = (modo || "").toLowerCase().trim();
  if (m === "manual" || s === "manual") return "manual";
  if (s === "autorizado" || s === "permitido") return "autorizado";
  if (s.includes("denegado") || s.includes("no autorizado")) return "no autorizado";
  if (s.includes("no reconocido")) return "no reconocido";
  return "no reconocido";
};

export const getStatusInfo = (status, modo, darkMode) => {
  const s = normalizeStatus(status, modo);
  
  const configs = {
    manual: {
      light: { text: "text-blue-700", bg: "bg-blue-200", icon: NotebookPen },
      dark: { text: "text-blue-300", bg: "bg-blue-900", icon: NotebookPen }
    },
    autorizado: {
      light: { text: "text-green-700", bg: "bg-green-100", icon: ShieldCheck },
      dark: { text: "text-green-300", bg: "bg-green-900", icon: ShieldCheck }
    },
    "no autorizado": {
      light: { text: "text-red-700", bg: "bg-red-100", icon: ShieldAlert },
      dark: { text: "text-red-300", bg: "bg-red-900", icon: ShieldAlert }
    },
    "no reconocido": {
      light: { text: "text-yellow-700", bg: "bg-yellow-100", icon: ShieldQuestion },
      dark: { text: "text-yellow-300", bg: "bg-yellow-900", icon: ShieldQuestion }
    }
  };

  const config = configs[s] || {
    light: { text: "text-gray-700", bg: "bg-gray-100", icon: ShieldQuestion },
    dark: { text: "text-gray-300", bg: "bg-gray-800", icon: ShieldQuestion }
  };

  const selected = darkMode ? config.dark : config.light;
  
  return {
    text: selected.text,
    bg: selected.bg,
    Icon: selected.icon
  };
};