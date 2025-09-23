
    const catalogo = document.getElementById("catalogo");

    // Traer mangas desde JSON Server
    fetch("http://172.27.102.202:3000/mangas")
      .then(res => res.json())
      .then(mangas => {
        mangas.forEach(manga => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <img src="${manga.imagen}" alt="${manga.titulo}">
            <h3>${manga.titulo}</h3>
            <p>Autor: ${manga.autor}</p>
            <p>Año: ${manga.anio}</p>
            <p>Precio: $${manga.precio}</p>
            <button  onclick="agregarPedido(${manga.id}, '${manga.titulo.replace(/'/g, "\\'")}', ${manga.precio})">
    Agregar al carrito
  </button>
          `;
          catalogo.appendChild(card);
        });
      });

    // Función para agregar al carrito/pedido
async function agregarPedido(mangaId, titulo, precio) {
  const cantidad = parseInt(prompt(`¿Cuántas copias de "${titulo}" deseas?`, 1));
  const comentario = prompt("¿Algún comentario para el pedido?", "");
  if (!cantidad || cantidad < 1) return alert("Cantidad inválida.");

  try {
    // 1. Obtener todos los pedidos existentes
    const res = await fetch("http://172.27.102.202:3000/pedidos");
    const pedidos = await res.json();

    // 2. Calcular el siguiente ID como string
    const maxId = pedidos.length ? Math.max(...pedidos.map(p => parseInt(p.id))) : 0;
    const nextId = (maxId + 1).toString();
    //2.5 calculo de precio total

      //traer el manga y calcular el costo total
  const resManga = await fetch(`http://172.27.102.202:3000/mangas/${mangaId}`);
  const manga = await resManga.json();

// Calcular precio total
const precioTotal = manga.precio * cantidad;
    // 3. Crear el pedido con ID
    const pedido = {
      id: nextId,
      mangaId,
      cantidad,
      comentario: comentario || "", 
      fecha:  new Date().toLocaleDateString(),
      total: precioTotal
    };

    // 4. Guardar el pedido
    const response = await fetch("http://172.27.102.202:3000/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    const data = await response.json();
    alert(`Pedido de "${titulo}" agregado al carrito.`);
  } catch (err) {
    console.error(err);
  }
}

