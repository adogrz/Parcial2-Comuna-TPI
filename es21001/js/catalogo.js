// js/catalogo.js
const API_PROD = 'http://172.27.28.148:3000/productos';
const tbody = document.getElementById('tbody');

// Placeholder fijo si no hay imagen o falla la carga
const FALLBACK_IMG = 'https://llerena.org/wp-content/uploads/2017/11/imagen-no-disponible-1.jpg';

function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
function setCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }

function addToCart(prod){
  const cart = getCart();
  const i = cart.findIndex(x => x.id === prod.id); // id string
  if (i >= 0) cart[i].qty += 1;
  else cart.push({ id: prod.id, nombre: prod.nombre, precio: Number(prod.precio)||0, qty: 1 });
  setCart(cart);
  alert('Producto agregado al carrito');
}

function row(p){
  const img = (p.imagenUrl && /^https?:\/\//i.test(p.imagenUrl)) ? p.imagenUrl : FALLBACK_IMG;
  const precioNum = Number(p.precio);
  const precioFmt = isFinite(precioNum) ? precioNum.toFixed(2) : p.precio;

  return `
    <tr>
      <td style="text-align:center">
        <img src="${img}" alt="${p.nombre}" loading="lazy"
             onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
             style="width:64px;height:64px;object-fit:cover;border-radius:8px;">
      </td>
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.marca}</td>
      <td>$${precioFmt}</td>
      <td>${p.stock}</td>
      <td><button class="add" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}">Agregar</button></td>
    </tr>
  `;
}

async function load(){
  try {
    const r = await fetch(`${API_PROD}?_=${Date.now()}`); // evita caché
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('La API no devolvió un arreglo.');
    tbody.innerHTML = data.map(row).join('');
    console.log('catalogo.js v3: filas pintadas con imagen primero');
  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="7">No se pudo cargar /productos. ${e.message}</td></tr>`;
  }
}

tbody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button.add');
  if (!btn) return;
  const id = btn.dataset.id;                 // mantener STRING
  const nombre = btn.dataset.nombre;
  const precio = parseFloat(btn.dataset.precio);
  addToCart({ id, nombre, precio });
});

load();
