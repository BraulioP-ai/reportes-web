import { History } from "lucide-react";
import { getStatusInfo, normalizeStatus } from "../../utils/statusHelpers";

export default function ActivityList({ events, darkMode }) {
  return (
    <div className={`lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-md`}>
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <History /> Actividad Reciente
      </h2>
      <div className="overflow-y-auto max-h-[650px] space-y-3 pr-2">
        {events.map((ev, i) => {
          const info = getStatusInfo(ev.status, ev.modo, darkMode);
          const IconComponent = info.Icon;
          
          return (
            <div key={i} className={`border ${darkMode ? "border-gray-700" : "border-gray-200"} p-3 flex items-center gap-3 rounded-xl ${info.bg} ${info.text}`}>
              <div>
                <IconComponent className="w-5 h-5" />
              </div>
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
  );
}