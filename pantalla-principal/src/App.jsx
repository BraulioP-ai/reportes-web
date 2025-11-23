import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import {
  Video,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  History,
  CheckCircle,
  NotebookPen,
  Moon,
  Sun,
  FileText,
  Download,
  Search,
  Calendar,
} from "lucide-react";

const API_URL = "http://localhost:3000";

// ============================================
// COMPONENTE REPORTES
// ============================================
function ReportesPage({ darkMode }) {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAcceso, setFiltroAcceso] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const r = await fetch(API_URL + "/registros");
      const data = await r.json();
      setRegistros(data);
    } catch (e) {
      console.error("❌ Error obteniendo reportes:", e);
    }
  };

  // Filtrar registros
  const registrosFiltrados = (registros || []).filter((r) => {
    const coincidePlaca = (r.Placa || "").toLowerCase().includes(busqueda.toLowerCase());
    
    let coincideAcceso = true;
    if (filtroAcceso !== "Todos") {
      const estado = (r.EstadoAutorizacion || "").toUpperCase();
      coincideAcceso = estado === filtroAcceso.toUpperCase();
    }

    const fechaRegistro = new Date(r.FechaHora);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin + "T23:59:59") : null;
    const coincideFecha =
      (!desde || fechaRegistro >= desde) && (!hasta || fechaRegistro <= hasta);

    return coincidePlaca && coincideAcceso && coincideFecha;
  });

  const exportarPDF = () => {
    alert("Función de exportar PDF - Implementar con jsPDF o similar");
  };

  const exportarExcel = () => {
    if (!registrosFiltrados || registrosFiltrados.length === 0) {
      alert("No hay registros para exportar");
      return;
    }
    
    // Crear CSV simple
    const headers = "Placa,Fecha/Hora,Estado,Modo,Propietario\n";
    const csv = registrosFiltrados
      .map((r) =>
        `${r.Placa},${new Date(r.FechaHora).toLocaleString("es-MX")},${r.EstadoAutorizacion},${r.ModoAcceso},${r.NombreCompleto || "Visitante"}`
      )
      .join("\n");
    
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reportes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6`}>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Historial de Accesos Vehiculares
          </h2>

          {/* FILTROS */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <div>
              <label className="block text-sm font-semibold mb-2">Buscar Placa</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ABC123A"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={`pl-10 w-full p-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Estado</label>
              <select
                value={filtroAcceso}
                onChange={(e) => setFiltroAcceso(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option>Todos</option>
                <option>AUTORIZADO</option>
                <option>NO_RECONOCIDO</option>
                <option>MANUAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* BOTONES EXPORTAR */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={exportarPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <th className="p-3 text-left font-bold">Placa</th>
                  <th className="p-3 text-left font-bold">Fecha/Hora</th>
                  <th className="p-3 text-left font-bold">Estado</th>
                  <th className="p-3 text-left font-bold">Modo</th>
                  <th className="p-3 text-left font-bold">Propietario</th>
                  <th className="p-3 text-left font-bold">Vehículo</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados && registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((registro) => (
                  <tr
                    key={registro.RegistroID}
                    className={`border-b ${
                      darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="p-3 font-mono font-bold">{registro.Placa || "N/A"}</td>
                    <td className="p-3">{new Date(registro.FechaHora).toLocaleString("es-MX")}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          registro.EstadoAutorizacion === "AUTORIZADO"
                            ? darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"
                            : registro.EstadoAutorizacion === "MANUAL"
                            ? darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"
                            : darkMode ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {registro.EstadoAutorizacion || "DESCONOCIDO"}
                      </span>
                    </td>
                    <td className="p-3">{registro.ModoAcceso || "N/A"}</td>
                    <td className="p-3">{registro.NombreCompleto || "Visitante"}</td>
                    <td className="p-3">
                      {registro.Marca || registro.Modelo
                        ? `${registro.Marca || ""} ${registro.Modelo || ""}`.trim()
                        : "No registrado"}
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      {registros.length === 0 ? "Cargando registros..." : "No hay registros que coincidan con los filtros"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {registrosFiltrados?.length || 0} de {registros?.length || 0} registros
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
  const [usuario, setUsuario] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCapture, setCurrentCapture] = useState(null);
  const [events, setEvents] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Desconectado ❌");
  const [darkMode, setDarkMode] = useState(false);
  const [vistaActual, setVistaActual] = useState("monitor"); // "monitor" o "reportes"

  const [manualPlate, setManualPlate] = useState("");
  const [plateError, setPlateError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = (u) => setUsuario(u);
  const handleLogout = () => {
    setUsuario(null);
    setVistaActual("monitor");
  };
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ---------------- CHECK BACKEND ----------------
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(API_URL + "/");
        if (!r.ok) throw new Error();
        setBackendStatus("Conectado ✅");
      } catch {
        setBackendStatus("Desconectado ❌");
      }
    };

    check();
    const int = setInterval(check, 5000);
    return () => clearInterval(int);
  }, []);

  // ---------------- OBTENER REGISTROS ----------------
  const fetchRegistros = async () => {
    try {
      const r = await fetch(API_URL + "/registros");
      const data = await r.json();

      if (data.length > 0) {
        const last = data[0];

        setCurrentCapture({
          plateNumber: last.Placa,
          status: last.EstadoAutorizacion,
          modo: last.ModoAcceso,
          owner: last.NombreCompleto || "Visitante",
          vehicleInfo:
            last.Marca || last.Modelo
              ? `${last.Marca || "Sin marca"} ${last.Modelo || ""}`.trim()
              : "No registrado",
          imageUrl: "https://placehold.co/350x120?text=" + (last.Placa || "PLACA"),
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
    }
  };

  useEffect(() => {
    if (!usuario) return;

    fetchRegistros();
    const int = setInterval(fetchRegistros, 6000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(int);
      clearInterval(clock);
    };
  }, [usuario]);

  // ---------------- NORMALIZAR ESTADOS ----------------
  const normalizeStatus = (status, modo) => {
    const s = (status || "").toLowerCase().trim();
    const m = (modo || "").toLowerCase().trim();

    if (m === "manual") return "manual";
    if (s === "manual") return "manual";

    if (s === "autorizado" || s === "permitido") return "autorizado";
    if (s.includes("denegado") || s.includes("no autorizado")) return "no autorizado";
    if (s.includes("no reconocido")) return "no reconocido";

    return "no reconocido";
  };

  // ---------------- INFO DE ESTADOS (CON MODO OSCURO) ----------------
  const getStatusInfo = (status, modo) => {
    const s = normalizeStatus(status, modo);

    const lightMap = {
      manual: { text: "text-blue-700", bg: "bg-blue-200", Icon: <NotebookPen className="w-5 h-5" /> },
      autorizado: { text: "text-green-700", bg: "bg-green-100", Icon: <ShieldCheck className="w-5 h-5" /> },
      "no autorizado": { text: "text-red-700", bg: "bg-red-100", Icon: <ShieldAlert className="w-5 h-5" /> },
      "no reconocido": { text: "text-yellow-700", bg: "bg-yellow-100", Icon: <ShieldQuestion className="w-5 h-5" /> },
    };

    const darkMap = {
      manual: { text: "text-blue-300", bg: "bg-blue-900", Icon: <NotebookPen className="w-5 h-5" /> },
      autorizado: { text: "text-green-300", bg: "bg-green-900", Icon: <ShieldCheck className="w-5 h-5" /> },
      "no autorizado": { text: "text-red-300", bg: "bg-red-900", Icon: <ShieldAlert className="w-5 h-5" /> },
      "no reconocido": { text: "text-yellow-300", bg: "bg-yellow-900", Icon: <ShieldQuestion className="w-5 h-5" /> },
    };

    const map = darkMode ? darkMap : lightMap;
    return map[s] || {
      text: darkMode ? "text-gray-300" : "text-gray-700",
      bg: darkMode ? "bg-gray-800" : "bg-gray-100",
      Icon: <ShieldQuestion className="w-5 h-5" />,
    };
  };

  // ---------------- VALIDAR PLACA ----------------
  const validatePlate = (raw) => /^[A-Z]{3}\d{3}[A-Z]$/.test(raw.toUpperCase());

  // ---------------- REGISTRO MANUAL ----------------
  const registrarAccesoManual = async () => {
    const clean = manualPlate.toUpperCase().replace(/-/g, "");

    if (!validatePlate(clean)) {
      setPlateError("Formato inválido. Use AAA000A (Chihuahua)");
      return;
    }

    setPlateError("");

    try {
      await fetch(API_URL + "/acceso/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: clean, guardia_id: usuario.id }),
      });

      setManualPlate("");
      setSuccessMsg("✓ Registro manual exitoso");
      setTimeout(() => setSuccessMsg(""), 2000);

      fetchRegistros();
    } catch (e) {
      console.error("❌ Error al registrar manual:", e);
      setPlateError("Error al registrar acceso manual");
    }
  };

  if (!usuario) return <LoginPage onLogin={handleLogin} />;

  // SI ES VISTA DE REPORTES
  if (vistaActual === "reportes") {
    return (
      <div className="w-full m-0 p-0">
        <header className={`${darkMode ? "bg-slate-950" : "bg-slate-800"} h-16 flex items-center px-6 justify-between text-white`}>
          <h1 className="font-bold text-xl">Sistema de Placas - Reportes</h1>
          <div className="flex items-center gap-4 font-mono">
            <button
              onClick={() => setVistaActual("monitor")}
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-2 rounded-lg transition-colors"
            >
              Volver al Monitor
            </button>
            <button
              onClick={toggleDarkMode}
              className={`${darkMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-slate-700 hover:bg-slate-600"} px-3 py-2 rounded-lg transition-colors flex items-center gap-2`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700">
              Salir
            </button>
          </div>
        </header>
        <ReportesPage darkMode={darkMode} />
      </div>
    );
  }

  // VISTA DE MONITOR (ORIGINAL)
  return (
    <div className={`min-h-screen w-full ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"} flex flex-col m-0 p-0`}>
      {/* HEADER */}
      <header className={`${darkMode ? "bg-slate-950" : "bg-slate-800"} h-16 flex items-center px-6 justify-between text-white`}>
        <h1 className="font-bold text-xl">Sistema de Placas</h1>
        <div className="flex items-center gap-4 font-mono">
          <span>{backendStatus}</span>
          <span>{currentTime.toLocaleTimeString("es-MX")}</span>

          {/* BOTÓN REPORTES - SOLO PARA ADMIN Y RH */}
          {usuario && (usuario.permisoId === 1 || usuario.permisoId === 2) && (
            <button
              onClick={() => setVistaActual("reportes")}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Reportes
            </button>
          )}

          {/* TOGGLE MODO OSCURO */}
          <button
            onClick={toggleDarkMode}
            className={`${darkMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-slate-700 hover:bg-slate-600"} px-3 py-2 rounded-lg transition-colors flex items-center gap-2`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700">
            Salir
          </button>
        </div>
      </header>

      <div className="bg-cyan-500 w-full h-1" />

      {/* GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-7 gap-8 p-6 w-full">
        {/* PANEL MANUAL */}
        <div className={`lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}>
          <h2 className="text-xl font-bold mb-4">Registro Manual</h2>
          <input
            className={`border p-3 w-full rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
            placeholder="AAA000A"
            value={manualPlate}
            onChange={(e) => setManualPlate(e.target.value)}
          />
          {plateError && <p className="text-red-600 mt-2">{plateError}</p>}
          {successMsg && (
            <div className={`${darkMode ? "text-green-300 bg-green-900" : "text-green-700 bg-green-100"} mt-3 p-3 rounded-lg flex items-center gap-2`}>
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          <button onClick={registrarAccesoManual} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 mt-4 rounded-lg transition-colors">
            Registrar
          </button>
        </div>

        {/* MONITOR */}
        <div className={`lg:col-span-3 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md space-y-6`}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video /> Monitor de Acceso
          </h2>
          <div className={`${darkMode ? "bg-black" : "bg-black"} w-full aspect-video rounded-lg flex items-center justify-center text-gray-400`}>
            CÁMARA EN VIVO
          </div>

          {currentCapture && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">
                Último Vehículo Detectado
              </h3>
              <div className={`border-2 ${darkMode ? "border-gray-700 bg-gray-750" : "border-gray-300 bg-gray-50"} rounded-xl p-6 shadow-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* COLUMNA 1: INFO COMPLETA */}
                  <div className="space-y-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Placa Detectada
                      </p>
                      <p className="font-mono text-3xl font-black tracking-wider">{currentCapture.plateNumber}</p>
                    </div>
                    
                    <div className={`h-px ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
                    
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Propietario
                      </p>
                      <p className="text-lg font-semibold">{currentCapture.owner}</p>
                    </div>
                    
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Vehículo
                      </p>
                      <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {currentCapture.vehicleInfo}
                      </p>
                    </div>
                  </div>

                  {/* COLUMNA 2: ESTADO */}
                  <div className="flex flex-col justify-center">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Estado de Acceso
                      </p>
                      {(() => {
                        const info = getStatusInfo(currentCapture.status, currentCapture.modo);
                        const statusText = normalizeStatus(currentCapture.status, currentCapture.modo);
                        return (
                          <div className={`p-5 rounded-xl ${info.bg} ${info.text} border-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{info.Icon}</div>
                              <div>
                                <p className="font-bold text-2xl uppercase tracking-wide">{statusText}</p>
                                <p className={`text-sm mt-1 ${darkMode ? "opacity-70" : "opacity-60"}`}>
                                  Modo: {currentCapture.modo}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className={`lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <History /> Actividad Reciente
          </h2>

          <div className="overflow-y-auto max-h-[650px] space-y-3 pr-2">
            {events.map((ev, i) => {
              const info = getStatusInfo(ev.status, ev.modo);
              return (
                <div key={i} className={`border ${darkMode ? "border-gray-700" : "border-gray-200"} p-3 flex items-center gap-3 rounded-xl ${info.bg} ${info.text}`}>
                  <div>{info.Icon}</div>
                  <div className="flex-grow">
                    <p className="font-mono font-bold">{ev.plate}</p>
                    <p className="font-semibold">{normalizeStatus(ev.status, ev.modo)}</p>
                  </div>
                  <span className={`font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{ev.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;