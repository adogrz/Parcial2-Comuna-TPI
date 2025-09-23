// Clients Management JavaScript
// Manejar la funcionalidad CRUD de clientes

let selectedClientId = null;
let clients = [];
let isEditing = false;

// Función para obtener todos los clientes
async function getAllClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const clientsData = await response.json();
        return clientsData;
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error;
    }
}

// Función para obtener un cliente por ID
async function getClientById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const client = await response.json();
        return client;
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        throw error;
    }
}

// Función para crear un nuevo cliente
async function createClient(clientData) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newClient = await response.json();
        return newClient;
    } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
    }
}

// Función para actualizar un cliente
async function updateClient(id, clientData) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedClient = await response.json();
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw error;
    }
}

// Función para eliminar un cliente
async function deleteClient(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
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
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
}

// Función para crear fila de cliente
function createClientRow(client) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.dataset.clientId = client.id;
    
    row.innerHTML = `
        <div class="table-cell">
            <strong>${client.name}</strong>
        </div>
        <div class="table-cell">
            ${client.email}
        </div>
        <div class="table-cell">
            ${client.phone}
        </div>
    `;
    
    // Event listener para selección de fila
    row.addEventListener('click', () => {
        if (selectedClientId === client.id) {
            // Deseleccionar si se hace clic en la fila ya seleccionada
            selectedClientId = null;
            row.classList.remove('selected');
        } else {
            selectedClientId = client.id;
            highlightSelectedRow(row);
        }
        updateActionButtons();
    });
    
    return row;
}

// Función para resaltar la fila seleccionada
function highlightSelectedRow(selectedRow) {
    // Quitar highlighting de todas las filas
    document.querySelectorAll('.table-row').forEach(row => {
        row.classList.remove('selected');
    });
    
    // Agregar highlighting a la fila seleccionada
    selectedRow.classList.add('selected');
}

// Función para actualizar botones de acción
function updateActionButtons() {
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    
    const isSelected = selectedClientId !== null;
    editBtn.disabled = !isSelected;
    deleteBtn.disabled = !isSelected;
}

// Función para renderizar la lista de clientes
function renderClientsList(clientsData) {
    const clientsList = document.getElementById('clients-list');
    const noClientsDiv = document.getElementById('no-clients');
    const clientsTable = document.getElementById('clients-table');
    
    clientsList.innerHTML = '';
    
    if (clientsData.length === 0) {
        clientsTable.style.display = 'none';
        noClientsDiv.style.display = 'block';
        return;
    }
    
    noClientsDiv.style.display = 'none';
    clientsTable.style.display = 'block';
    
    clientsData.forEach(client => {
        const row = createClientRow(client);
        clientsList.appendChild(row);
    });
}

// Función para mostrar estado de carga
function showLoading() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('clients-table').style.display = 'none';
    document.getElementById('no-clients').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
}

// Función para mostrar estado de error
function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('clients-table').style.display = 'none';
    document.getElementById('no-clients').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}

// Función principal para cargar clientes
async function loadClients() {
    showLoading();
    
    try {
        clients = await getAllClients();
        renderClientsList(clients);
        
        document.getElementById('loading-state').style.display = 'none';
        console.log('Clientes cargados:', clients);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        showError();
    }
}

// Función para validar formulario
function validateForm(formData) {
    const errors = [];

    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push('Debe proporcionar un email válido');
    }

    if (!formData.phone || formData.phone.trim().length < 8) {
        errors.push('El teléfono debe tener al menos 8 caracteres');
    }

    return errors;
}

// Función para mostrar el estado de carga del formulario
function showFormLoading() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
}

// Función para ocultar el estado de carga del formulario
function hideFormLoading() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
}

// Función para mostrar resultado exitoso
function showSuccess(message) {
    const result = document.getElementById('form-result');
    const success = document.getElementById('result-success');
    const error = document.getElementById('result-error');
    const successMsg = document.getElementById('success-message');
    
    result.style.display = 'block';
    success.style.display = 'block';
    error.style.display = 'none';
    successMsg.textContent = message;
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        result.style.display = 'none';
    }, 3000);
}

