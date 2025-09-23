const pedidosTable = document.getElementById("pedidosTable").querySelector("tbody");
const modal = document.getElementById("modalForm");
const pedidoForm = document.getElementById("pedidoForm");
const formTitle = document.getElementById("formTitle");
const mangaSelect = document.getElementById("mangaSelect");
const btnAgregar = document.getElementById("btnAgregar");
const btnCerrar = document.getElementById("btnCerrar");

let mangas = [];
let pedidos = [];
let editPedidoId = null;

// Cargar mangas para el select
fetch("http://localhost:3000/mangas")
  .then(res => res.json())
  .then(data => {
    mangas = data;
    mangas.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = m.titulo;
      mangaSelect.appendChild(option);
    });
  });

// Cargar pedidos
function cargarPedidos() {
  fetch("http://localhost:3000/pedidos")
    .then(res => res.json())
    .then(data => {
      pedidos = data;
      renderPedidos();
    });
}

// Renderizar tabla de pedidos
function renderPedidos() {
  pedidosTable.innerHTML = "";
  pedidos.forEach(p => {
    const manga = mangas.find(m => m.id == p.mangaId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${manga ? manga.titulo : "Desconocido"}</td>
      <td>${p.cantidad}</td>
      <td>${p.comentario}</td>
      <td>${p.fecha}</td>
      <td>$${(p.total).toFixed(2)}</td>
      <td>
        <button class="editar">Editar</button>
        <button class="eliminar">Eliminar</button>
      </td>
    `;
    pedidosTable.appendChild(tr);

    // Botón eliminar
    tr.querySelector(".eliminar").addEventListener("click", () => {
      if (confirm(`¿Deseas eliminar este pedido?`)) {
        fetch(`http://localhost:3000/pedidos/${p.id}`, { method: "DELETE" })
          .then(() => cargarPedidos());
      }
    });

    // Botón editar
    tr.querySelector(".editar").addEventListener("click", () => {
      editPedidoId = p.id;
      formTitle.textContent = "Editar Pedido";
      pedidoForm.mangaId.value = p.mangaId;
      pedidoForm.cantidad.value = p.cantidad;
      pedidoForm.comentario.value = p.comentario;
      modal.style.display = "flex";
    });
  });
}

// Agregar nuevo pedido
btnAgregar.addEventListener("click", () => {
  editPedidoId = null;
  formTitle.textContent = "Agregar Pedido";
  pedidoForm.reset();
  modal.style.display = "flex";
});

// Cerrar modal
btnCerrar.addEventListener("click", () => modal.style.display = "none");

// Guardar pedido
pedidoForm.addEventListener("submit", async e => {
  e.preventDefault();

  // Calcular próximo ID
  const res = await fetch("http://localhost:3000/pedidos");
  const pedidosActuales = await res.json();
  const maxId = pedidosActuales.length ? Math.max(...pedidosActuales.map(p => parseInt(p.id))) : 0;

  //traer el manga y calcular el costo total
  const resManga = await fetch(`http://localhost:3000/mangas/${pedidoForm.mangaId.value}`);
const manga = await resManga.json();

// Calcular precio total
const precioTotal = manga.precio * parseInt(pedidoForm.cantidad.value);
  const data = {
    id: editPedidoId ? editPedidoId : (maxId + 1).toString(),
    mangaId: pedidoForm.mangaId.value,
    cantidad: parseInt(pedidoForm.cantidad.value),
    comentario: pedidoForm.comentario.value,
    fecha: new Date().toLocaleDateString(),
    total: precioTotal
  };

  const method = editPedidoId ? "PUT" : "POST";
  const url = editPedidoId 
              ? `http://localhost:3000/pedidos/${editPedidoId}`
              : "http://localhost:3000/pedidos";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  editPedidoId = null;
  pedidoForm.reset();
  modal.style.display = "none";
  cargarPedidos();
});

// Inicializar tabla
cargarPedidos();
