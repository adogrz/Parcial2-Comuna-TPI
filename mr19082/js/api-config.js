
const MI_CARNET = 'mr19082';
const esDesarrolloLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

//se usa el puerto 3000
const API_URL = esDesarrolloLocal 
    ? 'http://localhost:3000'
    : `https://${MI_CARNET}.comuna.tpi/api`;

// Exportando la variable para que pueda ser usada por otros archivos
export { API_URL };