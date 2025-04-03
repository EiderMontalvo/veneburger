# veneburger-backend

API REST para la gestión del restaurante VeneBurger, permitiendo la administración completa de pedidos, productos, categorías, usuarios y reportes.

## Características

- Autenticación y autorización con JWT
- Gestión de productos y categorías
- Sistema completo de pedidos
- Administración de mesas y reservas
- Gestión de cremas/adicionales
- Reportes y estadísticas
- Control de días especiales y horarios
- Validación y sanitización de datos
- Protección contra inyección SQL y ataques XSS

## Requisitos

- Node.js >= 16.x
- MySQL >= 8.0
- NPM >= 8.x

## Estructura del Proyecto
veneburger-api/  
├── logs/               # Archivos de registro  
├── scripts/            # Scripts de utilidad  
├── src/                # Código fuente principal  
│   ├── config/        # Configuraciones generales  
│   ├── controllers/   # Controladores de la API  
│   ├── middleware/    # Middleware de la aplicación  
│   ├── models/        # Modelos de datos  
│   ├── routes/        # Definición de rutas de la API  
│   ├── services/      # Lógica de negocio y servicios  
│   └── utils/         # Funciones y herramientas auxiliares  
├── uploads/            # Archivos subidos  
│   ├── categorias/     # Imágenes de categorías  
│   ├── productos/      # Imágenes de productos  
│   └── comprobantes/   # Archivos de comprobantes de pago  
├── .env                # Variables de entorno  
├── .gitignore          # Archivos ignorados por Git  
├── package.json        # Dependencias y scripts de npm  
├── README.md           # Documentación del proyecto  
└── server.js           # Archivo principal de la aplicación  

## Endpoints Principales

Autenticación
POST /api/auth/registro: Registrar nuevo usuario
POST /api/auth/login: Iniciar sesión

Productos
GET /api/productos: Listar productos
GET /api/productos/:id: Obtener producto por ID
POST /api/productos: Crear producto (admin)
PUT /api/productos/:id: Actualizar producto (admin)
DELETE /api/productos/:id: Eliminar producto (admin)

Pedidos
POST /api/pedidos: Crear nuevo pedido
GET /api/pedidos: Listar pedidos
GET /api/pedidos/:id: Obtener pedido por ID
PATCH /api/pedidos/:id/estado: Actualizar estado (admin/repartidor)
PATCH /api/pedidos/:id/calificar: Calificar pedido (cliente)

Reportes (admin)
GET /api/reportes/ventas/diarias: Reporte de ventas diarias
GET /api/reportes/ventas/mensuales: Reporte de ventas mensuales
GET /api/reportes/productos/mas-vendidos: Productos más vendidos
GET /api/reportes/clientes/frecuentes: Clientes frecuentes

## Seguridad
Esta API implementa múltiples capas de seguridad:
Autenticación JWT
Validación y sanitización de entrada
Protección CSRF
Limitación de tasa de peticiones
Encriptación de contraseñas con bcrypt
Políticas de seguridad de contenido (CSP)
Sanitización de salida para prevenir XSS
Consultas parametrizadas para prevenir inyección SQL

## Licencia
Copyright © 2025 Eider Montalvo. Todos los derechos reservados.

## Despliegue en Producción
Preparar el entorno de producción:

bash
npm run prepare-prod
Verificar la configuración:

bash
npm run deploy-precheck
Iniciar en producción:

bash
npm start
O mejor aún, usar PM2:

bash
pm2 start server.js --name veneburger-api