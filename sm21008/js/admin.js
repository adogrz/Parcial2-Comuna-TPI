// js/admin.js
import { ep, $, j, esc, get, post, put, del } from './app.js';

let marcas = [];
let bebidas = []; // para validar asociaciones

function render(filtro=''){
  const term = filtro.toLowerCase().trim();
  const tb = $('#tbodyMarcas');
  const lista = marcas
    .filter(m => !term || (m.nombre||'').toLowerCase().includes(term) || (m.pais||'').toLowerCase().includes(term))
    .sort((a,b)=> String(a.nombre).localeCompare(String(b.nombre)));

  tb.innerHTML = lista.map(m => `
    <tr>
      <td>${m.id}</td>
      <td>${esc(m.nombre)}</td>
      <td>${esc(m.pais||'-')}</td>
      <td>${m.sitio ? `<a href="${esc(m.sitio)}" target="_blank" rel="noopener">Visitar</a>` : '-'}</td>
      <td class="d-flex gap-2">
        <button class="btn btn-sm btn-primary" data-edit="${m.id}">Editar</button>
        <button class="btn btn-sm btn-danger"  data-del="${m.id}">Eliminar</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5">Sin marcas.</td></tr>`;
}

async function load(){
  [marcas, bebidas] = await Promise.all([ get(ep.marcas), get(ep.bebidas) ]);
  render();
}

async function openCreate(){
  if($('#formMarca')){
    $('#formMarca').reset();
    $('#marcaId').value = '';
    new bootstrap.Modal(document.getElementById('modalMarca')).show();
  }else{
    const nombre = prompt('Nombre:'); if(!nombre) return;
    const pais = prompt('País:') || '';
    const sitio = prompt('Sitio web (https://...):') || '';
    const cre = await post(ep.marcas, {nombre, pais, sitio});
    marcas.push(cre); render();
  }
}
async function openEdit(id){
  const m = marcas.find(x=>String(x.id)===String(id)); if(!m) return;
  if($('#formMarca')){
    $('#marcaId').value = m.id;
    $('#marcaNombre').value = m.nombre;
    $('#marcaPais').value = m.pais || '';
    $('#marcaSitio').value = m.sitio || '';
    new bootstrap.Modal(document.getElementById('modalMarca')).show();
  }else{
    const nombre = prompt('Nombre:', m.nombre) || m.nombre;
    const pais = prompt('País:', m.pais||'') || m.pais;
    const sitio = prompt('Sitio:', m.sitio||'') || m.sitio;
    const upd = await put(`${ep.marcas}/${m.id}`, { id:m.id, nombre, pais, sitio });
    marcas = marcas.map(x=>x.id==m.id?upd:x); render();
  }
}
async function removeMarca(id){
  const asociadas = bebidas.filter(b => String(b.marcaId)===String(id)).length;
  if(asociadas>0){ alert(`No puedes eliminar: hay ${asociadas} bebida(s) asociada(s).`); return; }
  if(!confirm('¿Eliminar marca?')) return;
  await del(`${ep.marcas}/${id}`);
  marcas = marcas.filter(x => String(x.id)!==String(id)); render();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await load(); }catch(e){ console.error(e); alert('No se pudo cargar Marcas/Bebidas'); }

  $('#buscarMarca')?.addEventListener('input', e => render(e.target.value));
  $('#btnNuevaMarca')?.addEventListener('click', openCreate);

  // guardar (si hay form)
  $('#formMarca')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = $('#marcaId').value;
    const body = {
      nombre: $('#marcaNombre').value.trim(),
      pais:   $('#marcaPais').value.trim(),
      sitio:  $('#marcaSitio').value.trim()
    };
    if(id){
      const upd = await put(`${ep.marcas}/${id}`, { id:Number(id), ...body });
      marcas = marcas.map(m => m.id==id ? upd : m);
    }else{
      const cre = await post(ep.marcas, body);
      marcas.push(cre);
    }
    render($('#buscarMarca')?.value || '');
    bootstrap.Modal.getInstance(document.getElementById('modalMarca'))?.hide();
  });

  document.addEventListener('click', (e)=>{
    const eid = e.target?.dataset?.edit;
    const did = e.target?.dataset?.del;
    if(eid) openEdit(eid);
    if(did) removeMarca(did);
  });
});
