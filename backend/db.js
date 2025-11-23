import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Crear conexión
export const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Proyecto_IS_nuevo",
  port: process.env.DB_PORT || 3306,
  multipleStatements: true, // por si quieres ejecutar varias queries juntas
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1); // termina el servidor si no se conecta
  } else {
    console.log("✅ Conectado a la base de datos MySQL");
  }
});

// Manejar errores de la conexión después de creada
db.on("error", (err) => {
  console.error("❌ Error en la conexión MySQL:", err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("⚠️  La conexión se perdió. Intenta reconectar...");
  } else {
    throw err;
  }
});