// Función para mostrar error
function showFormError(errorMessage) {
    const result = document.getElementById('form-result');
    const success = document.getElementById('result-success');
    const error = document.getElementById('result-error');
    const errorMsg = document.getElementById('error-message');
    
    result.style.display = 'block';
    success.style.display = 'none';
    error.style.display = 'block';
    errorMsg.textContent = errorMessage;
}

// Función para limpiar formulario
function clearForm() {
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('form-title').textContent = 'Agregar Nuevo Cliente';
    document.getElementById('submit-text').textContent = '➕ Agregar Cliente';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('form-result').style.display = 'none';
    
    isEditing = false;
}

// Función para llenar formulario con datos del cliente
function fillForm(client) {
    document.getElementById('name').value = client.name || '';
    document.getElementById('email').value = client.email || '';
    document.getElementById('phone').value = client.phone || '';
    document.getElementById('client-id').value = client.id || '';
    
    document.getElementById('form-title').textContent = 'Editar Cliente';
    document.getElementById('submit-text').textContent = '💾 Actualizar Cliente';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    
    isEditing = true;
}

// Función para manejar edición
async function handleEdit() {
    if (!selectedClientId) return;
    
    try {
        const client = await getClientById(selectedClientId);
        fillForm(client);
        
        // Scroll al formulario
        document.querySelector('.client-form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    } catch (error) {
        console.error('Error al cargar cliente para editar:', error);
        showFormError('Error al cargar los datos del cliente');
    }
}

// Función para manejar eliminación
async function handleDelete() {
    if (!selectedClientId) return;
    
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar a "${client.name}"?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
        try {
            await deleteClient(selectedClientId);
            
            // Recargar lista
            selectedClientId = null;
            updateActionButtons();
            clearForm();
            await loadClients();
            
            showSuccess('Cliente eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showFormError('Error al eliminar el cliente');
        }
    }
}

// Función para manejar envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Extraer y procesar los datos
    const clientData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim()
    };
    
    // Validar datos
    const validationErrors = validateForm(clientData);
    if (validationErrors.length > 0) {
        showFormError(`Errores de validación:\n${validationErrors.join('\n')}`);
        return;
    }
    
    // Mostrar estado de carga
    showFormLoading();
    
    try {
        if (isEditing) {
            // Actualizar cliente existente
            const clientId = formData.get('id');
            const existingClient = await getClientById(clientId);
            const updatedClientData = {
                ...existingClient,
                ...clientData
            };
            
            await updateClient(clientId, updatedClientData);
            showSuccess('Cliente actualizado correctamente');
        } else {
            // Crear nuevo cliente
            await createClient(clientData);
            showSuccess('Cliente agregado correctamente');
        }
        
        // Limpiar formulario y recargar lista
        clearForm();
        selectedClientId = null;
        updateActionButtons();
        await loadClients();
        
    } catch (error) {
        console.error('Error al procesar cliente:', error);
        showFormError('Error al procesar el cliente. Verifica tu conexión e intenta de nuevo.');
    } finally {
        hideFormLoading();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('clients.html')) {
        // Cargar clientes al iniciar
        loadClients();
        
        // Formulario
        const form = document.getElementById('client-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Botón editar
        const editBtn = document.getElementById('edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', handleEdit);
        }
        
        // Botón eliminar
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', handleDelete);
        }
        
        // Botón cancelar edición
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                clearForm();
                selectedClientId = null;
                updateActionButtons();
                
                // Quitar selección
                document.querySelectorAll('.client-radio').forEach(radio => {
                    radio.checked = false;
                });
                document.querySelectorAll('.table-row').forEach(row => {
                    row.classList.remove('selected');
                });
            });
        }
    }
});
