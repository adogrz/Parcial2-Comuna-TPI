// js/catalogo.js
import { API_URL } from './app.js';

async function cargarCatalogo() {
  const cont = document.getElementById("catalogo");
  if (!cont) return;

  // Loading
  cont.innerHTML = '<p class="muted">Cargando productos…</p>';

  try {
    const [rc, rp] = await Promise.all([
      fetch(`${API_URL}/categorias`),
      fetch(`${API_URL}/productos`)
    ]);
    if (!rc.ok || !rp.ok) throw new Error("HTTP error");
    const categorias = await rc.json();
    const productos  = await rp.json();
    const mapCat = Object.fromEntries(categorias.map(c=>[String(c.id), c.nombre]));

    if (!Array.isArray(productos) || productos.length === 0) {
      cont.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    cont.innerHTML = ""; // limpia loading

    productos.forEach(p => {
      const card = document.createElement("div");
      card.className = "producto";
      card.innerHTML = `
        <img src="${p.imagen || 'assets/img/logo.svg'}"
             alt="${p.nombre}"
             class="card-img"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/img/logo.svg';">
        <div class="card-body">
          <h3>${p.nombre}</h3>
          <p class="muted">${mapCat[String(p.categoriaId)] || "Sin categoría"}</p>
          <p>${p.descripcion || ""}</p>
          <p class="price">$${Number(p.precio).toFixed(2)}</p>
          <button class="btn" data-id="${String(p.id)}">Agregar al carrito</button>
        </div>
      `;
      card.querySelector("button").addEventListener("click", () => agregarAlCarrito(String(p.id)));
      cont.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargando catálogo:", err);
    document.getElementById("catalogo").innerHTML = `<div class="alert">
      No se pudo cargar el catálogo. ¿json-server corre en <code>${API_URL}</code>?
      <div style="margin-top:8px"><button class="btn outline" onclick="location.reload()">Reintentar</button></div>
    </div>`;
  }
}

async function agregarAlCarrito(idProducto) {
  try {
    const r = await fetch(`${API_URL}/productos/${encodeURIComponent(idProducto)}`);
    if(!r.ok) throw new Error("HTTP error");
    const producto = await r.json();
    const post = await fetch(`${API_URL}/carrito`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(producto)
    });
    if(!post.ok) throw new Error("HTTP error");
    alert("Producto agregado al carrito!");
  } catch (e) {
    console.error(e);
    alert("No se pudo agregar al carrito.");
  }
}

document.addEventListener("DOMContentLoaded", cargarCatalogo);
