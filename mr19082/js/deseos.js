import { API_URL } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('deseos-container');
    const form = document.getElementById('deseo-form');
    const deseoIdInput = document.getElementById('deseo-id');
    const deseoTituloInput = document.getElementById('deseo-titulo');
    const deseoPlataformaInput = document.getElementById('deseo-plataforma');
    const formTitle = document.getElementById('form-deseo-title');
    const submitBtn = document.getElementById('submit-deseo-btn');

    let isEditing = false;

    // URL base para la colección deseos
    const DESEOS_URL = `${API_URL}/deseos`;

    // READ (Consultar)
    const fetchDeseos = async () => {
        try {
            const response = await fetch(DESEOS_URL);
            const deseos = await response.json();
            renderDeseos(deseos);
        } catch (error) {
            console.error('Error al cargar los deseos:', error);
        }
    };

    // Renderizar los deseos en el DOM
    const renderDeseos = (deseos) => {
        container.innerHTML = '';
        if (deseos.length === 0) {
            container.innerHTML = '<p>No hay deseos en tu lista. ¡Agrega uno!</p>';
            return;
        }
        deseos.forEach(deseo => {
            const deseoCard = document.createElement('div');
            deseoCard.className = 'card';
            deseoCard.innerHTML = `
                <h3>${deseo.titulo}</h3>
                <p><strong>Plataforma:</strong> ${deseo.plataforma}</p>
                <div class="card-buttons">
                    <button class="edit-btn" data-id="${deseo.id}">Editar</button>
                    <button class="delete-btn" data-id="${deseo.id}">Borrar</button>
                </div>
            `;
            container.appendChild(deseoCard);
        });
    };

    // CREATE (Crear) y UPDATE (Actualizar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deseoData = {
            titulo: deseoTituloInput.value,
            plataforma: deseoPlataformaInput.value,
        };

        try {
            if (isEditing) {
                // UPDATE
                await fetch(`${DESEOS_URL}/${deseoIdInput.value}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deseoData)
                });
            } else {
                // CREATE
                await fetch(DESEOS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deseoData)
                });
            }
            resetForm();
            fetchDeseos();
        } catch (error) {
            console.error('Error al guardar el deseo:', error);
        }
    });

    // Botones de editar y borrar
    container.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        // DELETE
        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres borrar este deseo?')) {
                try {
                    await fetch(`${DESEOS_URL}/${id}`, { method: 'DELETE' });
                    fetchDeseos();
                } catch (error) {
                    console.error('Error al borrar el deseo:', error);
                }
            }
        }

        // EDITAR
        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`${DESEOS_URL}/${id}`);
                const deseo = await response.json();
                
                isEditing = true;
                deseoIdInput.value = deseo.id;
                deseoTituloInput.value = deseo.titulo;
                deseoPlataformaInput.value = deseo.plataforma;
                formTitle.textContent = 'Editando Deseo';
                submitBtn.textContent = 'Actualizar Deseo';

                form.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error al cargar el deseo:', error);
            }
        }
    });

    // Resetear formulario
    const resetForm = () => {
        isEditing = false;
        form.reset();
        deseoIdInput.value = '';
        formTitle.textContent = 'Añadir a la lista de deseos';
        submitBtn.textContent = 'Agregar Deseo';
    };

    // Carga inicial
    fetchDeseos();
});
