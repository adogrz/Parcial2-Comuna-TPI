// js/admin.js
import { API_URL } from './app.js';

// ========= DOM =========
const catList = document.getElementById("lista-categorias");
const catForm = document.getElementById("form-categoria");
const catId = document.getElementById("cat-id");
const catNombre = document.getElementById("cat-nombre");

const prodList = document.getElementById("lista-productos");
const prodForm = document.getElementById("form-producto");
const prodId = document.getElementById("prod-id");
const prodNombre = document.getElementById("prod-nombre");
const prodPrecio = document.getElementById("prod-precio");
const prodCategoria = document.getElementById("prod-categoria");
const prodImagen = document.getElementById("prod-imagen");
const prodDesc = document.getElementById("prod-desc");
const prodCancel = document.getElementById("prod-cancel");

// ========= STATE =========
let categorias = [];
let productos = [];

// ========= UTILS =========
const money = n => `$${Number(n || 0).toFixed(2)}`;
function resetCategoriaForm(){ catId.value = ""; catNombre.value = ""; }
function resetProductoForm(){
  prodId.value = ""; prodNombre.value = ""; prodPrecio.value = "";
  prodCategoria.value = ""; prodImagen.value = ""; prodDesc.value = "";
}
function getRowIdFromEvent(e) {
  const btnId = e.target?.dataset?.id;
  if (btnId !== undefined) return String(btnId);
  const row = e.target.closest("[data-id]");
  return row ? String(row.dataset.id) : "";
}

// ========= LOAD =========
async function loadData(){
  const [rc, rp] = await Promise.all([
    fetch(`${API_URL}/categorias`),
    fetch(`${API_URL}/productos`)
  ]);
  if (!rc.ok || !rp.ok) throw new Error("HTTP error al cargar datos");
  categorias = await rc.json();
  productos = await rp.json();
  renderCategorias();
  fillCategoriaSelect();
  renderProductos();
}

function fillCategoriaSelect(){
  prodCategoria.innerHTML =
    `<option value="" disabled selected>Seleccione categoría</option>` +
    categorias.map(c => `<option value="${String(c.id)}">${c.nombre}</option>`).join("");
}

// ========= RENDER =========
function renderCategorias(){
  catList.innerHTML = categorias.map(c => `
    <div class="row" data-id="${String(c.id)}">
      <span><strong>${c.nombre}</strong> <span class="muted">(id: ${String(c.id)})</span></span>
      <span>
        <button class="sm js-cat-edit" data-id="${String(c.id)}">Editar</button>
        <button class="sm danger js-cat-del" data-id="${String(c.id)}">Eliminar</button>
      </span>
    </div>
  `).join("") || "<p>No hay categorías.</p>";
}

function renderProductos(){
  const mapCat = Object.fromEntries(categorias.map(c => [String(c.id), c.nombre]));
  prodList.innerHTML = productos.map(p => `
    <div class="row" data-id="${String(p.id)}">
      <span class="prod">
        <img src="${p.imagen || 'assets/img/logo.svg'}" alt="" class="thumb">
        <span>
          <strong>${p.nombre}</strong><br>
          ${mapCat[String(p.categoriaId)] || "Sin categoría"} — ${money(p.precio)}
        </span>
      </span>
      <span>
        <button class="sm js-prod-edit" data-id="${String(p.id)}">Editar</button>
        <button class="sm danger js-prod-del" data-id="${String(p.id)}">Eliminar</button>
      </span>
    </div>
  `).join("") || "<p>No hay productos.</p>";
}

// ========= CATEGORÍAS: eventos =========
catList.addEventListener("click", async (e) => {
  const id = getRowIdFromEvent(e);
  if (!id) return;

  if (e.target.classList.contains("js-cat-edit")) {
    const c = categorias.find(x => String(x.id) === id);
    if (!c) return;
    catId.value = String(c.id);
    catNombre.value = c.nombre || "";
  }

  if (e.target.classList.contains("js-cat-del")) {
    const usados = productos.some(p => String(p.categoriaId) === id);
    if (usados) { alert("No se puede eliminar: hay productos usando esta categoría."); return; }
    if (!confirm("¿Eliminar esta categoría?")) return;
    await fetch(`${API_URL}/categorias/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadData();
  }
});

// Guardar categoría
catForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = (catNombre.value || "").trim();
  if (!nombre) return;

  if (catId.value) {
    const payload = { id: String(catId.value), nombre };
    await fetch(`${API_URL}/categorias/${encodeURIComponent(payload.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch(`${API_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre })
    });
  }
  resetCategoriaForm();
  await loadData();
});

// ========= PRODUCTOS: eventos =========
prodList.addEventListener("click", async (e) => {
  const id = getRowIdFromEvent(e);
  if (!id) return;

  if (e.target.classList.contains("js-prod-edit")) {
    const p = productos.find(x => String(x.id) === id);
    if (!p) return;
    prodId.value = String(p.id);
    prodNombre.value = p.nombre || "";
    prodPrecio.value = p.precio ?? "";
    prodCategoria.value = String(p.categoriaId || "");
    prodImagen.value = p.imagen || "";
    prodDesc.value = p.descripcion || "";
  }

  if (e.target.classList.contains("js-prod-del")) {
    if (!confirm("¿Eliminar este producto?")) return;
    // limpiar del carrito si existiera
    try {
      const rc = await fetch(`${API_URL}/carrito`);
      if (rc.ok) {
        const carrito = await rc.json();
        for (const it of carrito.filter(c => String(c.id) === id)) {
          await fetch(`${API_URL}/carrito/${encodeURIComponent(String(it.id))}`, { method: "DELETE" });
        }
      }
    } catch (_) {}
    await fetch(`${API_URL}/productos/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadData();
  }
});

// Guardar producto
prodForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let img = (prodImagen.value || "").trim();
  if (img && !/^https?:\/\//i.test(img) && !/^assets\//i.test(img)) {
    img = `assets/img/${img}`;
  }

  const payload = {
    nombre: (prodNombre.value || "").trim(),
    precio: parseFloat(prodPrecio.value),
    categoriaId: String(prodCategoria.value),
    imagen: img,
    descripcion: (prodDesc.value || "").trim()
  };

  if (!payload.nombre || isNaN(payload.precio) || !payload.categoriaId) {
    alert("Complete nombre, precio y categoría.");
    return;
  }

  if (prodId.value) {
    const id = String(prodId.value);
    await fetch(`${API_URL}/productos/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload })
    });
  } else {
    await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  resetProductoForm();
  await loadData();
});

prodCancel?.addEventListener("click", (e) => {
  e.preventDefault();
  resetProductoForm();
});

// ========= INIT =========
document.addEventListener("DOMContentLoaded", () => {
  loadData().catch(err => {
    console.error(err);
    alert("No se pudieron cargar datos del servidor.");
  });
});
