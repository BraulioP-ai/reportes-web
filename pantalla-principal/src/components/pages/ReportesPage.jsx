import { useState, useEffect } from "react";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { API_URL } from "../../constants/api";

export default function ReportesPage({ darkMode, onVolver }) {
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

  const registrosFiltrados = registros.filter((r) => {
    const coincidePlaca = (r.Placa || "").toLowerCase().includes(busqueda.toLowerCase());
    let coincideAcceso = true;
    if (filtroAcceso !== "Todos") {
      coincideAcceso = r.EstadoAutorizacion.toUpperCase() === filtroAcceso.toUpperCase();
    }

    const fechaRegistro = new Date(r.FechaHora);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin + "T23:59:59") : null;
    const coincideFecha =
      (!desde || fechaRegistro >= desde) && (!hasta || fechaRegistro <= hasta);

    return coincidePlaca && coincideAcceso && coincideFecha;
  });

  const exportarExcel = () => {
    if (!registrosFiltrados || registrosFiltrados.length === 0) {
      alert("No hay registros para exportar");
      return;
    }
    const headers = "Placa,Fecha/Hora,Estado,Modo,Guardia,Propietario\n";
    const csv = registrosFiltrados
      .map((r) =>
        `${r.Placa},${new Date(r.FechaHora).toLocaleString("es-MX")},${r.EstadoAutorizacion},${r.ModoAcceso},${r.GuardiaNombre || '-'},${r.NombreCompleto || "Visitante"}`
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" /> Historial de Accesos Vehiculares
            </h2>
            <button
              onClick={onVolver}
              className={`${
                darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
              } px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold`}
            >
              <ArrowLeft className="w-5 h-5" /> Volver al Monitor
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <div>
              <label className="block text-sm font-semibold mb-2">Buscar Placa</label>
              <input
                type="text"
                placeholder="ABC123A"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`pl-3 w-full p-2 rounded-lg border ${
                  darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Estado</label>
              <select
                value={filtroAcceso}
                onChange={(e) => setFiltroAcceso(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
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
                  darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
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
                  darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <th className="p-3 text-left font-bold">Placa</th>
                  <th className="p-3 text-left font-bold">Fecha/Hora</th>
                  <th className="p-3 text-left font-bold">Estado</th>
                  <th className="p-3 text-left font-bold">Modo</th>
                  <th className="p-3 text-left font-bold">Guardia</th>
                  <th className="p-3 text-left font-bold">Propietario</th>
                  <th className="p-3 text-left font-bold">Vehículo</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((registro) => (
                    <tr key={registro.RegistroID} className={`${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} border-b transition-colors`}>
                      <td className="p-3 font-mono font-bold">{registro.Placa}</td>
                      <td className="p-3">{new Date(registro.FechaHora).toLocaleString("es-MX")}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          registro.EstadoAutorizacion === "AUTORIZADO"
                            ? darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"
                            : registro.EstadoAutorizacion === "MANUAL"
                            ? darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"
                            : darkMode ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {registro.EstadoAutorizacion}
                        </span>
                      </td>
                      <td className="p-3">{registro.ModoAcceso}</td>
                      <td className="p-3 font-semibold">
                        {registro.ModoAcceso === 'MANUAL' && registro.GuardiaNombre
                          ? registro.GuardiaNombre
                          : '-'}
                      </td>
                      <td className="p-3">{registro.NombreCompleto || "Visitante"}</td>
                      <td className="p-3">{registro.Marca ? `${registro.Marca} ${registro.Modelo || ""}`.trim() : "No registrado"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      {registros.length === 0 ? "Cargando registros..." : "No hay registros que coincidan con los filtros"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}