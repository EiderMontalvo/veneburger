CREATE DATABASE IF NOT EXISTS veneburger_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veneburger_db;

-- Tabla para categorías del menú
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria_activo (activo),
    INDEX idx_categoria_orden (orden)
);

-- Tabla para los productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    tiempo_preparacion INT DEFAULT 15 COMMENT 'Tiempo en minutos',
    imagen VARCHAR(255) DEFAULT 'default.png',
    disponible BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_producto_disponible (disponible),
    INDEX idx_producto_destacado (destacado),
    INDEX idx_producto_categoria (categoria_id)
);

-- Tabla para cremas
CREATE TABLE cremas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para usuarios (se incluye la columna apellidos, permitiendo valores nulos)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) DEFAULT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    direccion TEXT,
    referencia_direccion TEXT,
    ciudad VARCHAR(50) DEFAULT 'Lima',
    distrito VARCHAR(50),
    rol ENUM('cliente', 'admin', 'repartidor') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_usuario_email (email),
    INDEX idx_usuario_rol (rol),
    INDEX idx_usuario_activo (activo)
);

-- Tabla para registros de actividades
CREATE TABLE logs_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    usuario_nombre VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    tabla VARCHAR(50) NOT NULL,
    registro_id INT,
    detalles JSON,
    ip VARCHAR(45),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_log_fecha (fecha_hora),
    INDEX idx_log_usuario (usuario_id),
    INDEX idx_log_accion (accion)
);

-- Tabla para mesas del restaurante
CREATE TABLE mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    capacidad INT NOT NULL DEFAULT 4,
    estado ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento') DEFAULT 'disponible',
    ubicacion VARCHAR(50) DEFAULT 'interior',
    activo BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mesa_estado (estado),
    INDEX idx_mesa_ubicacion (ubicacion)
);

-- Tabla para reservas
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    mesa_id INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    num_personas INT NOT NULL DEFAULT 1,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'no_show') DEFAULT 'pendiente',
    comentarios TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT,
    INDEX idx_reserva_fecha (fecha_reserva),
    INDEX idx_reserva_estado (estado)
);

-- Tabla para pedidos 
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    usuario_id INT,
    mesa_id INT,
    repartidor_id INT,
    nombre_cliente VARCHAR(100),
    tipo ENUM('local', 'delivery', 'para_llevar') NOT NULL,
    estado ENUM('pendiente', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado') DEFAULT 'pendiente',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    direccion_entrega TEXT,
    referencia_direccion TEXT,
    distrito VARCHAR(50),
    ciudad VARCHAR(50) DEFAULT 'Lima',
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(100),
    tiempo_estimado_entrega INT COMMENT 'Tiempo en minutos',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_preparacion TIMESTAMP NULL,
    fecha_listo TIMESTAMP NULL,
    fecha_en_camino TIMESTAMP NULL,
    fecha_entrega TIMESTAMP NULL,
    fecha_cancelacion TIMESTAMP NULL,
    motivo_cancelacion TEXT,
    notas TEXT,
    calificacion INT,
    comentario_calificacion TEXT,
    origen VARCHAR(20) DEFAULT 'web' COMMENT 'web, app, telefono, presencial',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT,
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_pedido_estado (estado),
    INDEX idx_pedido_tipo (tipo),
    INDEX idx_pedido_fecha (fecha_pedido),
    INDEX idx_pedido_usuario (usuario_id),
    INDEX idx_pedido_repartidor (repartidor_id)
);

-- Tabla detalles pedidos
CREATE TABLE detalles_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento_unitario DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    notas TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,    
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_detalle_pedido (pedido_id),
    INDEX idx_detalle_producto (producto_id)
);

-- Tabla para cremas seleccionadas en productos
CREATE TABLE detalles_pedidos_cremas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detalle_pedido_id INT NOT NULL,
    crema_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (detalle_pedido_id) REFERENCES detalles_pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (crema_id) REFERENCES cremas(id) ON DELETE RESTRICT
);

