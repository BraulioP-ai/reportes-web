import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import Header from "./components/layout/Header";
import MonitorPage from "./components/pages/MonitorPage";
import ReportesPage from "./components/pages/ReportesPage";
import GuardiasPage from "./components/pages/GuardiasPage";
import { useDarkMode } from "./hooks/useDarkMode";
import { useBackendStatus } from "./hooks/useBackendStatus";
import VehiculosPage from "./components/pages/VehiculosPage";


function App() {
  const [usuario, setUsuario] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vistaActual, setVistaActual] = useState("monitor");
  
  const { darkMode, toggleDarkMode } = useDarkMode();
  const backendStatus = useBackendStatus();

  const handleLogin = (u) => setUsuario(u);
  const handleLogout = () => {
    setUsuario(null);
    setVistaActual("monitor");
  };

  // Reloj
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  if (!usuario) return <LoginPage onLogin={handleLogin} />;

  // 🔍 DEBUG - Borra esto después
  console.log("Usuario logueado:", usuario);
  console.log("Vista actual:", vistaActual);

  return (
    <div className={`min-h-screen w-full ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"} flex flex-col`}>
      <Header
        usuario={usuario}
        backendStatus={backendStatus}
        currentTime={currentTime}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onNavigate={setVistaActual}
      />

      {vistaActual === "monitor" && (
        <MonitorPage darkMode={darkMode} usuario={usuario} />
      )}
      {vistaActual === "reportes" && (
        <ReportesPage darkMode={darkMode} onVolver={() => setVistaActual("monitor")} />
      )}
      {vistaActual === "guardias" && (
        <GuardiasPage darkMode={darkMode} onVolver={() => setVistaActual("monitor")} />
      )}
      {vistaActual === "vehiculos" && (
        <VehiculosPage darkMode={darkMode} onVolver={() => setVistaActual("monitor")} />
      )}
    </div>
  );
}

export default App;
