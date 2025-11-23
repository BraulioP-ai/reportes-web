import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { API_URL } from "../../constants/api";
import { validatePlate } from "../../utils/validators";

export default function ManualEntry({ darkMode, usuario, onSuccess }) {
  const [manualPlate, setManualPlate] = useState("");
  const [plateError, setPlateError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
      onSuccess();
    } catch (e) {
      console.error("❌ Error al registrar manual:", e);
      setPlateError("Error al registrar acceso manual");
    }
  };

  return (
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
      <button 
        onClick={registrarAccesoManual} 
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 mt-4 rounded-lg transition-colors"
      >
        Registrar
      </button>
    </div>
  );
}