-- Tabla para métodos de pago
CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    requiere_confirmacion BOOLEAN DEFAULT FALSE,
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla para pagos
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    metodo_pago_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(100),
    comprobante VARCHAR(255) COMMENT 'Ruta a la imagen del comprobante',
    estado ENUM('pendiente', 'completado', 'cancelado') DEFAULT 'pendiente',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT,
    INDEX idx_pago_estado (estado),
    INDEX idx_pago_metodo (metodo_pago_id)
);

-- Tabla para horarios de atención
CREATE TABLE horarios_atencion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE KEY (dia_semana)
);

-- Tabla para días especiales (días no laborables, feriados, etc.)
CREATE TABLE dias_especiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo ENUM('cerrado', 'horario_especial') NOT NULL DEFAULT 'cerrado',
    hora_apertura TIME NULL,
    hora_cierre TIME NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (fecha),
    INDEX idx_dia_especial_fecha (fecha)
);

-- Tabla para promociones y descuentos
CREATE TABLE promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo ENUM('porcentaje', 'monto_fijo', 'envio_gratis', '2x1') NOT NULL,
    valor DECIMAL(10,2) NOT NULL COMMENT 'Porcentaje o monto de descuento',
    min_compra DECIMAL(10,2) DEFAULT 0 COMMENT 'Mínimo de compra para aplicar',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    limite_usos INT DEFAULT NULL COMMENT 'NULL significa ilimitado',
    usos_actuales INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promocion_codigo (codigo),
    INDEX idx_promocion_fechas (fecha_inicio, fecha_fin),
    INDEX idx_promocion_activo (activo)
);

-- Inserción de horarios de atención (7:30 PM a 4:30 AM)
INSERT INTO horarios_atencion (dia_semana, hora_apertura, hora_cierre, activo) VALUES
('lunes', '19:30:00', '04:30:00', true),
('martes', '19:30:00', '04:30:00', true),
('miercoles', '19:30:00', '04:30:00', true),
('jueves', '19:30:00', '04:30:00', true),
('viernes', '19:30:00', '04:30:00', true),
('sabado', '19:30:00', '04:30:00', true),
('domingo', '19:30:00', '04:30:00', true);

-- Inserción de métodos de pago (solo efectivo y Yape)
INSERT INTO metodos_pago (nombre, descripcion, requiere_confirmacion, activo) VALUES
('Efectivo', 'Pago en efectivo contra entrega', false, true),
('Yape', 'Pago mediante la aplicación Yape', true, true);

-- Inserción de datos para categorías
INSERT INTO categorias (codigo, nombre, descripcion, orden) VALUES
('hamburguesas', 'Hamburguesas', 'Nuestras deliciosas hamburguesas', 1),
('enrollados', 'Enrollados', 'Enrollados frescos y sabrosos', 2),
('salchipapas', 'Salchipapas', 'Combinación perfecta de papas y salchichas', 3),
('broaster', 'Broaster', 'Pollo broaster crujiente', 4),
('jugos', 'Jugos', 'Jugos naturales y refrescantes', 5),
('bbq', 'BBQ', 'Especialidades a la parrilla', 6),
('pepitos', 'Pepitos', 'Sándwiches venezolanos', 7),
('chifa', 'Chifa', 'Nuestra selección de comida chifa', 8);

-- Inserción de cremas (sin descripciones)
INSERT INTO cremas (nombre, precio, disponible) VALUES
('Mayonesa', 0.00, true),
('Kétchup', 0.00, true),
('Mostaza', 0.00, true),
('Ají', 0.00, true),
('BBQ', 0.00, true),
('Queso', 0.00, true),
('Ajo', 0.00, true),
('Ocopa', 0.00, true),
('Tártara', 0.00, true),
('Tocineta', 0.00, true),
('Golf', 0.00, true),
('Todas las cremas', 0.00, true);

-- Insertar usuario administrador (con todos los campos requeridos)
INSERT INTO usuarios (nombre, apellidos, email, telefono, password, rol, activo, fecha_registro) 
VALUES ('veneburger', '', 'admin@veneburger.com', '912266562', 
        '$2b$10$3t1nOZXCp/qDXnoMdq.xFuR82FVd7Za9JnDWzZy9AU3tV4dypB9rq', 
        'admin', true, NOW());
GRANT ALL PRIVILEGES ON veneburger_db.* TO 'veneburger'@'localhost';
FLUSH PRIVILEGES;



