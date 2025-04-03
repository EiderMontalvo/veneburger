const { v4: uuidv4 } = require('uuid');
const { Pedido } = require('../models');

/**
 * Genera un código único para un pedido
 * Formato: VB-XXXXX (donde X son letras o números)
 */
exports.generarCodigoPedido = async () => {
  let codigo;
  let codigoExiste = true;
  
  // Generar códigos hasta encontrar uno único
  while (codigoExiste) {
    // Generar un UUID y tomar solo los primeros 5 caracteres
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    codigo = `VB-${randomPart}`;
    
    // Verificar si ya existe
    const pedidoExistente = await Pedido.findOne({ where: { codigo } });
    codigoExiste = !!pedidoExistente;
  }
  
  return codigo;
};

/**
 * Formatea un precio a string con formato de moneda
 */
exports.formatearPrecio = (precio) => {
  return `S/ ${parseFloat(precio).toFixed(2)}`;
};

/**
 * Formatea una fecha a string localizado
 */
exports.formatearFecha = (fecha, incluirHora = true) => {
  if (!fecha) return '';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (incluirHora) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Date(fecha).toLocaleDateString('es-PE', options);
};

/**
 * Calcular tiempo transcurrido desde una fecha
 * @returns {string} Texto descriptivo del tiempo transcurrido
 */
exports.tiempoTranscurrido = (fecha) => {
  if (!fecha) return '';
  
  const ahora = new Date();
  const fechaAnterior = new Date(fecha);
  const diferenciaMs = ahora - fechaAnterior;
  
  const segundos = Math.floor(diferenciaMs / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) {
    return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
  } else if (horas > 0) {
    return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  } else if (minutos > 0) {
    return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
  } else {
    return 'Hace unos instantes';
  }
};

/**
 * Sanitiza un texto para prevenir XSS
 */
exports.sanitizarTexto = (texto) => {
  if (!texto) return '';
  
  return texto
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};