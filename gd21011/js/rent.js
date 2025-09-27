// Rent a Movie JavaScript
// NOTA: Requiere api-config.js incluido antes de este archivo

// Función para obtener todas las películas
async function getAllMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener películas:', error);
        throw error;
    }
}

// Función para obtener todos los clientes
async function getAllClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error;
    }
}

// Función para crear un nuevo alquiler
async function createRental(rentalData) {
    try {
        const response = await fetch(`${API_BASE_URL}/rentals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al crear alquiler:', error);
        throw error;
    }
}

// Función para actualizar el stock de una película
async function updateMovieStock(movieId, newStock) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        throw error;
    }
}

// Poblar selects
async function populateSelects() {
    const movieSelect = document.getElementById('movie-select');
    const clientSelect = document.getElementById('client-select');
    const loadingMessage = document.getElementById('loading-message');
    const rentForm = document.getElementById('rent-form');

    try {
        const [movies, clients] = await Promise.all([getAllMovies(), getAllClients()]);

        // Poblar select de películas (solo con stock > 0)
        const availableMovies = movies.filter(movie => movie.stock > 0);
        if (availableMovies.length === 0) {
            movieSelect.innerHTML = '<option value="">No hay películas disponibles</option>';
            movieSelect.disabled = true;
        } else {
            movieSelect.innerHTML = '<option value="">-- Selecciona una película --</option>';
            availableMovies.forEach(movie => {
                const option = document.createElement('option');
                option.value = movie.id;
                option.textContent = `${movie.title} (Stock: ${movie.stock})`;
                option.dataset.stock = movie.stock;
                movieSelect.appendChild(option);
            });
        }

        // Poblar select de clientes
        if (clients.length === 0) {
            clientSelect.innerHTML = '<option value="">No hay clientes registrados</option>';
            clientSelect.disabled = true;
        } else {
            clientSelect.innerHTML = '<option value="">-- Selecciona un cliente --</option>';
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);
            });
        }

        loadingMessage.style.display = 'none';
        rentForm.style.display = 'block';

    } catch (error) {
        loadingMessage.textContent = 'Error al cargar los datos. Por favor, recarga la página.';
        console.error(error);
    }
}

// Manejar envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formResult = document.getElementById('form-result');

    const rentalData = {
        movieId: form['movie-select'].value,
        clientId: form['client-select'].value,
        rental_date: form['rental-date'].value,
        return_date: form['return-date'].value,
    };

    // Validación simple
    if (!rentalData.movieId || !rentalData.clientId || !rentalData.rental_date || !rentalData.return_date) {
        showResult('error', 'Por favor, completa todos los campos.');
        return;
    }
    if (new Date(rentalData.return_date) < new Date(rentalData.rental_date)) {
        showResult('error', 'La fecha de devolución no puede ser anterior a la fecha de alquiler.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    try {
        // 1. Crear el alquiler
        await createRental(rentalData);

        // 2. Decrementar el stock
        const selectedMovieOption = form['movie-select'].options[form['movie-select'].selectedIndex];
        const currentStock = parseInt(selectedMovieOption.dataset.stock, 10);
        await updateMovieStock(rentalData.movieId, currentStock - 1);

        showResult('success', '¡Película alquilada con éxito!');
        form.reset();
        // Actualizar los selects para reflejar el nuevo stock
        await populateSelects();

    } catch (error) {
        showResult('error', 'Hubo un problema al procesar el alquiler.');
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Rentar Película';
    }
}

// Mostrar resultado del formulario
function showResult(type, message) {
    const formResult = document.getElementById('form-result');
    formResult.className = `form-result ${type}`;
    formResult.textContent = message;
    formResult.style.display = 'block';

    setTimeout(() => {
        formResult.style.display = 'none';
    }, 4000);
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('rent.html')) {
        populateSelects();

        const rentForm = document.getElementById('rent-form');
        rentForm.addEventListener('submit', handleFormSubmit);

        // Setear fecha de alquiler por defecto a hoy
        const rentalDateInput = document.getElementById('rental-date');
        const today = new Date().toISOString().split('T')[0];
        rentalDateInput.value = today;
    }
});
