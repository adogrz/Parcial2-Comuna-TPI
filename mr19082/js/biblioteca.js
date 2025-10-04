import { API_URL } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('juegos-container');

    // READ (Leer/Consultar todos los juegos)
    const fetchJuegos = async () => {
        try {
            const response = await fetch(`${API_URL}/juegos`);
            const juegos = await response.json();
            renderJuegos(juegos);
        } catch (error) {
            console.error('Error al cargar los juegos:', error);
        }
    };

    // Renderiza los juegos en el DOM
    const renderJuegos = (juegos) => {
        container.innerHTML = ''; // Limpiar contenedor
        if (juegos.length === 0) {
            container.innerHTML = '<p>No hay juegos en tu biblioteca. ¡Añade uno!</p>';
            return;
        }
        juegos.forEach(juego => {
            const juegoCard = document.createElement('div');
            juegoCard.className = 'card';
            juegoCard.innerHTML = `
                <img src="${juego.portada}" alt="Portada de ${juego.titulo}">
                <h3>${juego.titulo}</h3>
                <p><strong>Plataforma:</strong> ${juego.plataforma}</p>
                <p><strong>Estado:</strong> <span class="status">${juego.estado}</span></p>
                <div class="card-buttons">
                    <button class="edit-btn" data-id="${juego.id}">Editar</button>
                    <button class="delete-btn" data-id="${juego.id}">Borrar</button>
                </div>
            `;
            container.appendChild(juegoCard);
        });
    };

    // Event Delegation para los botones de Editar y Borrar
    container.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        // DELETE (Borrar un juego)
        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres borrar este juego?')) {
                try {
                    await fetch(`${API_URL}/juegos/${id}`, { method: 'DELETE' });
                    fetchJuegos(); // Recargar la lista
                } catch (error) {
                    console.error('Error al borrar el juego:', error);
                }
            }
        }

        // UPDATE (Redirigir a la página de edición)
        if (target.classList.contains('edit-btn')) {
            window.location.href = `agregar-juego.html?id=${id}`;
        }
    });

    // Carga inicial
    fetchJuegos();
});


