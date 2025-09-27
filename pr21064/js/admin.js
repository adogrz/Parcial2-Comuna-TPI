
const MI_CARNET = 'pr21064'; 
// Detecta si estamos en un entorno de desarrollo local
const esDesarrolloLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Elige la URL de la API según el entorno
const API_URL = esDesarrolloLocal 
    ? 'http://localhost:3000'                      // URL para desarrollo en tu PC
    : `https://${MI_CARNET}.comuna.tpi/api`;     // URL para el servidor final en la VPN


const tablaBody = document.querySelector("#tablaMangas tbody");
    const modal = document.getElementById("modalForm");
    const form = document.getElementById("formManga");
    const formTitle = document.getElementById("formTitle");

    let editMangaId = null;

    // Cargar mangas
    function cargarMangas() {
      tablaBody.innerHTML = "";
      fetch(`${API_URL}/mangas`)
        .then(res => res.json())
        .then(mangas => {
          mangas.forEach(manga => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${manga.id}</td>
              <td>${manga.titulo}</td>
              <td>${manga.autor}</td>
              <td>${manga.anio}</td>
              <td><img src="${manga.imagen}" alt="${manga.titulo}" class="img-manga"></td>
              <td>$${manga.precio}</td>
              <td>
                <button class="editar">Editar</button>
                <button class="eliminar">Eliminar</button>
              </td>
            `;
            tablaBody.appendChild(tr);

            // Eliminar manga
            tr.querySelector(".eliminar").addEventListener("click", () => {
              if(confirm(`¿Desea eliminar "${manga.titulo}"?`)) {
                fetch(`${API_URL}/mangas/${manga.id}`, { method: "DELETE" })
                  .then(() => cargarMangas());
              }
            });

            // Editar manga
            tr.querySelector(".editar").addEventListener("click", () => {
              editMangaId = manga.id;
              formTitle.textContent = "Editar Manga";
              form.id.value = manga.id;
              form.titulo.value = manga.titulo;
              form.autor.value = manga.autor;
              form.anio.value = manga.anio;
              form.imagen.value = manga.imagen;
              form.precio.value = manga.precio;
              modal.style.display = "flex";
            });
          });
        });
}

    cargarMangas();

    // abrir el formulario con agregar manga 
document.getElementById("btnAgregar").addEventListener("click", () => {
      editMangaId = null;
      formTitle.textContent = "Agregar Manga";
      form.reset();
      modal.style.display = "flex";
});

    // Cerrar modal
document.getElementById("btnCerrar").addEventListener("click", () => modal.style.display = "none");

    // Guardar manga (crear o editar)
form.addEventListener("submit", async e => {
  e.preventDefault();

  // Obtener todos los mangas para calcular el próximo ID
  const res = await fetch(`${API_URL}/mangas`);
  const mangas = await res.json();
  const maxId = mangas.length ? Math.max(...mangas.map(m => parseInt(m.id))) : 0;

  const data = {
    id: editMangaId ? editMangaId : (maxId + 1).toString(),
    titulo: form.titulo.value,
    autor: form.autor.value,
    anio: parseInt(form.anio.value),
    imagen: form.imagen.value,
    precio: parseFloat(form.precio.value)
  };

  const method = editMangaId ? "PUT" : "POST";
  const url = editMangaId 
              ? `${API_URL}/mangas/${editMangaId}` 
              : `${API_URL}/mangas`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  modal.style.display = "none";
  cargarMangas();
});
