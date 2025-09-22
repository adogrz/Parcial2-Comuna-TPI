const API = 'http://localhost:3000';

// helpers
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const j  = async (res) => { if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); };
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');

// =================== INICIO (index.html): KPIs ===================
async function initHome(){
  try{
    const [arts, songs, gens] = await Promise.all([
      fetch(`${API}/artistas`).then(j),
      fetch(`${API}/canciones`).then(j),
      fetch(`${API}/generos`).then(j),
    ]);
    $('#kpiArtistas')  && ($('#kpiArtistas').textContent  = arts.length);
    $('#kpiCanciones') && ($('#kpiCanciones').textContent = songs.length);
    $('#kpiGeneros')   && ($('#kpiGeneros').textContent   = gens.length);
  }catch(err){
    console.error(err);
    $('#kpiArtistas')  && ($('#kpiArtistas').textContent  = '-');
    $('#kpiCanciones') && ($('#kpiCanciones').textContent = '-');
    $('#kpiGeneros')   && ($('#kpiGeneros').textContent   = '-');
  }
}

// =================== ARTISTAS (artistas.html) ===================
async function loadArtistas(){
  const data = await fetch(`${API}/artistas?_sort=nombre`).then(j);
  const tbody = $('#tbArtistas');
  if (!tbody) return;

  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${esc(a.id)}</td>
      <td>${esc(a.nombre)}</td>
      <td>${esc(a.pais ?? '')}</td>
      <td>
        <button onclick="editArt('${esc(a.id)}','${esc(a.nombre)}','${esc(a.pais ?? '')}')">Editar</button>
        <button class="danger" onclick="delArt('${esc(a.id)}')">Eliminar</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="4">Sin datos</td></tr>`;
}

window.editArt = (id,nombre,pais)=>{
  $('#artId').value = id;            // no convertir a número
  $('#artNombre').value = nombre || '';
  $('#artPais').value = pais || '';
  $('#msgArt') && ($('#msgArt').textContent = `Editando #${id}`);
};

window.delArt = async(id)=>{
  if(!confirm('¿Eliminar este artista?')) return;
  await fetch(`${API}/artistas/${encodeURIComponent(id)}`,{ method:'DELETE' });
  $('#msgArt') && ($('#msgArt').textContent = `Eliminado #${id}`);
  await loadArtistas();
};

function hookArtistasForm(){
  const form = $('#formArtista'); if(!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id     = $('#artId').value.trim();
    const nombre = $('#artNombre').value.trim();
    const pais   = $('#artPais').value.trim();

    if(!nombre || !pais) { alert('Completa nombre y país'); return; }

    if(id){
      await fetch(`${API}/artistas/${encodeURIComponent(id)}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ nombre, pais })
      });
      $('#msgArt') && ($('#msgArt').textContent = `Actualizado #${id}`);
    }else{
      const r = await fetch(`${API}/artistas`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ nombre, pais }) // ← sin id
      });
      const nuevo = await r.json();
      $('#msgArt') && ($('#msgArt').textContent = `Creado #${nuevo.id}`);
    }
    form.reset(); $('#artId').value='';
    await loadArtistas();
  });

  $('#artReset')?.addEventListener('click', ()=>{
    form.reset(); $('#artId').value=''; $('#msgArt') && ($('#msgArt').textContent='');
  });
}

async function initArtistas(){
  hookArtistasForm();
  await loadArtistas();
}

