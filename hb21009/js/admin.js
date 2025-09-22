const API_URL = "http://localhost:3000";
const panel = document.getElementById("admin-panel");

async function cargarProductos() {
  const resp = await fetch(`${API_URL}/productos`);
  const productos = await resp.json();

  panel.innerHTML = `
    <h2>Lista de productos</h2>
    <ul>
      ${productos.map(p => `
        <li>
          ${p.nombre} - $${p.precio}
          <button onclick="eliminarProducto(${p.id})">Eliminar</button>
        </li>
      `).join("")}
    </ul>
    <h2>Agregar producto</h2>
    <form id="form-producto">
      <input type="text" id="nombre" placeholder="Nombre">
      <input type="number" id="precio" placeholder="Precio" step="0.01">
      <input type="text" id="categoria" placeholder="Categoría">
      <button type="submit">Agregar</button>
    </form>
  `;

  document.getElementById("form-producto").onsubmit = async (e) => {
    e.preventDefault();
    const nuevo = {
      nombre: document.getElementById("nombre").value,
      precio: parseFloat(document.getElementById("precio").value),
      categoria: document.getElementById("categoria").value
    };

    await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });

    cargarProductos();
  };
}

async function eliminarProducto(id) {
  await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
  cargarProductos();
}

cargarProductos();
