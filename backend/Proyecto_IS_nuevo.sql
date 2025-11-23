-- ------------------------------------------------------
-- BASE DE DATOS PROYECTO_IS
-- ------------------------------------------------------
IF DB_ID('Proyecto_IS') IS NOT NULL
    DROP DATABASE Proyecto_IS;
GO

CREATE DATABASE Proyecto_IS;
GO

USE Proyecto_IS;
GO

-- ------------------------------------------------------
-- TABLA UsuariosSistema
-- ------------------------------------------------------
CREATE TABLE UsuariosSistema (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario VARCHAR(50) NOT NULL,
    Contrasena VARCHAR(100) NOT NULL
);
GO

-- DATOS INICIALES
INSERT INTO UsuariosSistema (NombreUsuario, Contrasena)
VALUES
    ('admin', '1234'),
    ('guardia1', '1234');
GO

-- ------------------------------------------------------
-- TABLA Empleados
-- ------------------------------------------------------
CREATE TABLE Empleados (
    EmpleadoID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    ApellidoPaterno VARCHAR(100),
    ApellidoMaterno VARCHAR(100),
    Departamento VARCHAR(100)
);
GO

INSERT INTO Empleados (Nombre, ApellidoPaterno, ApellidoMaterno, Departamento)
VALUES
    ('Juan', 'Lopez', 'Hernandez', 'Seguridad'),
    ('Maria', 'Perez', 'Garcia', 'Administración');
GO

-- ------------------------------------------------------
-- TABLA Vehiculos
-- ------------------------------------------------------
CREATE TABLE Vehiculos (
    Placa VARCHAR(10) PRIMARY KEY,
    Marca VARCHAR(50),
    Modelo VARCHAR(50),
    EmpleadoID INT,
    EsAutorizado BIT DEFAULT 0,
    CONSTRAINT FK_Vehiculos_Empleados FOREIGN KEY (EmpleadoID)
        REFERENCES Empleados(EmpleadoID)
);
GO

INSERT INTO Vehiculos (Placa, Marca, Modelo, EmpleadoID, EsAutorizado)
VALUES
    ('ABC123A', 'Nissan', 'Versa', 1, 1),
    ('XYZ456B', 'Honda', 'Civic', 2, 1);
GO

-- ------------------------------------------------------
-- TABLA RegistrosAcceso
-- ------------------------------------------------------
CREATE TABLE RegistrosAcceso (
    RegistroID INT IDENTITY(1,1) PRIMARY KEY,
    Placa VARCHAR(10) NOT NULL,
    FechaHora DATETIME NOT NULL,
    EstadoAutorizacion VARCHAR(20) NOT NULL CHECK (EstadoAutorizacion IN ('AUTORIZADO', 'NO_RECONOCIDO', 'MANUAL')),
    ModoAcceso VARCHAR(20) NOT NULL CHECK (ModoAcceso IN ('AUTOMATICO', 'MANUAL')),
    UsuarioSistemaID INT,
    CONSTRAINT FK_RegistrosAcceso_UsuariosSistema FOREIGN KEY (UsuarioSistemaID)
        REFERENCES UsuariosSistema(UsuarioID)
);
GO

-- EJEMPLO DE REGISTROS
INSERT INTO RegistrosAcceso (Placa, FechaHora, EstadoAutorizacion, ModoAcceso, UsuarioSistemaID)
VALUES
    ('ABC123A', GETDATE(), 'AUTORIZADO', 'AUTOMATICO', 1),
    ('XYZ456B', GETDATE(), 'AUTORIZADO', 'AUTOMATICO', 1),
    ('PLT999C', GETDATE(), 'MANUAL', 'MANUAL', 1);
GO
