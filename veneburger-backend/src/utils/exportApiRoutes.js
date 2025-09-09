const fs = require('fs');
const path = require('path');
const { API_ROUTES } = require('../constants');

// Convertir a formato compatible con JavaScript/TypeScript para el frontend
const apiRoutesJS = `// Archivo generado automáticamente - No editar manualmente
// Última actualización: ${new Date().toISOString()}

export const API_ROUTES = ${JSON.stringify(API_ROUTES, null, 2)};
`;

// Guardar en un archivo que pueda ser copiado al proyecto frontend
fs.writeFileSync(
  path.join(__dirname, '../../export/apiRoutes.js'),
  apiRoutesJS
);
