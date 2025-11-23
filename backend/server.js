import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
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
// OBTENER REGISTROS DE ACCESO
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
      CONCAT(e.Nombre, ' ', e.ApellidoPaterno, ' ', e.ApellidoMaterno) AS NombreCompleto,
      v.Marca,
      v.Modelo
    FROM RegistrosAcceso r
    LEFT JOIN Vehiculos v ON r.Placa = v.Placa
    LEFT JOIN Empleados e ON v.EmpleadoID = e.EmpleadoID
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