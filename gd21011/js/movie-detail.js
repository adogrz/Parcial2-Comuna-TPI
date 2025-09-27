// Movie Detail Page JavaScript
// NOTA: Requiere api-config.js incluido antes de este archivo
// Manejar la funcionalidad de la página de detalle de película

// Función para obtener parámetros de la URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Función para obtener una película específica por ID
async function getMovieById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movie = await response.json();
        return movie;
    } catch (error) {
        console.error('Error al obtener la película:', error);
        throw error;
    }
}

// Función para renderizar los géneros
function renderGenres(genres) {
    const genresContainer = document.getElementById('movie-genres');
    if (!genres || genres.length === 0) {
        genresContainer.innerHTML = '<span class="genre-tag">Sin género</span>';
        return;
    }

    const genreArray = Array.isArray(genres) ? genres : [genres];
    genresContainer.innerHTML = genreArray
        .flat()
        .map(genre => `<span class="genre-tag">${genre}</span>`)
        .join('');
}

// Función para renderizar la información de la película
function renderMovieDetail(movie) {
    // Título
    document.getElementById('movie-title').textContent = movie.title || 'Título no disponible';
    
    // Año
    document.getElementById('movie-year').textContent = movie.release_year || 'N/A';
    
    // Director
    document.getElementById('movie-director').textContent = movie.director || 'Director desconocido';
    
    // Géneros
    const genres = movie.genres || movie.genre || [];
    renderGenres(genres);
    
    // Sinopsis
    document.getElementById('movie-synopsis').textContent = movie.synopsis || 'Sinopsis no disponible.';
    
    // Precio
    document.getElementById('movie-price').textContent = `$${movie.rental_price || '0.00'}`;
    
    // Stock
    const stockElement = document.getElementById('movie-stock');
    stockElement.textContent = movie.stock || 0;
    if (movie.stock <= 0) {
        stockElement.classList.add('out-of-stock');
    }
    
    // Poster
    const posterImg = document.getElementById('movie-poster');
    const posterPlaceholder = document.getElementById('poster-placeholder');
    
    if (movie.poster_url) {
        posterImg.src = movie.poster_url;
        posterImg.alt = `Poster de ${movie.title}`;
        posterImg.style.display = 'block';
        posterPlaceholder.style.display = 'none';
    } else {
        posterImg.style.display = 'none';
        posterPlaceholder.style.display = 'flex';
    }
    
    // Botón de alquiler
    const rentBtn = document.getElementById('rent-btn');
    const rentBtnText = document.getElementById('rent-btn-text');
    
    if (movie.stock <= 0) {
        rentBtn.disabled = true;
        rentBtnText.textContent = 'Sin stock disponible';
        rentBtn.classList.add('disabled');
    } else {
        rentBtn.disabled = false;
        rentBtnText.textContent = `Alquilar por $${movie.rental_price}`;
        rentBtn.classList.remove('disabled');
    }
    
    // Actualizar el título de la página
    document.title = `${movie.title} - Peliculas a 2 coras`;
}

// Función para mostrar estado de error
function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('movie-detail').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}

// Función para mostrar el detalle de la película
function showMovieDetail() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('movie-detail').style.display = 'block';
}

// Función principal para cargar el detalle de la película
async function loadMovieDetail() {
    const movieId = getUrlParameter('id');
    
    if (!movieId) {
        console.error('No se proporcionó ID de película');
        showError();
        return;
    }
    
    try {
        const movie = await getMovieById(movieId);
        renderMovieDetail(movie);
        showMovieDetail();
        
        console.log('Película cargada:', movie);
    } catch (error) {
        console.error('Error al cargar el detalle de la película:', error);
        showError();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Solo cargar si estamos en la página de detalle
    if (window.location.pathname.includes('movie-detail.html')) {
        loadMovieDetail();
    }
});

// Función para eliminar película
async function deleteMovie(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error al eliminar la película:', error);
        throw error;
    }
}

// Función para confirmar y ejecutar eliminación
async function handleDeleteMovie() {
    const movieId = getUrlParameter('id');
    const movieTitle = document.getElementById('movie-title').textContent;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${movieTitle}"?\n\nEsta acción no se puede deshacer.`)) {
        try {
            // Mostrar estado de carga
            const deleteBtn = document.getElementById('delete-btn');
            const originalText = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '⏳ Eliminando...';
            deleteBtn.disabled = true;
            
            await deleteMovie(movieId);
            
            // Mostrar mensaje de éxito y redirigir
            alert('Película eliminada correctamente');
            window.location.href = 'catalog.html';
            
        } catch (error) {
            // Restaurar botón y mostrar error
            const deleteBtn = document.getElementById('delete-btn');
            deleteBtn.innerHTML = '🗑️ Eliminar';
            deleteBtn.disabled = false;
            
            alert('Error al eliminar la película. Por favor, inténtalo de nuevo.');
            console.error('Error:', error);
        }
    }
}

// Función para navegar a página de edición
function handleEditMovie() {
    const movieId = getUrlParameter('id');
    if (movieId) {
        window.location.href = `edit-movie.html?id=${movieId}`;
    }
}

// Event listeners actualizados
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para el botón de editar
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', handleEditMovie);
    }
    
    // Event listener para el botón de eliminar
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteMovie);
    }
    
    // Event listener para el botón de alquiler
    const rentBtn = document.getElementById('rent-btn');
    if (rentBtn) {
        rentBtn.addEventListener('click', () => {
            // Por el momento solo mostramos una alerta
            alert('Funcionalidad de alquiler próximamente disponible');
        });
    }
});
