const API_URL = "http://localhost:3000";

async function cargarCarrito() {
  const resp = await fetch(`${API_URL}/carrito`);
  const carrito = await resp.json();

  const contenedor = document.getElementById("carrito");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }

  carrito.forEach((prod, i) => {
    const item = document.createElement("div");
    item.classList.add("carrito-item");
    item.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="eliminarDelCarrito(${prod.id})">Eliminar</button>
    `;
    contenedor.appendChild(item);
  });
}

async function eliminarDelCarrito(idProducto) {
  await fetch(`${API_URL}/carrito/${idProducto}`, { method: "DELETE" });
  cargarCarrito();
}

cargarCarrito();
