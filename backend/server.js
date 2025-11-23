import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ==============================
// RUTA DE PRUEBA
// ==============================
app.get("/", (req, res) => {
  res.send("Servidor funcionando y conectado a MySQL ✅");
});

// ==============================
// LOGIN (texto plano, según tu BD real)
// ==============================
app.post("/login", (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const query = `
    SELECT UsuarioID, NombreUsuario, ContrasenaHash, PermisoID
    FROM UsuariosSistema
    WHERE NombreUsuario = ?
  `;

  db.query(query, [nombre], (err, results) => {
    if (err) {
      console.error("❌ Error DB:", err);
      return res.status(500).json({ message: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario incorrecto" });
    }

    const user = results[0];

    // Comparación en texto plano
    if (user.ContrasenaHash !== contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Login correcto - ✅ AGREGADO PermisoID
    return res.json({
      UsuarioID: user.UsuarioID,
      NombreUsuario: user.NombreUsuario,
      PermisoID: user.PermisoID  // ← NUEVO
    });
  });
});

// ==============================
// OBTENER REGISTROS DE ACCESO (CON GUARDIA)
// ==============================
app.get("/registros", (req, res) => {
  const query = `
    SELECT 
      r.RegistroID,
      r.Placa,
      r.FechaHora,
      r.EstadoAutorizacion,
      r.ModoAcceso,
      r.UsuarioSistemaID,
      u.NombreUsuario AS GuardiaNombre,
      CONCAT(e.Nombre, ' ', e.ApellidoPaterno, ' ', e.ApellidoMaterno) AS NombreCompleto,
      v.Marca,
      v.Modelo
    FROM RegistrosAcceso r
    LEFT JOIN Vehiculos v ON r.Placa = v.Placa
    LEFT JOIN Empleados e ON v.EmpleadoID = e.EmpleadoID
    LEFT JOIN UsuariosSistema u ON r.UsuarioSistemaID = u.UsuarioID
    ORDER BY r.FechaHora DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener registros:", err);
      return res.status(500).send("Error al obtener registros");
    }
    res.json(results);
  });
});
// ==============================
// REGISTRO MANUAL DE ACCESO
// ==============================
app.post("/acceso/manual", (req, res) => {
  const { placa, guardia_id } = req.body;

  if (!placa || !guardia_id) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  const sql = `
    INSERT INTO RegistrosAcceso 
    (Placa, FechaHora, EstadoAutorizacion, ModoAcceso, UsuarioSistemaID)
    VALUES (?, NOW(), 'MANUAL', 'MANUAL', ?);
  `;

  db.query(sql, [placa, guardia_id], (err, result) => {
    if (err) {
      console.error("❌ Error insertando acceso manual:", err);
      return res.status(500).json({ error: "Error al registrar acceso manual" });
    }

    const fetchLast = `
      SELECT r.*, CONCAT(e.Nombre,' ',e.ApellidoPaterno,' ',e.ApellidoMaterno) AS NombreCompleto,
             v.Marca, v.Modelo
      FROM RegistrosAcceso r
      LEFT JOIN Vehiculos v ON r.Placa = v.Placa
      LEFT JOIN Empleados e ON v.EmpleadoID = e.EmpleadoID
      WHERE r.RegistroID = ?
    `;

    db.query(fetchLast, [result.insertId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: "Error obteniendo registro" });
      res.json(rows[0]);
    });
  });
});

// ==============================
// REGISTRO AUTOMÁTICO
// ==============================
app.post("/registros", (req, res) => {
  const { placa, modo } = req.body;

  if (!placa || !modo) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  const checkQuery = "SELECT EsAutorizado FROM Vehiculos WHERE Placa = ?";

  db.query(checkQuery, [placa], (err, vehiculos) => {
    if (err) {
      console.error("❌ Error al verificar placa:", err);
      return res.status(500).send("Error en la verificación");
    }

    let estado = "NO_RECONOCIDO";

    if (vehiculos.length > 0) {
      estado = vehiculos[0].EsAutorizado ? "AUTORIZADO" : "NO_RECONOCIDO";
    }

    const insertQuery = `
      INSERT INTO RegistrosAcceso 
      (Placa, FechaHora, EstadoAutorizacion, ModoAcceso)
      VALUES (?, NOW(), ?, ?)
    `;

    db.query(insertQuery, [placa, estado, modo], (err, result) => {
      if (err) {
        console.error("❌ Error al insertar automático:", err);
        return res.status(500).send("Error al registrar acceso");
      }

      res.json({ ok: true, estado });
    });
  });
});

// ==============================
// INICIAR SERVIDOR
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

// ==============================
// OBTENER LISTA DE GUARDIAS
// ==============================
app.get("/guardias", (req, res) => {
  const query = `
    SELECT 
      u.UsuarioID,
      u.NombreUsuario,
      p.NombrePermiso AS Rol,
      COUNT(r.RegistroID) AS TotalAccesosManual
    FROM UsuariosSistema u
    INNER JOIN PermisosSistema p ON u.PermisoID = p.PermisoID
    LEFT JOIN RegistrosAcceso r ON u.UsuarioID = r.UsuarioSistemaID AND r.ModoAcceso = 'MANUAL'
    WHERE u.PermisoID = 3 AND u.Estatus = 1
    GROUP BY u.UsuarioID, u.NombreUsuario, p.NombrePermiso
    ORDER BY u.NombreUsuario;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo guardias:", err);
      return res.status(500).json({ error: "Error al obtener guardias" });
    }
    
    const guardias = results.map(g => ({
      id: g.UsuarioID,
      nombre: g.NombreUsuario,
      correo: `${g.NombreUsuario.toLowerCase()}@empresa.com`,
      rol: g.Rol,
      accesosManual: Array(g.TotalAccesosManual).fill({})
    }));
    
    res.json(guardias);
  });
});

