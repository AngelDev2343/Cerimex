document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos HTML donde se mostrarán los datos
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userPhoneElement = document.getElementById('user-phone');
    const userPasswordElement = document.getElementById('user-password');
    const logoutButton = document.getElementById('logout-button');
    const editButtons = document.querySelectorAll('.edit-button'); // Todos los botones con clase 'edit-button'
    const startCompromisedButton = document.getElementById('start-compromised-button'); // Botón "Iniciar" de cuenta comprometida

    // Referencias a los elementos del modal
    const editModal = document.getElementById('editModal');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalFieldName = document.getElementById('modal-field-name');
    const modalLabelField = document.getElementById('modal-label-field');
    const modalInputField = document.getElementById('modal-input-field');
    const modalDataType = document.getElementById('modal-data-type');
    const saveChangesButton = document.getElementById('save-changes-button');

    /**
     * @function fetchUserSecurityData
     * @description Obtiene los datos de seguridad del usuario desde el servidor y los muestra en la página.
     */
    async function fetchUserSecurityData() {
        try {
            const response = await fetch('api/get_user_security_data.php');
            const data = await response.json();

            if (data.success && data.userData) {
                // Actualizar el contenido de los elementos con los datos del usuario
                userNameElement.textContent = data.userData.nombre;
                userEmailElement.textContent = data.userData.email;
                userPhoneElement.textContent = data.userData.telefono_principal; // Usar el dato del servidor (placeholder o real)
                userPasswordElement.textContent = data.userData.contrasena_mascarada; // Contraseña enmascarada
            } else {
                // Si la carga falla o el usuario no está autenticado
                userNameElement.textContent = 'No disponible';
                userEmailElement.textContent = 'No disponible';
                userPhoneElement.textContent = 'No disponible';
                userPasswordElement.textContent = 'No disponible';
                console.error('Error al cargar los datos de seguridad:', data.message);

                // Si el error es por no autorizado (401), redirigir al login
                if (response.status === 401) {
                    // En un entorno real, podrías mostrar un modal en lugar de alert
                    window.location.href = 'login.html'; // Redirigir a la página de login
                }
            }
        } catch (error) {
            console.error('Error de red al obtener los datos de seguridad:', error);
            // Mostrar mensajes de error en la UI si hay un problema de conexión
            userNameElement.textContent = 'Error de carga';
            userEmailElement.textContent = 'Error de carga';
            userPhoneElement.textContent = 'Error de carga';
            userPasswordElement.textContent = 'Error de carga';
        }
    }

    /**
     * @function logout
     * @description Envía una solicitud para cerrar la sesión del usuario.
     */
    async function logout() {
        try {
            const response = await fetch('api/logout.php', {
                method: 'POST', // logout.php espera una solicitud POST
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                window.location.href = 'index.html'; // Redirigir a la página de inicio después de cerrar sesión
            } else {
                console.error('Error al cerrar sesión:', data.message);
            }
        } catch (error) {
            console.error('Error de red al cerrar sesión:', error);
        }
    }

    /**
     * @function openEditModal
     * @description Abre el modal de edición y precarga los datos.
     * @param {string} fieldName - El nombre legible del campo (ej. "Nombre", "Correo electrónico").
     * @param {string} currentValue - El valor actual del campo.
     * @param {string} dataType - El tipo de dato para identificar qué campo se está editando (ej. "nombre", "email").
     */
    function openEditModal(fieldName, currentValue, dataType) {
        modalFieldName.textContent = fieldName;
        modalLabelField.textContent = fieldName + ':';
        modalInputField.value = currentValue;
        modalDataType.value = dataType; // Guarda el tipo de dato para el guardado
        editModal.classList.add('active'); // Muestra el modal
        
        // Si es el campo de contraseña, cambia el tipo de input a 'password'
        if (dataType === 'contrasena') {
            modalInputField.type = 'password';
            modalInputField.value = ''; // Limpiar el campo de contraseña al abrir
            modalInputField.placeholder = 'Introduce nueva contraseña';
        } else {
            modalInputField.type = 'text';
            modalInputField.placeholder = '';
        }
    }

    /**
     * @function closeEditModal
     * @description Cierra el modal de edición.
     */
    function closeEditModal() {
        editModal.classList.remove('active'); // Oculta el modal
    }

    // --- Event Listeners ---

    // Asignar el event listener para el botón de cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Asignar event listeners para los botones de "Editar"
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const dataType = event.target.dataset.field; // Obtener el tipo de dato del atributo data-field
            let fieldName = '';
            let currentValue = '';

            // Obtener el nombre del campo y el valor actual basado en el dataType
            switch (dataType) {
                case 'nombre':
                    fieldName = 'Nombre';
                    currentValue = userNameElement.textContent;
                    break;
                case 'email':
                    fieldName = 'Correo electrónico';
                    currentValue = userEmailElement.textContent;
                    break;
                case 'telefono':
                    fieldName = 'Número de celular principal';
                    currentValue = userPhoneElement.textContent;
                    break;
                case 'contrasena':
                    fieldName = 'Contraseña';
                    currentValue = ''; // No precargar la contraseña real
                    break;
                default:
                    fieldName = 'Campo desconocido';
                    currentValue = '';
            }

            openEditModal(fieldName, currentValue, dataType);
        });
    });

    // Event listener para el botón de cerrar el modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeEditModal);
    }

    // Cerrar el modal si se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    // Event listener para el botón "Guardar Cambios" del modal
    if (saveChangesButton) {
        saveChangesButton.addEventListener('click', async () => {
            const fieldToUpdate = modalDataType.value;
            const newValue = modalInputField.value;

            if (!newValue.trim()) {
                // Usar un modal personalizado en lugar de alert
                // alert('El campo no puede estar vacío.');
                console.warn('El campo no puede estar vacío.');
                return;
            }

            // Aquí se envía la solicitud al servidor para actualizar el dato
            try {
                const response = await fetch('api/update_user_security_data.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        field: fieldToUpdate,
                        value: newValue
                    })
                });
                const data = await response.json();

                if (data.success) {
                    // Actualizar el elemento <p> correspondiente en la página
                    if (fieldToUpdate === 'nombre') userNameElement.textContent = newValue;
                    if (fieldToUpdate === 'email') userEmailElement.textContent = newValue;
                    if (fieldToUpdate === 'telefono') userPhoneElement.textContent = newValue;
                    if (fieldToUpdate === 'contrasena') userPasswordElement.textContent = '********'; // La contraseña siempre enmascarada

                    closeEditModal();
                    // Usar un modal personalizado en lugar de alert
                    // alert('Cambios guardados exitosamente.');
                    console.log('Cambios guardados exitosamente.');
                    // Opcional: Volver a cargar todos los datos para asegurar consistencia
                    fetchUserSecurityData(); 
                } else {
                    // Usar un modal personalizado en lugar de alert
                    // alert('Error al guardar cambios: ' + data.message);
                    console.error('Error al guardar cambios:', data.message);
                }
            } catch (error) {
                console.error('Error de red al guardar cambios:', error);
                // Usar un modal personalizado en lugar de alert
                // alert('Error de conexión al servidor al guardar cambios.');
            }
        });
    }

    // Asignar event listener para el botón "¿La cuenta ha sido comprometida?" (funcionalidad de placeholder)
    if (startCompromisedButton) {
        startCompromisedButton.addEventListener('click', () => {
            console.log('Botón "Cuenta comprometida" clickeado');
        });
    }

    // --- Inicialización ---
    // Llamar a la función para cargar los datos de seguridad cuando la página se cargue
    fetchUserSecurityData();
});