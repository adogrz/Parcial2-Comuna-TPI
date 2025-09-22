const API_URL = "http://localhost:3000";

async function cargarCatalogo() {
  const resp = await fetch(`${API_URL}/productos`);
  const productos = await resp.json();

  const contenedor = document.getElementById("catalogo");
  contenedor.innerHTML = "";

  productos.forEach(prod => {
    const item = document.createElement("div");
    item.classList.add("producto");
    item.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Categoría: ${prod.categoria}</p>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedor.appendChild(item);
  });
}

async function agregarAlCarrito(idProducto) {
  const resp = await fetch(`${API_URL}/productos/${idProducto}`);
  const producto = await resp.json();

  await fetch(`${API_URL}/carrito`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  });

  alert("Producto agregado al carrito!");
}

cargarCatalogo();
