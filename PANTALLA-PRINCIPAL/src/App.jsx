
import { useState, useEffect } from 'react';
import LoginPage from './LoginPage'; // Importamos tu pantalla de login existente
import { Video, LogOut, ShieldCheck, ShieldAlert, ShieldQuestion, History, Check, X } from 'lucide-react';

// --- Simulación de Datos para la Pantalla Principal ---
const mockEvents = [
  { plate: 'XYZ-789', timestamp: '19:52:18', status: 'No autorizado' },
  { plate: 'DEF-456', timestamp: '19:50:34', status: 'Permitido' },
  { plate: '---', timestamp: '19:49:05', status: 'No reconocido' },
];
const mockCapture = {
  plateNumber: 'ABC-123',
  status: 'Permitido',
  owner: 'Braulio S. Porras Olivas',
  vehicleInfo: 'Nissan Sentra 2021',
  imageUrl: `https://via.placeholder.com/350x120.png?text=ABC-123`,
};
// --- Fin Simulación ---

function App() {
  const [usuario, setUsuario] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Función que se le pasa al LoginPage
  const handleLogin = (username) => {
    setUsuario(username);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setUsuario(null);
  };

  // Efecto para actualizar la hora cada segundo
  useEffect(() => {
    if (usuario) { // Solo activa el reloj si el usuario ha iniciado sesión
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [usuario]);


  const getStatusInfo = (status) => {
    switch (status) {
      case 'Permitido':
        return { textColor: 'text-green-600', Icon: <ShieldCheck className="w-5 h-5" /> };
      case 'No autorizado':
        return { textColor: 'text-red-600', Icon: <ShieldAlert className="w-5 h-5" /> };
      default:
        return { textColor: 'text-yellow-600', Icon: <ShieldQuestion className="w-5 h-5" /> };
    }
  };

  const statusInfo = getStatusInfo(mockCapture.status);

  // --- Renderizado Condicional ---
  // Si 'usuario' tiene un valor, muestra la pantalla principal. Si no, muestra el Login.
  return usuario ? (
    // --- PANTALLA PRINCIPAL (SI EL USUARIO INICIÓ SESIÓN) ---
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-white">Sistema de Reconocimiento de Placas</h1>
          <div className="flex items-center gap-4">
            <span className="text-white font-mono text-lg hidden md:block">{currentTime.toLocaleTimeString('es-MX')}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <div className="bg-cyan-500 h-1"></div>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Video size={24} />Monitor de Acceso Principal</h2>
              <div className="bg-black w-full aspect-video rounded-lg flex items-center justify-center text-gray-500"><p className="text-xl">CÁMARA EN VIVO</p></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Último Vehículo Detectado</h3>
                <div className="border rounded-lg p-4">
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-3">
                      <div><p className="text-sm font-semibold text-gray-500">Placa Reconocida:</p><p className="font-mono text-2xl text-gray-800">{mockCapture.plateNumber}</p></div>
                      <div><p className="text-sm font-semibold text-gray-500">Propietario:</p><p className="text-gray-800">{mockCapture.owner}</p></div>
                      <div><p className="text-sm font-semibold text-gray-500">Vehículo:</p><p className="text-gray-800">{mockCapture.vehicleInfo}</p></div>
                    </div>
                    <div className="flex flex-col justify-between items-center">
                      <img src={mockCapture.imageUrl} alt={`Placa ${mockCapture.plateNumber}`} className="rounded-md border border-gray-300 w-full max-w-[250px] mb-4"/>
                      <div className={`flex items-center gap-2 font-bold text-lg p-2 rounded-md w-full justify-center ${statusInfo.textColor}`}>{statusInfo.Icon}<span>{mockCapture.status}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 border-t pt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"><Check size={20} />Aprobar Manualmente</button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"><X size={20} />Rechazar Acceso</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><History size={24} />Actividad Reciente</h2>
              <div className="space-y-3">
                {mockEvents.map((event, index) => {
                  const eventStatus = getStatusInfo(event.status);
                  return (
                    <div key={index} className="flex items-center p-3 bg-gray-50 border rounded-lg">
                      <div className={`mr-4 ${eventStatus.textColor}`}>{eventStatus.Icon}</div>
                      <div className="flex-grow"><p className="font-mono font-semibold text-gray-800">{event.plate}</p><p className={`text-sm font-bold ${eventStatus.textColor}`}>{event.status}</p></div>
                      <span className="text-sm text-gray-500 font-mono">{event.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  ) : (
    // --- PANTALLA DE LOGIN (SI EL USUARIO NO HA INICIADO SESIÓN) ---
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