// =================== GENEROS (generos.html) ===================
async function loadGeneros(){
  const data = await fetch(`${API}/generos?_sort=nombre`).then(j);
  const tbody = $('#tbGeneros');
  if (!tbody) return;

  tbody.innerHTML = data.map(g => `
    <tr>
      <td>${esc(g.id)}</td>
      <td>${esc(g.nombre)}</td>
      <td>
        <button onclick="editGen('${esc(g.id)}','${esc(g.nombre)}')">Editar</button>
        <button class="danger" onclick="delGen('${esc(g.id)}')">Eliminar</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="3">Sin datos</td></tr>`;
}

window.editGen = (id,nombre)=>{
  $('#genId').value = id;
  $('#genNombre').value = nombre || '';
  $('#msgGen') && ($('#msgGen').textContent = `Editando #${id}`);
};

window.delGen = async(id)=>{
  if(!confirm('¿Eliminar este género? (Afectará canciones que lo usen)')) return;
  await fetch(`${API}/generos/${encodeURIComponent(id)}`,{ method:'DELETE' });
  $('#msgGen') && ($('#msgGen').textContent = `Eliminado #${id}`);
  await loadGeneros();
};

function hookGenerosForm(){
  const form = $('#formGenero'); if(!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id     = $('#genId').value.trim();
    const nombre = $('#genNombre').value.trim();
    if(!nombre){ alert('Nombre requerido'); return; }

    if(id){
      await fetch(`${API}/generos/${encodeURIComponent(id)}`,{
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ nombre })
      });
      $('#msgGen') && ($('#msgGen').textContent = `Actualizado #${id}`);
    }else{
      const r = await fetch(`${API}/generos`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ nombre }) // ← sin id
      });
      const nuevo = await r.json();
      $('#msgGen') && ($('#msgGen').textContent = `Creado #${nuevo.id}`);
    }
    form.reset(); $('#genId').value='';
    await loadGeneros();
  });

  $('#genReset')?.addEventListener('click', ()=>{
    form.reset(); $('#genId').value=''; $('#msgGen') && ($('#msgGen').textContent='');
  });
}

async function initGeneros(){
  hookGenerosForm();
  await loadGeneros();
}

// =================== CANCIONES (canciones.html) ===================
async function fillSongSelects(){
  const [arts, gens] = await Promise.all([
    fetch(`${API}/artistas?_sort=nombre`).then(j),
    fetch(`${API}/generos?_sort=nombre`).then(j),
  ]);

  const selA = $('#songArtista'), selG = $('#songGenero');
  if (selA) selA.innerHTML = '<option value="">— Selecciona Artista —</option>' +
    arts.map(a=>`<option value="${esc(a.id)}">${esc(a.nombre)}</option>`).join('');
  if (selG) selG.innerHTML = '<option value="">— Selecciona Género —</option>' +
    gens.map(g=>`<option value="${esc(g.id)}">${esc(g.nombre)}</option>`).join('');

  return { arts, gens };
}

async function loadCanciones(){
  const songs = await fetch(`${API}/canciones?_sort=titulo`).then(j);
  const [arts, gens] = await Promise.all([
    fetch(`${API}/artistas`).then(j),
    fetch(`${API}/generos`).then(j),
  ]);
  const mapA = Object.fromEntries(arts.map(a=>[String(a.id), a.nombre]));
  const mapG = Object.fromEntries(gens.map(g=>[String(g.id), g.nombre]));

  const tbody = $('#tbCanciones');
  if (!tbody) return;

  tbody.innerHTML = songs.map(s=>`
    <tr>
      <td>${esc(s.id)}</td>
      <td>${esc(s.titulo)}</td>
      <td>${esc(mapA[String(s.artistaId)] ?? s.artistaId)}</td>
      <td>${esc(mapG[String(s.generoId)]  ?? s.generoId)}</td>
      <td>
        <button onclick="editSong('${esc(s.id)}','${esc(s.titulo)}','${esc(s.artistaId ?? '')}','${esc(s.generoId ?? '')}')">Editar</button>
        <button class="danger" onclick="delSong('${esc(s.id)}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

window.editSong = (id,titulo,artistaId,generoId)=>{
  $('#songId').value = id;
  $('#songTitulo').value = titulo || '';
  $('#songArtista').value = String(artistaId || '');
  $('#songGenero').value  = String(generoId  || '');
  $('#msgSong') && ($('#msgSong').textContent = `Editando #${id}`);
};

window.delSong = async(id)=>{
  if(!confirm('¿Eliminar esta canción?')) return;
  await fetch(`${API}/canciones/${encodeURIComponent(id)}`,{ method:'DELETE' });
  $('#msgSong') && ($('#msgSong').textContent = `Eliminada #${id}`);
  await loadCanciones();
};

function hookCancionesForm(){
  const form = $('#formCancion'); if(!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id       = $('#songId').value.trim();
    const titulo   = $('#songTitulo').value.trim();
    const artistaId= $('#songArtista').value.trim();
    const generoId = $('#songGenero').value.trim();

    if(!titulo || !artistaId || !generoId){
      alert('Completa título, artista y género'); return;
    }

    const body = { titulo, artistaId, generoId };
    if(id){
      await fetch(`${API}/canciones/${encodeURIComponent(id)}`,{
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      $('#msgSong') && ($('#msgSong').textContent = `Actualizada #${id}`);
    }else{
      const r = await fetch(`${API}/canciones`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body) // ← sin id
      });
      const nuevo = await r.json();
      $('#msgSong') && ($('#msgSong').textContent = `Creada #${nuevo.id}`);
    }
    form.reset(); $('#songId').value='';
    await loadCanciones();
  });

  $('#songReset')?.addEventListener('click', ()=>{
    $('#formCancion').reset();
    $('#songId').value=''; $('#msgSong') && ($('#msgSong').textContent='');
  });
}

