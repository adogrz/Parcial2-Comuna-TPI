// js/catalogo.js
// Detectar protocolo automáticamente
const baseURL = window.location.protocol === 'https:'
  ? 'https://www5.comuna.tpi'
  : 'http://www5.comuna.tpi';

const API_PROD = `${baseURL}/productos`;

const FALLBACK_IMG = 'https://llerena.org/wp-content/uploads/2017/11/imagen-no-disponible-1.jpg';
const contenedor = document.getElementById('catalogo');

// carrito
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(prod) {
  const cart = getCart();
  const i = cart.findIndex(x => x.id === prod.id);
  if (i >= 0) cart[i].qty += 1;
  else cart.push({ id: prod.id, nombre: prod.nombre, precio: Number(prod.precio) || 0, qty: 1 });
  setCart(cart);
  alert('Producto agregado al carrito');
}

//  tabla
function card(p) {
  const img = (p.imagenUrl && /^https?:\/\//i.test(p.imagenUrl)) ? p.imagenUrl : FALLBACK_IMG;
  const precioNum = Number(p.precio);
  const precioFmt = isFinite(precioNum) ? precioNum.toFixed(2) : p.precio;

  return `
    <div class="card-prod">
      <img src="${img}" alt="${p.nombre}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div class="info">
        <h3>${p.nombre}</h3>
        <p>${p.marca}</p>
        <p class="price">$${precioFmt}</p>
        <p>Stock: ${p.stock}</p>
        <button class="add" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}">
          Agregar al carrito
        </button>
      </div>
    </div>
  `;
}

// Cargar productos
async function load() {
  try {
    const r = await fetch(`${API_PROD}?_=${Date.now()}`); // evita caché
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('La API no devolvió un arreglo.');
    contenedor.innerHTML = data.map(card).join('');
    console.log('catalogo.js v5: renderizado como cuadrícula tipo tienda');
  } catch (e) {
    console.error(e);
    contenedor.innerHTML = `<p class="error">No se pudo cargar /productos. ${e.message}</p>`;
  }
}

// eventos
contenedor.addEventListener('click', (e) => {
  const btn = e.target.closest('button.add');
  if (!btn) return;
  const id = btn.dataset.id;
  const nombre = btn.dataset.nombre;
  const precio = parseFloat(btn.dataset.precio);
  addToCart({ id, nombre, precio });
});

load();
