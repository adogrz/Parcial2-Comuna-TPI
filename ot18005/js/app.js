/*CONFIGURACIÓN DE API*/
const MI_CARNET = 'ot18005';
const esDesarrolloLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_URL = esDesarrolloLocal ? 'http://localhost:3000'
  : `https://${MI_CARNET}.comuna.tpi/api`;

// Colecciones reales según basedatos.json
const API_ARTICULOS = `${API_URL}/articulos`;
const API_RESERVACIONES = `${API_URL}/reservaciones`;

/* HELPERS */
const idPath = (base, id) => `${base}/${encodeURIComponent(id)}`;

function jfetch(url, opts = {}) {
  return fetch(url, opts).then(async (r) => {
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      throw new Error(`${r.status} ${r.statusText} — ${url}\n${body}`);
    }
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? r.json() : r.text();
  });
}

/* =========================
   CRUD Artículos
   ========================= */
function cardArticulo(art) {
  const img = art.imagen && art.imagen.trim()
    ? art.imagen
    : 'https://via.placeholder.com/600?text=Mascotas';

  return `
    <div class="articulo">
      <div class="img-wrap">
        <img src="${img}" alt="${art.nombre}">
      </div>
      <h3>${art.nombre}</h3>
      <p>${art.descripcion ?? ''}</p>
      <p>Categoría: ${art.categoria ?? ''}</p>
      <p>Precio: $${Number(art.precio ?? 0).toFixed(2)}</p>
      <p>Stock: ${art.stock ?? 0}</p>
      <button onclick="eliminarArticulo('${String(art.id)}')">Borrar</button>
      <button onclick="editarArticulo('${String(art.id)}')">Editar</button>
    </div>
  `;
}

function editarArticulo(id) {
  window.location.href = `../secciones/formulario.html?id=${id}`;
}


function mostrarArticulos() {
  jfetch(`${API_URL}/articulos`).then(data => {
    const lista = document.getElementById('lista-articulos');
    if (!lista) return;

    const items = CATEGORIA_ACTIVA === 'todos'
      ? data
      : data.filter(a => String(a.categoria).toLowerCase() === String(CATEGORIA_ACTIVA).toLowerCase());

    lista.innerHTML = items.map(cardArticulo).join('');
  }).catch(err => console.error('Error al mostrar artículos:', err));
}

function agregarArticulo() {
  const nuevo = {
    nombre: document.getElementById('nombre-art').value,
    descripcion: document.getElementById('descripcion-art').value,
    categoria: document.getElementById('categoria-art').value,
    precio: parseFloat(document.getElementById('precio-art').value || '0'),
    stock: parseInt(document.getElementById('stock-art').value || '0', 10),
    imagen: document.getElementById('imagen-art').value || ''
  };
  jfetch(API_ARTICULOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo)
  }).then(() => { mostrarArticulos(); document.getElementById('form-articulos').reset(); });
}

function eliminarArticulo(id) {
  if (confirm('¿Borrar artículo?')) {
    jfetch(idPath(API_ARTICULOS, id), { method: 'DELETE' }).then(mostrarArticulos);
  }
}

function cargarParaEditar(id) {
  jfetch(idPath(API_ARTICULOS, id)).then(data => {
    document.getElementById('id-art').value = data.id;
    document.getElementById('nombre-art').value = data.nombre ?? '';
    document.getElementById('descripcion-art').value = data.descripcion ?? '';
    document.getElementById('categoria-art').value = data.categoria ?? '';
    document.getElementById('precio-art').value = data.precio ?? '';
    document.getElementById('stock-art').value = data.stock ?? '';
    document.getElementById('imagen-art').value = data.imagen ?? '';
  });
}

function actualizarArticulo() {
  const id = document.getElementById('id-art').value;
  const act = {
    nombre: document.getElementById('nombre-art').value,
    descripcion: document.getElementById('descripcion-art').value,
    categoria: document.getElementById('categoria-art').value,
    precio: parseFloat(document.getElementById('precio-art').value || '0'),
    stock: parseInt(document.getElementById('stock-art').value || '0', 10),
    imagen: document.getElementById('imagen-art').value || ''
  };
  jfetch(idPath(API_ARTICULOS, id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(act)
  }).then(() => { mostrarArticulos(); document.getElementById('form-articulos').reset(); });
}

