// js/catalogo.js
import { ep, $, j, esc, money, get, post, put, del } from './app.js';

let marcas = [];
let bebidas = [];

const byId = (id) => bebidas.find(b => String(b.id) === String(id));

function tplCard(b){
  const marca = marcas.find(m => m.id == b.marcaId)?.nombre || '—';
  const img = esc(b.imagen || 'https://picsum.photos/600/400');
  return `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card h-100 shadow-sm">
        <img src="${img}" class="card-img-top" alt="${esc(b.nombre)}"
             onerror="this.onerror=null;this.src='https://picsum.photos/600/400'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${esc(b.nombre)}</h5>
          <p class="text-muted mb-1">Marca: ${esc(marca)}</p>
          <p class="mb-1">Sabor: ${esc(b.sabor||'-')}</p>
          <p class="fw-bold mb-3">$ ${money(b.precio)} • ${b.mililitros} ml</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-primary" data-edit="${b.id}">Editar</button>
            <button class="btn btn-sm btn-danger"  data-del="${b.id}">Eliminar</button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderSelectMarcas(sel){
  sel.innerHTML = marcas.map(m=>`<option value="${m.id}">${esc(m.nombre)}</option>`).join('');
}

function renderFiltroMarcas(sel){
  sel.innerHTML = `<option value="">Todas</option>` + marcas.map(m=>`<option value="${m.id}">${esc(m.nombre)}</option>`).join('');
}

function render(){
  const host  = $('#catalogo');               // grid
  const q     = ($('#q')?.value || '').toLowerCase();
  const f     = $('#fMarca')?.value || '';

  let list = [...bebidas];
  if(q) list = list.filter(b => (b.nombre + ' ' + (b.sabor||'')).toLowerCase().includes(q));
  if(f) list = list.filter(b => String(b.marcaId) === String(f));

  host.innerHTML = list.map(tplCard).join('') ||
    `<div class="col-12"><div class="alert alert-info">Sin bebidas.</div></div>`;
}

async function load(){
  $('#catalogo').innerHTML = '<div class="col-12"><p class="muted">Cargando bebidas…</p></div>';
  [marcas, bebidas] = await Promise.all([ get(ep.marcas), get(ep.bebidas) ]);
  if($('#bebidaMarca')) renderSelectMarcas($('#bebidaMarca'));
  if($('#fMarca'))      renderFiltroMarcas($('#fMarca'));
  render();
}

// Guardar desde formulario si existe, si no usar prompts
async function openCreate(){
  if($('#formBebida')){
    $('#formBebida').reset();
    $('#bebidaId').value = '';
    renderSelectMarcas($('#bebidaMarca'));
    new bootstrap.Modal(document.getElementById('modalBebida')).show();
  }else{
    const nombre = prompt('Nombre de la bebida:'); if(!nombre) return;
    const marcaId = prompt('ID de marca:');        if(!marcaId) return;
    const sabor = prompt('Sabor:') || '';
    const ml = Number(prompt('Mililitros:', '355')||0);
    const precio = Number(prompt('Precio:', '1.00')||0);
    const imagen = prompt('URL de imagen:') || '';
    const created = await post(ep.bebidas, { nombre, marcaId:Number(marcaId), sabor, mililitros:ml, precio, imagen });
    bebidas.push(created);
    render();
  }
}
async function openEdit(id){
  const b = byId(id); if(!b) return;

  if($('#formBebida')){
    $('#bebidaId').value = b.id;
    $('#bebidaNombre').value = b.nombre;
    $('#bebidaSabor').value = b.sabor || '';
    $('#bebidaMl').value = b.mililitros;
    $('#bebidaPrecio').value = b.precio;
    $('#bebidaImagen').value = b.imagen || '';
    renderSelectMarcas($('#bebidaMarca'));
    $('#bebidaMarca').value = b.marcaId;
    new bootstrap.Modal(document.getElementById('modalBebida')).show();
  }else{
    const nombre = prompt('Nombre:', b.nombre) || b.nombre;
    const marcaId = Number(prompt('ID de marca:', b.marcaId) || b.marcaId);
    const sabor = prompt('Sabor:', b.sabor||'') || b.sabor;
    const ml = Number(prompt('Mililitros:', b.mililitros)||b.mililitros);
    const precio = Number(prompt('Precio:', b.precio)||b.precio);
    const imagen = prompt('URL imagen:', b.imagen||'') || b.imagen;
    const upd = await put(`${ep.bebidas}/${b.id}`, { id:b.id, nombre, marcaId, sabor, mililitros:ml, precio, imagen });
    bebidas = bebidas.map(x => x.id==b.id ? upd : x);
    render();
  }
}
async function removeBebida(id){
  if(!confirm('¿Eliminar bebida?')) return;
  await del(`${ep.bebidas}/${id}`);
  bebidas = bebidas.filter(b => String(b.id)!==String(id));
  render();
}

// Eventos
document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await load(); }catch(e){ console.error(e); $('#catalogo').innerHTML = '<div class="col-12"><div class="alert alert-danger">No se pudo cargar.</div></div>'; }

  $('#q')?.addEventListener('input', render);
  $('#fMarca')?.addEventListener('change', render);
  $('#btnNuevaBebida')?.addEventListener('click', openCreate);

  // submit del form (si existe)
  $('#formBebida')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = $('#bebidaId').value;
    const body = {
      nombre: $('#bebidaNombre').value.trim(),
      sabor: $('#bebidaSabor').value.trim(),
      mililitros: Number($('#bebidaMl').value),
      precio: Number($('#bebidaPrecio').value),
      imagen: $('#bebidaImagen').value.trim(),
      marcaId: Number($('#bebidaMarca').value)
    };
    if(id){
      const upd = await put(`${ep.bebidas}/${id}`, { id:Number(id), ...body });
      bebidas = bebidas.map(b => b.id==id ? upd : b);
    }else{
      const cre = await post(ep.bebidas, body);
      bebidas.push(cre);
    }
    render();
    bootstrap.Modal.getInstance(document.getElementById('modalBebida'))?.hide();
  });

  document.addEventListener('click', (e)=>{
    const eid = e.target?.dataset?.edit;
    const did = e.target?.dataset?.del;
    if(eid) openEdit(eid);
    if(did) removeBebida(did);
  });
});
