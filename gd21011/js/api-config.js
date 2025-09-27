// --- CONFIGURACIÓN DE API PARA EL SITIO ---
// Este archivo debe ser incluido PRIMERO antes que cualquier otro archivo JS que use la API

const MI_CARNET = 'gd21011'; 

// Detecta si estamos en un entorno de desarrollo local
const esDesarrolloLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Elige la URL de la API según el entorno
const API_URL = esDesarrolloLocal 
    ? 'http://localhost:3000'
    : `https://${MI_CARNET}.comuna.tpi/api`;

const API_BASE_URL = API_URL;

console.log(`🔧 API configurada: ${API_URL} (desarrollo local: ${esDesarrolloLocal})`);