async function initCanciones(){
  await fillSongSelects();
  hookCancionesForm();
  await loadCanciones();
}

// -------- CONTACTO (contacto.html) — Conservado --------
async function loadContactos(){
  const ul = document.getElementById('listaContactos');
  if(!ul) return;
  const data = await fetch(`${API}/contactos?_sort=id&_order=desc&_limit=10`).then(j);
  ul.innerHTML = data.length
    ? data.map(c => `
        <li>
          <strong>${esc(c.nombre)}</strong> — ${esc(c.asunto)}<br>
          <small>${esc(c.email)}</small><br>
          ${esc(c.mensaje)}
        </li>`).join('')
    : '<li>No hay mensajes todavía.</li>';
}

function initContacto(){
  const form = document.getElementById('formContacto');
  if(!form) return;
  const msg = document.getElementById('msgContacto');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = {
      nombre:  document.getElementById('cNombre').value.trim(),
      email:   document.getElementById('cEmail').value.trim(),
      asunto:  document.getElementById('cAsunto').value.trim(),
      mensaje: document.getElementById('cMensaje').value.trim(),
      fecha:   new Date().toISOString()
    };

    if(!body.nombre || !body.email || !body.asunto || !body.mensaje){
      msg.textContent = 'Completa todos los campos.'; return;
    }

    await fetch(`${API}/contactos`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body) // ← sin id
    });

    msg.textContent = 'Mensaje enviado ✅';
    form.reset();
    await loadContactos();
  });

  loadContactos();
}

// -------- REPORTE: Canciones por género (index.html) — Conservado --------
async function renderReporteCancionesPorGenero(){
  const host = document.getElementById('rep-cpg');
  if(!host) return;

  const [canciones, generos] = await Promise.all([
    fetch(`${API}/canciones`).then(j),
    fetch(`${API}/generos`).then(j)
  ]);

  const mapG = Object.fromEntries(generos.map(g=>[String(g.id), g.nombre]));
  const conteo = {};
  canciones.forEach(c => {
    const key = mapG[String(c.generoId)] || `Género ${c.generoId}`;
    conteo[key] = (conteo[key]||0) + 1;
  });

  const rows = Object.entries(conteo)
    .sort((a,b)=>b[1]-a[1])
    .map(([nombre, total]) =>
      `<tr><td>${esc(nombre)}</td><td class="right">${total}</td></tr>`
    ).join('');

  host.innerHTML = `
    <table class="table">
      <thead><tr><th>Género</th><th class="right"># Canciones</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="2">Sin datos</td></tr>'}</tbody>
    </table>`;
}

// -------- Ruteo simple por página --------
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;
  if(page === 'home')      { initHome(); renderReporteCancionesPorGenero(); }
  if(page === 'artistas')  initArtistas();
  if(page === 'generos')   initGeneros();
  if(page === 'canciones') initCanciones();
  if(page === 'contacto')  initContacto();
});
