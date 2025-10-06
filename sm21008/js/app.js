// js/app.js
// ================= API dual =================
const MI_CARNET = 'sm21008';
const esDesarrolloLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Elige la URL de la API según el entorno
const API_URL = esDesarrolloLocal 
    ? 'http://localhost:3000'                      // URL para desarrollo en tu PC
    : `https://${MI_CARNET}.comuna.tpi/api`;     // URL para el servidor final en la VPN

export const ep = {
  bebidas : `${API_URL}/bebidas`,
  marcas  : `${API_URL}/marcas`
};

// Helpers
export const $  = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);
export const j  = async (r) => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); };
export const esc = (s)=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
export const money = (n)=> Number(n||0).toFixed(2);

// HTTP tiny wrapper
export const get  = async (url)    => j(await fetch(url));
export const post = async (url,b)  => j(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}));
export const put  = async (url,b)  => j(await fetch(url,{method:'PUT', headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}));
export const del  = async (url)    => { const r = await fetch(url,{method:'DELETE'}); if(!r.ok) throw new Error('HTTP '+r.status); };