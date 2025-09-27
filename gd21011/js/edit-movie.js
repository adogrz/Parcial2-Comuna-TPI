// Edit Movie Page JavaScript
// NOTA: Requiere api-config.js incluido antes de este archivo
// Manejar la funcionalidad del formulario de editar película

let currentMovieId = null;

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

// Función para actualizar una película en la API
async function updateMovie(id, movieData) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedMovie = await response.json();
        return updatedMovie;
    } catch (error) {
        console.error('Error al actualizar la película:', error);
        throw error;
    }
}

// Función para procesar los géneros desde el input
function processGenres(genresInput) {
    if (!genresInput || genresInput.trim() === '') {
        return [];
    }
    
    return genresInput
        .split(',')
        .map(genre => genre.trim())
        .filter(genre => genre.length > 0);
}

// Función para convertir array de géneros a string
function genresToString(genres) {
    if (!genres || genres.length === 0) {
        return '';
    }
    
    const genreArray = Array.isArray(genres) ? genres : [genres];
    return genreArray.flat().join(', ');
}

// Función para poblar el formulario con datos de la película
function populateForm(movie) {
    document.getElementById('title').value = movie.title || '';
    document.getElementById('director').value = movie.director || '';
    document.getElementById('release_year').value = movie.release_year || '';
    document.getElementById('genres').value = genresToString(movie.genres || movie.genre || []);
    document.getElementById('synopsis').value = movie.synopsis || '';
    document.getElementById('rental_price').value = movie.rental_price || '';
    document.getElementById('stock').value = movie.stock || 0;
    document.getElementById('poster_url').value = movie.poster_url || '';
}

// Función para validar el formulario
function validateForm(formData) {
    const errors = [];

    if (!formData.title || formData.title.trim().length < 2) {
        errors.push('El título debe tener al menos 2 caracteres');
    }

    if (!formData.director || formData.director.trim().length < 2) {
        errors.push('El director debe tener al menos 2 caracteres');
    }

    if (!formData.release_year || formData.release_year < 1900 || formData.release_year > 2030) {
        errors.push('El año debe estar entre 1900 y 2030');
    }

    if (!formData.genres || formData.genres.length === 0) {
        errors.push('Debe especificar al menos un género');
    }

    if (!formData.synopsis || formData.synopsis.trim().length < 10) {
        errors.push('La sinopsis debe tener al menos 10 caracteres');
    }

    if (!formData.rental_price || formData.rental_price <= 0) {
        errors.push('El precio debe ser mayor a 0');
    }

    if (formData.stock === undefined || formData.stock < 0) {
        errors.push('El stock no puede ser negativo');
    }

    if (formData.poster_url && formData.poster_url.trim() !== '') {
        try {
            new URL(formData.poster_url);
        } catch {
            errors.push('La URL del poster no es válida');
        }
    }

    return errors;
}

// Función para mostrar el estado de carga
function showLoading() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
}

// Función para ocultar el estado de carga
function hideLoading() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
}

// Función para mostrar el resultado exitoso
function showSuccess(movie) {
    const form = document.getElementById('edit-movie-form');
    const result = document.getElementById('form-result');
    const success = document.getElementById('result-success');
    const error = document.getElementById('result-error');
    
    form.style.display = 'none';
    result.style.display = 'block';
    success.style.display = 'block';
    error.style.display = 'none';
    
    // Actualizar el enlace para volver al detalle
    const backToDetailBtn = document.getElementById('back-to-detail');
    backToDetailBtn.href = `movie-detail.html?id=${currentMovieId}`;
    
    console.log('Película actualizada exitosamente:', movie);
}

// Función para mostrar error
function showError(errorMessage) {
    const result = document.getElementById('form-result');
    const success = document.getElementById('result-success');
    const error = document.getElementById('result-error');
    const errorMsg = document.getElementById('error-message');
    
    result.style.display = 'block';
    success.style.display = 'none';
    error.style.display = 'block';
    errorMsg.textContent = errorMessage;
    
    hideLoading();
}

// Función para ocultar el resultado
function hideResult() {
    const form = document.getElementById('edit-movie-form');
    const result = document.getElementById('form-result');
    
    form.style.display = 'block';
    result.style.display = 'none';
}

// Función para mostrar estado de error de carga
function showLoadingError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('edit-header').style.display = 'none';
    document.getElementById('edit-movie-form').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}

// Función para mostrar el formulario
function showForm() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('edit-header').style.display = 'block';
    document.getElementById('edit-movie-form').style.display = 'block';
}

// Función principal para cargar y editar la película
async function loadMovieForEdit() {
    currentMovieId = getUrlParameter('id');
    
    if (!currentMovieId) {
        console.error('No se proporcionó ID de película');
        showLoadingError();
        return;
    }
    
    try {
        const movie = await getMovieById(currentMovieId);
        populateForm(movie);
        showForm();
        
        // Actualizar título de la página
        document.title = `Editar ${movie.title} - Peliculas a 2 coras`;
        
        console.log('Película cargada para editar:', movie);
    } catch (error) {
        console.error('Error al cargar la película:', error);
        showLoadingError();
    }
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Extraer y procesar los datos
    const movieData = {
        title: formData.get('title').trim(),
        director: formData.get('director').trim(),
        release_year: parseInt(formData.get('release_year')),
        genres: processGenres(formData.get('genres')),
        synopsis: formData.get('synopsis').trim(),
        rental_price: parseFloat(formData.get('rental_price')),
        stock: parseInt(formData.get('stock')),
        poster_url: formData.get('poster_url') ? formData.get('poster_url').trim() : null
    };
    
    // Validar datos
    const validationErrors = validateForm(movieData);
    if (validationErrors.length > 0) {
        showError(`Errores de validación:\n${validationErrors.join('\n')}`);
        return;
    }
    
    // Mostrar estado de carga
    showLoading();
    
    try {
        // Enviar datos a la API
        const updatedMovie = await updateMovie(currentMovieId, movieData);
        showSuccess(updatedMovie);
    } catch (error) {
        console.error('Error al actualizar película:', error);
        showError('Error al actualizar la película. Verifica tu conexión e intenta de nuevo.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('edit-movie.html')) {
        loadMovieForEdit();
        
        const form = document.getElementById('edit-movie-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }
});

// Hacer las funciones globales para poder usarlas desde el HTML
window.hideResult = hideResult;
