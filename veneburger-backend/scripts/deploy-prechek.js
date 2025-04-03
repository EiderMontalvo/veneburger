/**
 * Script de verificación previa al despliegue
 * Comprueba que todo esté listo para ir a producción
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Iniciando verificación previa al despliegue...');

// Verificar archivos críticos
const archivosRequeridos = [
  '.env',
  'server.js',
  'package.json',
  'src/models/index.js',
  'src/routes/index.js',
  'src/middleware/auth.js'
];

let todoOk = true;

// Comprobar que existan los archivos críticos
console.log('\n📋 Verificando archivos críticos:');
archivosRequeridos.forEach(archivo => {
  if (fs.existsSync(path.join(process.cwd(), archivo))) {
    console.log(`✅ ${archivo}: OK`);
  } else {
    console.log(`❌ ${archivo}: FALTA`);
    todoOk = false;
  }
});

// Verificar variables de entorno críticas
console.log('\n🔐 Verificando variables de entorno:');
const variablesRequeridas = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'CORS_ORIGIN'
];

variablesRequeridas.forEach(variable => {
  if (process.env[variable]) {
    console.log(`✅ ${variable}: OK`);
  } else {
    console.log(`❌ ${variable}: FALTA`);
    todoOk = false;
  }
});

// Verificar carpetas y permisos
console.log('\n📁 Verificando carpetas:');
const carpetasRequeridas = [
  'uploads',
  'uploads/productos',
  'uploads/categorias',
  'uploads/comprobantes',
  'logs'
];

carpetasRequeridas.forEach(carpeta => {
  const carpetaPath = path.join(process.cwd(), carpeta);
  if (fs.existsSync(carpetaPath)) {
    try {
      // Verificar permisos de escritura
      fs.accessSync(carpetaPath, fs.constants.W_OK);
      console.log(`✅ ${carpeta}: OK (con permisos de escritura)`);
    } catch (error) {
      console.log(`⚠️ ${carpeta}: ADVERTENCIA (sin permisos de escritura)`);
      todoOk = false;
    }
  } else {
    console.log(`❌ ${carpeta}: FALTA`);
    todoOk = false;
  }
});

// Verificar NODE_ENV
console.log('\n⚙️ Verificando configuración:');
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV: production (OK)');
} else {
  console.log(`⚠️ NODE_ENV: ${process.env.NODE_ENV || 'no definido'} (debería ser 'production' para despliegue)`);
  todoOk = false;
}

// Resultado final
console.log('\n🏁 Resultado de la verificación:');
if (todoOk) {
  console.log('✅ TODO LISTO: El sistema está preparado para despliegue en producción.');
  process.exit(0);
} else {
  console.log('❌ HAY PROBLEMAS: Revise los puntos señalados antes de proceder con el despliegue.');
  process.exit(1);
}