// js/app.js
// ====================================================
// CONFIGURACIÓN DE API
// ====================================================
const MI_CARNET = 'hb21009';
const esDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// En desarrollo (localhost) usa JSON Server directo.
// En producción (https://hb21009.comuna.tpi o www8.comuna.tpi) usa mismo origen /api
const API_URL = esDev ? 'http://localhost:3000' : '/api';

// Expón también en global para consola/scripts no-módulo:
window.API_URL = API_URL;
window.MI_CARNET = MI_CARNET;

// (opcional) export para otros módulos
export { API_URL, MI_CARNET };

// ====================================================
// HELPERS
// ====================================================
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const j  = async (res) => { if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); };
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                                  .replace(/'/g,'&#39;').replace(/"/g,'&quot;');

// ====================================================
// HOME: KPIs
// ====================================================
async function initHome(){
  try{
    const [rcat, rprod, rcart] = await Promise.all([
      fetch(`${API_URL}/categorias`).then(j),
      fetch(`${API_URL}/productos`).then(j),
      fetch(`${API_URL}/carrito`).then(j),
    ]);

    $('#kpiProductos')  && ($('#kpiProductos').textContent  = rprod.length);
    $('#kpiCategorias') && ($('#kpiCategorias').textContent = rcat.length);
    $('#kpiCarrito')    && ($('#kpiCarrito').textContent    = rcart.length);

    await renderReporteProductosPorCategoria(rprod, rcat);
  }catch(err){
    console.error(err);
    $('#kpiProductos')  && ($('#kpiProductos').textContent  = '-');
    $('#kpiCategorias') && ($('#kpiCategorias').textContent = '-');
    $('#kpiCarrito')    && ($('#kpiCarrito').textContent    = '-');
    $('#rep-ppc') && ($('#rep-ppc').innerHTML = `<div class="alert">No se pudo generar el reporte.</div>`);
  }
}

// ====================================================
// HOME: Reporte Productos por Categoría
// ====================================================
async function renderReporteProductosPorCategoria(productos, categorias){
  const host = $('#rep-ppc');
  if(!host) return;

  if(!Array.isArray(productos) || !Array.isArray(categorias)){
    [productos, categorias] = await Promise.all([
      fetch(`${API_URL}/productos`).then(j),
      fetch(`${API_URL}/categorias`).then(j)
    ]);
  }

  const mapC = Object.fromEntries(categorias.map(c => [String(c.id), c.nombre]));
  const conteo = {};
  productos.forEach(p => {
    const nom = mapC[String(p.categoriaId)] || `Categoría ${p.categoriaId}`;
    conteo[nom] = (conteo[nom] || 0) + 1;
  });

  const rows = Object.entries(conteo)
    .sort((a,b)=>b[1]-a[1])
    .map(([nombre, total]) => `<tr><td>${esc(nombre)}</td><td class="right">${total}</td></tr>`)
    .join('');

  host.innerHTML = `
    <h2>Productos por categoría</h2>
    <table class="table">
      <thead><tr><th>Categoría</th><th class="right">#</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="2">Sin datos</td></tr>'}</tbody>
    </table>`;
}

// ====================================================
// CONTACTO (envío simple)
// ====================================================
function initContacto(){
  const form = $('#formContacto');
  const msg  = $('#msgContacto');
  if(!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = {
      nombre:  $('#cNombre').value.trim(),
      email:   $('#cEmail').value.trim(),
      asunto:  $('#cAsunto').value.trim(),
      mensaje: $('#cMensaje').value.trim(),
      fecha:   new Date().toISOString()
    };
    if(!body.nombre || !body.email || !body.asunto || !body.mensaje){
      msg.textContent = 'Completa todos los campos.'; 
      return;
    }
    try{
      const r = await fetch(`${API_URL}/contactos`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(!r.ok) throw new Error('POST /contactos');
      msg.textContent = 'Mensaje enviado ✅';
      form.reset();
    }catch(err){
      console.error(err);
      msg.textContent = 'No se pudo enviar el mensaje.';
    }
  });
}

// ====================================================
// ROUTER por data-page
// ====================================================
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;
  if(page === 'home')     initHome();
  if(page === 'contacto') initContacto();
  // (admin, catalogo y carrito tienen sus propios JS)
});
