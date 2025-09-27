// js/carrito.js
import { API_URL } from './app.js';

async function cargarCarrito() {
  const contenedor = document.getElementById("carrito");
  if (!contenedor) return;

  try {
    const resp = await fetch(`${API_URL}/carrito`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const carrito = await resp.json();

    contenedor.innerHTML = "";

    if (!Array.isArray(carrito) || carrito.length === 0) {
      contenedor.innerHTML = "<p>El carrito está vacío.</p>";
      return;
    }

    carrito.forEach(prod => {
      const item = document.createElement("div");
      item.classList.add("carrito-item");
      item.innerHTML = `
        <h3>${prod.nombre}</h3>
        <p>Precio: $${Number(prod.precio).toFixed(2)}</p>
        <button data-id="${String(prod.id)}" class="btn outline">Eliminar</button>
      `;
      item.querySelector("button").addEventListener("click", () => eliminarDelCarrito(String(prod.id)));
      contenedor.appendChild(item);
    });
  } catch (err) {
    console.error("Error cargando carrito:", err);
    contenedor.innerHTML = `<div class="alert">
      No se pudo cargar el carrito. ¿json-server está activo en <code>${API_URL}</code>?
    </div>`;
  }
}

async function eliminarDelCarrito(idProducto) {
  try {
    const res = await fetch(`${API_URL}/carrito/${encodeURIComponent(idProducto)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await cargarCarrito();
  } catch (err) {
    console.error("No se pudo eliminar del carrito:", err);
    alert("Error eliminando del carrito.");
  }
}

document.addEventListener("DOMContentLoaded", cargarCarrito);
