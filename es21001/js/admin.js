const APIc = "https://www5.comuna.tpi/categorias";
const APIp = "https://www5.comuna.tpi/productos";

const fCat      = document.getElementById('fCat');
const listCats  = document.getElementById('listCats');

const fProd     = document.getElementById('fProd');
const listProds = document.getElementById('listProds');
const selCat    = document.getElementById('selCat');

const imgUrlInput = document.getElementById('imagenUrl');
const imgPrev     = document.getElementById('imgPreview');

function bust(url){ 
  return `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`; 
}

 // Cateogira
function catItem(c){
  return `
  <li>
    <span class="meta">
      <span class="badge">${c.id}</span>
      <span>${c.nombre}</span>
    </span>
    <span class="row-actions">
      <button class="edit-cat" data-id="${c.id}">Editar</button>
      <button class="del-cat"  data-id="${c.id}">Borrar</button>
    </span>
  </li>`;
}


async function loadCats(){
  const r = await fetch(bust(APIc), { headers:{ 'Accept':'application/json' } });
  if (!r.ok) { console.error('Error al cargar categorías'); return; }
  const cats = await r.json();
  listCats.innerHTML = cats.map(catItem).join('') || '<li>(Sin categorías)</li>';
  selCat.innerHTML   = cats.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('') || '<option value="" disabled>(Sin categorías)</option>';
}

fCat.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(fCat);
  const body = { nombre: fd.get('nombre') }; // json-server genera id

  const r = await fetch(APIc, {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify(body)
  });
  if (!r.ok) { alert('Error creando categoría'); return; }

  await loadCats();
  fCat.reset();
});

// Editar / borrar categorías
listCats.addEventListener('click', async (e)=>{
  const btn = e.target;
  if (!btn.dataset.id) return;
  const id = btn.dataset.id; // string

  if (btn.classList.contains('edit-cat')) {
    const nombre = prompt('Nuevo nombre de categoría:');
    if (nombre === null || nombre === '') return;
    await fetch(`${APIc}/${encodeURIComponent(id)}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ nombre })
    });
    loadCats();
  }

  if (btn.classList.contains('del-cat')) {
    if (!confirm('¿Borrar categoría?')) return;
    await fetch(`${APIc}/${encodeURIComponent(id)}`, { method:'DELETE' });
    loadCats();
  }
});

 // Productos
function prodItem(p){
  const thumb = p.imagenUrl
    ? `<img class="thumb" src="${p.imagenUrl}" alt="" loading="lazy" onerror="this.style.display='none'">`
    : '';
  return `
  <li>
    <span class="meta">
      ${thumb}
      <span class="badge">${p.id}</span>
      <span>${p.nombre} — ${p.marca} — $${p.precio} — stock ${p.stock} — cat:${p.categoriaId}</span>
    </span>
    <span class="row-actions">
      <button class="edit-prod" data-id="${p.id}">Editar</button>
      <button class="del-prod"  data-id="${p.id}">Borrar</button>
    </span>
  </li>`;
}


async function loadProds(){
  const r = await fetch(bust(APIp), { headers:{ 'Accept':'application/json' } });
  if (!r.ok) { console.error('Error al cargar productos'); return; }
  const prods = await r.json();
  listProds.innerHTML = prods.map(prodItem).join('') || '<li>(Sin productos)</li>';
}

// Preview en vivo del link de imagen
if (imgUrlInput && imgPrev){
  imgUrlInput.addEventListener('input', ()=>{
    const url = (imgUrlInput.value || '').trim();
    if(!/^https?:\/\//i.test(url)) { imgPrev.style.display='none'; imgPrev.src=''; return; }
    imgPrev.src = url;
    imgPrev.style.display = 'block';
  });
  imgPrev.onerror = ()=>{ imgPrev.style.display='none'; };
}

fProd.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(fProd);

  const body = {
    nombre: fd.get('nombre'),
    marca: fd.get('marca'),
    precio: parseFloat(fd.get('precio')),
    stock: parseInt(fd.get('stock'), 10),
    categoriaId: fd.get('categoriaId'),
    imagenUrl: (fd.get('imagenUrl') || '').trim() || null
  };

  const r = await fetch(APIp, {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify(body)
  });
  if (!r.ok) { alert('Error creando producto'); return; }

  await loadProds();
  fProd.reset();
  if (imgPrev){ imgPrev.style.display='none'; }
});

// Editar / borrar productos
listProds.addEventListener('click', async (e)=>{
  const btn = e.target;
  if (!btn.dataset.id) return;
  const id = btn.dataset.id; 

  if (btn.classList.contains('edit-prod')) {
    const precio = prompt('Nuevo precio:');
    if (precio === null || precio === '') return; 
    await fetch(`${APIp}/${encodeURIComponent(id)}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ precio: parseFloat(precio) })
    });
    loadProds();
  }

  if (btn.classList.contains('del-prod')) {
    if (!confirm('¿Borrar producto?')) return;
    await fetch(`${APIp}/${encodeURIComponent(id)}`, { method:'DELETE' });
    loadProds();
  }
});

loadCats().then(loadProds);
