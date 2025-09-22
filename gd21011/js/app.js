// API Configuration
const API_BASE_URL = 'http://localhost:3000'; // Cambiar por la URL de tu json-server

// Función para obtener todas las películas
async function getAllMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movies = await response.json();
        return movies;
    } catch (error) {
        console.error('Error al obtener las películas:', error);
        throw error;
    }
}

// Función para crear una tarjeta de película minimalista
function createMovieCard(movie) {
    const genres = Array.isArray(movie.genres) 
        ? movie.genres.join(', ') 
        : (movie.genre ? movie.genre.join(', ') : 'Sin género');

    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="movie-card__poster">
                ${movie.poster_url 
                    ? `<img src="${movie.poster_url}" alt="${movie.title}" loading="lazy">`
                    : `<div class="movie-card__placeholder">
                         <span class="movie-icon">🎬</span>
                         <span class="movie-title-fallback">${movie.title}</span>
                       </div>`
                }
                <div class="movie-card__overlay">
                    <div class="movie-card__info">
                        <div class="movie-card__title-year">
                            <h3 class="movie-card__title">${movie.title}</h3>
                            <span class="movie-card__year">${movie.release_year}</span>
                        </div>
                        <p class="movie-card__genre">${genres}</p>
                        <button class="btn-rent ${movie.stock <= 0 ? 'btn-disabled' : ''}" 
                                ${movie.stock <= 0 ? 'disabled' : ''}>
                            ${movie.stock <= 0 ? 'Sin stock' : `Alquilar $${movie.rental_price}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para renderizar las películas en el grid
function renderMovies(movies) {
    const moviesGrid = document.getElementById('movies-grid');
    if (!moviesGrid) {
        console.error('No se encontró el contenedor del grid de películas');
        return;
    }

    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p class="no-movies">No se encontraron películas disponibles.</p>';
        return;
    }

    moviesGrid.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
    
    // Agregar event listeners para los clicks en las cards
    addMovieCardListeners();
}

// Función para agregar event listeners a las movie cards
function addMovieCardListeners() {
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevenir que el click en el botón también active el click de la card
            if (e.target.closest('.btn-rent')) {
                return;
            }
            
            const movieId = card.getAttribute('data-id');
            if (movieId) {
                // Navegar a la página de detalle con el ID de la película
                window.location.href = `movie-detail.html?id=${movieId}`;
            }
        });
    });
}

// Función para cargar y mostrar el catálogo
async function loadCatalog() {
    try {
        // Mostrar loading
        const moviesGrid = document.getElementById('movies-grid');
        if (moviesGrid) {
            moviesGrid.innerHTML = '<p class="loading">Cargando películas...</p>';
        }

        const movies = await getAllMovies();
        renderMovies(movies);
        
        console.log(`Se cargaron ${movies.length} películas`);
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        const moviesGrid = document.getElementById('movies-grid');
        if (moviesGrid) {
            moviesGrid.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar las películas. Por favor, intenta de nuevo.</p>
                    <button onclick="loadCatalog()" class="btn btn--secondary">Reintentar</button>
                </div>
            `;
        }
    }
}

// Inicializar el catálogo cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo cargar el catálogo si estamos en la página de catálogo
    if (window.location.pathname.includes('catalog.html')) {
        loadCatalog();
    }
});