// src/App.jsx
import React, { useState } from 'react';
import './App.css';

const ReportesPage = () => {
  const [registros] = useState([
    { id: 1, placa: 'ABC-123', fecha: '2025-09-28 19:50', acceso: 'Permitido' },
    { id: 2, placa: 'XYZ-789', fecha: '2025-09-28 19:52', acceso: 'Denegado' },
    { id: 3, placa: 'DEF-456', fecha: '2025-09-28 19:55', acceso: 'Permitido' },
  ]);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroAcceso, setFiltroAcceso] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Filtrar registros
  const registrosFiltrados = registros.filter(r => {
    const coincidePlaca = r.placa.toLowerCase().includes(busqueda.toLowerCase());
    const coincideAcceso = filtroAcceso === 'Todos' || r.acceso === filtroAcceso;
    const fechaRegistro = new Date(r.fecha);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin) : null;
    const coincideFecha =
      (!desde || fechaRegistro >= desde) &&
      (!hasta || fechaRegistro <= hasta);
    return coincidePlaca && coincideAcceso && coincideFecha;
  });

  return (
    <div className="reportes-container">
      <h2>Historial de Reconocimiento de Placas</h2>

      {/* Controles de filtro */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />

        <select
          value={filtroAcceso}
          onChange={(e) => setFiltroAcceso(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option>Todos</option>
          <option>Permitido</option>
          <option>Denegado</option>
        </select>

        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </div>

      {/* Tabla sin columna ID */}
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Fecha/Hora</th>
            <th>Estado de Acceso</th>
          </tr>
        </thead>
        <tbody>
          {registrosFiltrados.map((registro) => (
            <tr key={registro.id}>
              <td>{registro.placa}</td>
              <td>{registro.fecha}</td>
              <td
                style={{
                  color: registro.acceso === 'Permitido' ? 'green' : 'red',
                  fontWeight: 'bold'
                }}
              >
                {registro.acceso}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => alert('Generando PDF de Reporte...')}>
        Generar Reporte PDF
      </button>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Reconocimiento de Placas</h1>
        <nav>
          <button className="active">Reportes</button>
        </nav>
      </header>

      <main className="App-main">
        <ReportesPage />
      </main>
    </div>
  );
}

export default App;
