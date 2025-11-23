import { getStatusInfo, normalizeStatus } from "../../utils/statusHelpers";

export default function VehicleCard({ currentCapture, darkMode }) {
  if (!currentCapture) return null;

  const info = getStatusInfo(currentCapture.status, currentCapture.modo, darkMode);
  const statusText = normalizeStatus(currentCapture.status, currentCapture.modo);
  const IconComponent = info.Icon;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-3">Último Vehículo Detectado</h3>
      <div className={`border-2 ${darkMode ? "border-gray-700 bg-gray-750" : "border-gray-300 bg-gray-50"} rounded-xl p-6 shadow-lg`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{currentCapture.vehicleInfo}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Estado de Acceso
              </p>
              <div className={`p-5 rounded-xl ${info.bg} ${info.text} border-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl uppercase tracking-wide">{statusText}</p>
                    <p className={`text-sm mt-1 ${darkMode ? "opacity-70" : "opacity-60"}`}>Modo: {currentCapture.modo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}