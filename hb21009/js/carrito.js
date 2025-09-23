const API_URL = "http://localhost:3000";

async function cargarCarrito() {
  try {
    const resp = await fetch(`${API_URL}/carrito`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const carrito = await resp.json();

    const contenedor = document.getElementById("carrito");
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
        <button onclick="eliminarDelCarrito(${prod.id})">Eliminar</button>
      `;
      contenedor.appendChild(item);
    });
  } catch (err) {
    console.error("Error cargando carrito:", err);
    const contenedor = document.getElementById("carrito");
    contenedor.innerHTML = `<div style="padding:1rem;background:#fee;border:1px solid #f99;color:#900">
      No se pudo cargar el carrito. ¿json-server está activo?
    </div>`;
  }
}

async function eliminarDelCarrito(idProducto) {
  try {
    const res = await fetch(`${API_URL}/carrito/${idProducto}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await cargarCarrito();
  } catch (err) {
    console.error("No se pudo eliminar del carrito:", err);
    alert("Error eliminando del carrito.");
  }
}

document.addEventListener("DOMContentLoaded", cargarCarrito);