// ==============================
// OBTENER TODOS LOS VEHÍCULOS
// ==============================
app.get("/vehiculos", (req, res) => {
  const query = `
    SELECT 
      v.Placa,
      v.Marca,
      v.Modelo,
      v.TipoVehiculo,
      v.EmpleadoID,
      v.EsAutorizado,
      v.FechaVencimiento,
      CONCAT(e.Nombre, ' ', e.ApellidoPaterno, ' ', e.ApellidoMaterno) AS NombrePropietario,
      e.Puesto AS Departamento
    FROM Vehiculos v
    LEFT JOIN Empleados e ON v.EmpleadoID = e.EmpleadoID
    ORDER BY v.Placa;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo vehículos:", err);
      return res.status(500).json({ error: "Error al obtener vehículos" });
    }
    res.json(results);
  });
});

// ==============================
// OBTENER EMPLEADOS (para el dropdown)
// ==============================
app.get("/empleados", (req, res) => {
  const query = `
    SELECT 
      EmpleadoID,
      CONCAT(Nombre, ' ', ApellidoPaterno, ' ', ApellidoMaterno) AS NombreCompleto,
      Puesto AS Departamento
    FROM Empleados
    WHERE Estatus = 1
    ORDER BY Nombre;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo empleados:", err);
      return res.status(500).json({ error: "Error al obtener empleados" });
    }
    res.json(results);
  });
});

// ==============================
// DAR DE ALTA UN VEHÍCULO
// ==============================
app.post("/vehiculos", (req, res) => {
  const { placa, marca, modelo, empleadoId, esAutorizado } = req.body;

  if (!placa || !marca || !modelo || !empleadoId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  // Validar formato de placa (AAA000A)
  const placaRegex = /^[A-Z]{3}\d{3}[A-Z]$/;
  if (!placaRegex.test(placa.toUpperCase())) {
    return res.status(400).json({ error: "Formato de placa inválido. Use AAA000A" });
  }

  const query = `
    INSERT INTO Vehiculos (Placa, Marca, Modelo, EmpleadoID, EsAutorizado)
    VALUES (?, ?, ?, ?, ?);
  `;

  db.query(query, [placa.toUpperCase(), marca, modelo, empleadoId, esAutorizado ? 1 : 0], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "La placa ya está registrada" });
      }
      console.error("❌ Error al registrar vehículo:", err);
      return res.status(500).json({ error: "Error al registrar vehículo" });
    }
    res.json({ message: "Vehículo registrado exitosamente", placa: placa.toUpperCase() });
  });
});

// ==============================
// DAR DE BAJA UN VEHÍCULO (DELETE)
// ==============================
app.delete("/vehiculos/:placa", (req, res) => {
  const { placa } = req.params;

  const query = "DELETE FROM Vehiculos WHERE Placa = ?";

  db.query(query, [placa], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar vehículo:", err);
      return res.status(500).json({ error: "Error al eliminar vehículo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Vehículo dado de baja exitosamente" });
  });
});

// ==============================
// ACTUALIZAR VEHÍCULO
// ==============================
app.put("/vehiculos/:placa", (req, res) => {
  const { placa } = req.params;
  const { marca, modelo, empleadoId, esAutorizado } = req.body;

  if (!marca || !modelo || !empleadoId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const query = `
    UPDATE Vehiculos 
    SET Marca = ?, Modelo = ?, EmpleadoID = ?, EsAutorizado = ?
    WHERE Placa = ?;
  `;

  db.query(query, [marca, modelo, empleadoId, esAutorizado ? 1 : 0, placa], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar vehículo:", err);
      return res.status(500).json({ error: "Error al actualizar vehículo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Vehículo actualizado exitosamente" });
  });
});

// ==============================
// CAMBIAR ESTADO DE AUTORIZACIÓN
// ==============================
app.patch("/vehiculos/:placa/autorizacion", (req, res) => {
  const { placa } = req.params;
  const { esAutorizado } = req.body;

  const query = "UPDATE Vehiculos SET EsAutorizado = ? WHERE Placa = ?";

  db.query(query, [esAutorizado ? 1 : 0, placa], (err, result) => {
    if (err) {
      console.error("❌ Error al cambiar autorización:", err);
      return res.status(500).json({ error: "Error al cambiar autorización" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Autorización actualizada exitosamente" });
  });
});