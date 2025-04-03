/**
 * Script para preparar el entorno de producción
 * - Crea carpetas necesarias
 * - Configura permisos
 * - Genera archivo .env de producción
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Crear interfaz para leer entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntar al usuario
const preguntar = (pregunta) => {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta);
    });
  });
};

// Función principal
const prepararProduccion = async () => {
  console.log('🚀 Preparando entorno para producción...\n');
  
  // 1. Crear carpetas necesarias
  console.log('📁 Creando carpetas necesarias...');
  const carpetas = [
    'uploads',
    'uploads/productos',
    'uploads/categorias',
    'uploads/comprobantes',
    'logs'
  ];
  
  carpetas.forEach(carpeta => {
    const carpetaPath = path.join(process.cwd(), carpeta);
    if (!fs.existsSync(carpetaPath)) {
      fs.mkdirSync(carpetaPath, { recursive: true });
      console.log(`  ✓ Carpeta creada: ${carpeta}`);
    } else {
      console.log(`  ✓ Carpeta ya existente: ${carpeta}`);
    }
  });
  
  // 2. Recopilar datos para el archivo .env
  console.log('\n⚙️ Configurando variables de entorno para producción...');
  
  const dbHost = await preguntar('  Host de la base de datos: ') || 'localhost';
  const dbPort = await preguntar('  Puerto de la base de datos [3306]: ') || '3306';
  const dbName = await preguntar('  Nombre de la base de datos: ') || 'veneburger_db';
  const dbUser = await preguntar('  Usuario de la base de datos: ') || 'veneburger';
  const dbPassword = await preguntar('  Contraseña de la base de datos: ');
  const serverPort = await preguntar('  Puerto para el servidor API [3000]: ') || '3000';
  const corsOrigins = await preguntar('  Orígenes permitidos para CORS (separados por coma): ') || 'http://localhost:3000';
  
  // 3. Generar un JWT_SECRET seguro
  const jwtSecret = uuidv4() + uuidv4();
  
  // 4. Crear .env-production
  console.log('\n📄 Generando archivo .env para producción...');
  
  const envContent = `# Configuración del servidor
PORT=${serverPort}
NODE_ENV=production

# Configuración de la base de datos
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# JWT (Token de autenticación)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Configuración de CORS (Dominios permitidos)
CORS_ORIGIN=${corsOrigins}

# Límites de API
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=60

# Configuración de carga de archivos
UPLOAD_PATH=./uploads

# URL base para acceder a las imágenes
IMAGE_BASE_URL=http://localhost:${serverPort}

# Fecha de generación: ${new Date().toISOString()}
`;

  // Guardar el archivo como .env-production
  fs.writeFileSync(path.join(process.cwd(), '.env-production'), envContent);
  
  console.log('  ✓ Archivo .env-production generado correctamente');
  console.log('  ⚠️ Para utilizar este archivo en producción, renómbrelo a .env');
  
  // 5. Instrucciones finales
  console.log('\n🏁 Pasos para completar la configuración de producción:');
  console.log('  1. Renombrar .env-production a .env en el servidor de producción');
  console.log('  2. Verificar que la base de datos esté creada con el nombre especificado');
  console.log('  3. Ejecutar "npm install --production" para instalar solo dependencias necesarias');
  console.log('  4. Iniciar el servidor con "npm start" o con PM2: "pm2 start server.js --name veneburger-api"');
  
  // Cerrar la interfaz de readline
  rl.close();
};

// Ejecutar la función principal
prepararProduccion();