/* =========================
   CRUD Reservaciones
   ========================= */

function mostrarReservaciones() {
  jfetch(API_RESERVACIONES).then(data => {
    const lista = document.getElementById('lista-reservaciones');
    if (!lista) return;
    lista.innerHTML = '';
    data.forEach(r => {
      lista.innerHTML += `
        <div class="reserva">
          <h3>${r.nombre}</h3>
          <p>Mascota: ${r.mascota}</p>
          <p>Descripción: ${r.descripcion}</p>
          <p>Fecha: ${r.fecha}</p>
          <button onclick="eliminarReserva('${String(r.id)}')">Borrar</button>
          <button onclick="cargarReserva('${String(r.id)}')">Editar</button>
        </div>`;
    });
  }).catch(err => console.error('Error al mostrar reservaciones:', err));
}

function agregarReserva() {
  const nueva = {
    nombre:  document.getElementById('nombre-cliente')?.value || '',
    mascota: document.getElementById('mascota')?.value || '',
    descripcion: document.getElementById('descripcion')?.value || '',
    fecha:   document.getElementById('fecha')?.value || ''
  };
  jfetch(API_RESERVACIONES, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(nueva)
  }).then(() => {
    mostrarReservaciones();
    document.getElementById('form-reservaciones')?.reset();
  });
}

function eliminarReserva(id) {
  if (confirm('¿Borrar reservación?')) {
    jfetch(idPath(API_RESERVACIONES, id), { method: 'DELETE' })
      .then(mostrarReservaciones);
  }
}

function cargarReserva(id) {
  jfetch(idPath(API_RESERVACIONES, id)).then(r => {
    document.getElementById('id-reserva').value         = r.id ?? '';
    document.getElementById('nombre-cliente').value     = r.nombre ?? '';
    document.getElementById('mascota').value            = r.mascota ?? '';
    document.getElementById('descripcion').value            = r.descripcion ?? '';
    document.getElementById('fecha').value              = r.fecha ?? '';
  });
}

function actualizarReserva() {
  const id = document.getElementById('id-reserva').value;
  const act = {
    nombre:  document.getElementById('nombre-cliente')?.value || '',
    mascota: document.getElementById('mascota')?.value || '',
    descripcion: document.getElementById('descripcion')?.value || '',
    fecha:   document.getElementById('fecha')?.value || ''
  };
  jfetch(idPath(API_RESERVACIONES, id), {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(act)
  }).then(() => {
    mostrarReservaciones();
    document.getElementById('form-reservaciones')?.reset();
  });
}

let CATEGORIA_ACTIVA = 'todos';

async function renderCategorias() {
  const barra = document.getElementById('barra-categorias');
  if (!barra) return;

  let cats = [];
  try {
    const data = await jfetch(`${API_URL}/categorias`);
    cats = Array.isArray(data) ? data.map(c => c.nombre) : [];
  } catch {
    try {
      const arts = await jfetch(`${API_URL}/articulos`);
      cats = [...new Set(arts.map(a => a.categoria).filter(Boolean))];
    } catch {}
  }

  const todas = ['todos', ...cats];
  barra.innerHTML = todas.map(c => `
    <button class="cat-chip ${c===CATEGORIA_ACTIVA?'active':''}" data-cat="${c}">${c[0].toUpperCase()+c.slice(1)}</button>
  `).join('');

  barra.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      CATEGORIA_ACTIVA = btn.dataset.cat;
      barra.querySelectorAll('.cat-chip').forEach(b => b.classList.toggle('active', b===btn));
      mostrarArticulos();
    });
  });
}

window.onload = function () {
  if (document.getElementById('lista-articulos')) {
    renderCategorias().then(mostrarArticulos);
  }

  if (document.getElementById('lista-reservaciones')) {
    mostrarReservaciones?.();
  }
};