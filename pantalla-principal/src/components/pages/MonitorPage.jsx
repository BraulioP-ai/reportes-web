import ManualEntry from "../monitor/ManualEntry";
import CameraView from "../monitor/CameraView";
import VehicleCard from "../monitor/VehicleCard";
import ActivityList from "../monitor/ActivityList";
import { useRegistros } from "../../hooks/useRegistros";

export default function MonitorPage({ darkMode, usuario }) {
  const { currentCapture, events, fetchRegistros } = useRegistros(usuario);

    console.log("MonitorPage - currentCapture:", currentCapture);
    console.log("MonitorPage - events:", events);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-7 gap-8 p-6 w-full">
      <ManualEntry darkMode={darkMode} usuario={usuario} onSuccess={fetchRegistros} />
      
      <div className={`lg:col-span-3 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md space-y-6`}>
        <CameraView darkMode={darkMode} />
        <VehicleCard currentCapture={currentCapture} darkMode={darkMode} />
      </div>

      <ActivityList events={events} darkMode={darkMode} />
    </main>
  );
}