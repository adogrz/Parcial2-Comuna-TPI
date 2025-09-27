// Add Movie Page JavaScript
// NOTA: Requiere api-config.js incluido antes de este archivo
// Manejar la funcionalidad del formulario de agregar película

// Función para agregar una nueva película a la API
async function addMovie(movieData) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newMovie = await response.json();
        return newMovie;
    } catch (error) {
        console.error('Error al agregar la película:', error);
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

// Función para validar el formulario
function validateForm(formData) {
    const errors = [];

    // Validaciones básicas
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

    // Validar URL del poster si se proporciona
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
    const form = document.getElementById('add-movie-form');
    const result = document.getElementById('form-result');
    const success = document.getElementById('result-success');
    const error = document.getElementById('result-error');
    
    form.style.display = 'none';
    result.style.display = 'block';
    success.style.display = 'block';
    error.style.display = 'none';
    
    console.log('Película agregada exitosamente:', movie);
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
    const form = document.getElementById('add-movie-form');
    const result = document.getElementById('form-result');
    
    form.style.display = 'block';
    result.style.display = 'none';
}

// Función para resetear el formulario
function resetForm() {
    const form = document.getElementById('add-movie-form');
    const result = document.getElementById('form-result');
    
    form.reset();
    form.style.display = 'block';
    result.style.display = 'none';
    hideLoading();
}

// Función principal para manejar el envío del formulario
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
        const newMovie = await addMovie(movieData);
        showSuccess(newMovie);
    } catch (error) {
        console.error('Error al agregar película:', error);
        showError('Error al agregar la película. Verifica tu conexión e intenta de nuevo.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar si estamos en la página de agregar película
    if (window.location.pathname.includes('add-movie.html')) {
        const form = document.getElementById('add-movie-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Auto-focus en el primer campo
        const titleInput = document.getElementById('title');
        if (titleInput) {
            titleInput.focus();
        }

        // Validación en tiempo real para campos numéricos
        const yearInput = document.getElementById('release_year');
        const priceInput = document.getElementById('rental_price');
        const stockInput = document.getElementById('stock');

        // Año actual por defecto
        if (yearInput && !yearInput.value) {
            yearInput.value = new Date().getFullYear();
        }

        // Formatear precio mientras se escribe
        if (priceInput) {
            priceInput.addEventListener('input', (e) => {
                let value = e.target.value;
                if (value && !isNaN(value)) {
                    // Redondear a 2 decimales
                    const numValue = parseFloat(value);
                    if (numValue >= 0) {
                        e.target.value = numValue.toFixed(2);
                    }
                }
            });
        }

        // Validación de stock
        if (stockInput) {
            stockInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 0) {
                    e.target.value = 0;
                }
            });
        }
    }
});

// Hacer las funciones globales para poder usarlas desde el HTML
window.resetForm = resetForm;
window.hideResult = hideResult;
