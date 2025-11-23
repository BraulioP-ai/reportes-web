-- ------------------------------------------------------
-- BASE DE DATOS PROYECTO_IS
-- ------------------------------------------------------
DROP DATABASE IF EXISTS Proyecto_IS;
CREATE DATABASE Proyecto_IS;
USE Proyecto_IS;

-- ------------------------------------------------------
-- TABLA UsuariosSistema
-- ------------------------------------------------------
CREATE TABLE UsuariosSistema (
  UsuarioID INT AUTO_INCREMENT PRIMARY KEY,
  NombreUsuario VARCHAR(50) NOT NULL,
  Contrasena VARCHAR(100) NOT NULL
);

-- DATOS INICIALES
INSERT INTO UsuariosSistema (NombreUsuario, Contrasena)
VALUES
  ('admin', '1234'),
  ('guardia1', '1234');

-- ------------------------------------------------------
-- TABLA Empleados
-- ------------------------------------------------------
CREATE TABLE Empleados (
  EmpleadoID INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  ApellidoPaterno VARCHAR(100),
  ApellidoMaterno VARCHAR(100),
  Departamento VARCHAR(100)
);

INSERT INTO Empleados (Nombre, ApellidoPaterno, ApellidoMaterno, Departamento)
VALUES
  ('Juan', 'Lopez', 'Hernandez', 'Seguridad'),
  ('Maria', 'Perez', 'Garcia', 'Administración');

-- ------------------------------------------------------
-- TABLA Vehiculos
-- ------------------------------------------------------
CREATE TABLE Vehiculos (
  Placa VARCHAR(10) PRIMARY KEY,
  Marca VARCHAR(50),
  Modelo VARCHAR(50),
  EmpleadoID INT,
  EsAutorizado BOOLEAN DEFAULT 0,
  FOREIGN KEY (EmpleadoID) REFERENCES Empleados(EmpleadoID)
);

INSERT INTO Vehiculos (Placa, Marca, Modelo, EmpleadoID, EsAutorizado)
VALUES
  ('ABC123A', 'Nissan', 'Versa', 1, 1),
  ('XYZ456B', 'Honda', 'Civic', 2, 1);

-- ------------------------------------------------------
-- TABLA RegistrosAcceso
-- ------------------------------------------------------
CREATE TABLE RegistrosAcceso (
  RegistroID INT AUTO_INCREMENT PRIMARY KEY,
  Placa VARCHAR(10) NOT NULL,
  FechaHora DATETIME NOT NULL,
  EstadoAutorizacion ENUM('AUTORIZADO', 'NO_RECONOCIDO', 'MANUAL') NOT NULL,
  ModoAcceso ENUM('AUTOMATICO', 'MANUAL') NOT NULL,
  UsuarioSistemaID INT,
  FOREIGN KEY (UsuarioSistemaID) REFERENCES UsuariosSistema(UsuarioID)
);

-- EJEMPLO DE REGISTROS
INSERT INTO RegistrosAcceso
(Placa, FechaHora, EstadoAutorizacion, ModoAcceso, UsuarioSistemaID)
VALUES
  ('ABC123A', NOW(), 'AUTORIZADO', 'AUTOMATICO', 1),
  ('XYZ456B', NOW(), 'AUTORIZADO', 'AUTOMATICO', 1),
  ('PLT999C', NOW(), 'MANUAL', 'MANUAL', 1);
