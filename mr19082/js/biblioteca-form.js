import { API_URL } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('juego-form');
    const formTitle = document.getElementById('form-title');
    const juegoIdInput = document.getElementById('juego-id');
    
    const params = new URLSearchParams(window.location.search);
    const juegoId = params.get('id');
    let isEditing = false;

    // Si hay un ID en la URL, estamos en modo de edición
    if (juegoId) {
        isEditing = true;
        formTitle.textContent = 'Editar Juego';
        // Cargar datos existentes del juego para edición
        fetch(`${API_URL}/juegos/${juegoId}`)
            .then(res => res.json())
            .then(juego => {
                juegoIdInput.value = juego.id;
                document.getElementById('titulo').value = juego.titulo;
                document.getElementById('plataforma').value = juego.plataforma;
                document.getElementById('estado').value = juego.estado;
                document.getElementById('portada').value = juego.portada;
            });
    } else {
        // Si NO hay un ID, estamos agregando un nuevo juego desde el catálogo
        formTitle.textContent = 'Añadir Nuevo Juego';
        const titulo = params.get('titulo');
        const plataforma = params.get('plataforma');
        const portada = params.get('portada');

        if (titulo) {
            document.getElementById('titulo').value = titulo;
            document.getElementById('plataforma').value = plataforma;
            document.getElementById('portada').value = portada;
            document.getElementById('estado').value = 'Jugando'; // Estado por defecto
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const juegoData = {
            titulo: document.getElementById('titulo').value,
            plataforma: document.getElementById('plataforma').value,
            estado: document.getElementById('estado').value,
            portada: document.getElementById('portada').value,
        };

        try {
            let response;
            if (isEditing) {
                // UPDATE (Actualizar)
                response = await fetch(`${API_URL}/juegos/${juegoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(juegoData)
                });
            } else {
                // CREATE (Crear)
                response = await fetch(`${API_URL}/juegos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(juegoData)
                });
            }

            if (response.ok) {
                window.location.href = 'biblioteca.html';
            } else {
                console.error('Error al guardar el juego.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});