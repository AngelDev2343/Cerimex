document.addEventListener('DOMContentLoaded', () => {
    const addressesContainer = document.getElementById('addresses-container');
    const addAddressCardButton = document.getElementById('add-address-card-button');
    const addressModal = document.getElementById('address-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeButton = addressModal.querySelector('.close-button');
    const addressForm = document.getElementById('address-form');
    const addressIdInput = document.getElementById('address-id');
    const nombreCompletoInput = document.getElementById('nombre_completo');
    const calleNumeroInput = document.getElementById('calle_numero');
    const coloniaInput = document.getElementById('colonia');
    const ciudadInput = document.getElementById('ciudad');
    const estadoInput = document.getElementById('estado');
    const codigoPostalInput = document.getElementById('codigo_postal');
    const paisInput = document.getElementById('pais');
    const telefonoInput = document.getElementById('telefono');
    const esPredeterminadaInput = document.getElementById('es_predeterminada');

    // Función para obtener y renderizar las direcciones
    async function fetchAndRenderAddresses() {
        try {
            // Asegúrate de que la ruta sea correcta según la configuración de tu servidor
            const response = await fetch('/api/get_addresses.php');
            const data = await response.json();

            if (data.success) {
                renderAddresses(data.addresses);
            } else {
                console.error('Error al obtener direcciones:', data.message);
                addressesContainer.innerHTML = '<p>Error al cargar direcciones. ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('Error de red al obtener direcciones:', error);
            addressesContainer.innerHTML = '<p>No se pudo conectar con el servidor para cargar las direcciones.</p>';
        }
    }

    // Función para renderizar las direcciones en el HTML
    function renderAddresses(addresses) {
        // Limpia el contenedor, pero mantiene el botón "Agregar"
        addressesContainer.innerHTML = '';
        addressesContainer.appendChild(addAddressCardButton);

        if (addresses.length === 0) {
            const noAddressesMessage = document.createElement('p');
            noAddressesMessage.textContent = 'No tienes direcciones guardadas.';
            noAddressesMessage.style.textAlign = 'center';
            noAddressesMessage.style.width = '100%';
            addressesContainer.appendChild(noAddressesMessage);
            return;
        }

        addresses.forEach(address => {
            const addressCard = document.createElement('div');
            addressCard.className = 'address-card';
            addressCard.dataset.id = address.id;

            addressCard.innerHTML = `
                ${address.es_predeterminada ? '<div class="default-address">Predeterminado</div>' : ''}
                <h4>${address.nombre_completo}</h4>
                <p>${address.calle_numero}</p>
                <p>${address.colonia}</p>
                <p>${address.ciudad}, ${address.estado} ${address.codigo_postal}</p>
                <p>${address.pais}</p>
                <p>Teléfono: ${address.telefono}</p>
                <div class="address-actions">
                    <button class="edit-button" data-id="${address.id}">Editar</button>
                    <button class="delete-button" data-id="${address.id}">Eliminar</button>
                    ${!address.es_predeterminada ? `<button class="set-default-button" data-id="${address.id}">Establecer como predeterminado</button>` : ''}
                </div>
            `;
            addressesContainer.insertBefore(addressCard, addAddressCardButton);
        });

        // Adjuntar event listeners a los botones de editar y eliminar
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const addressId = event.target.dataset.id;
                const addressToEdit = addresses.find(a => a.id == addressId);
                if (addressToEdit) {
                    openAddressModal('edit', addressToEdit);
                }
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const addressId = event.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
                    deleteAddress(addressId);
                }
            });
        });

        document.querySelectorAll('.set-default-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const addressId = event.target.dataset.id;
                setAddressAsDefault(addressId);
            });
        });
    }

    // Funciones para abrir y cerrar el modal
    function openAddressModal(mode = 'add', address = null) {
        addressModal.style.display = 'flex'; // Cambiado a flex para centrar
        addressForm.reset(); // Limpia el formulario
        addressIdInput.value = '';
        esPredeterminadaInput.checked = false;

        if (mode === 'add') {
            modalTitle.textContent = 'Agregar Nueva Dirección';
            paisInput.value = 'México'; // Valor predeterminado
        } else { // edit mode
            modalTitle.textContent = 'Editar Dirección';
            addressIdInput.value = address.id;
            nombreCompletoInput.value = address.nombre_completo;
            calleNumeroInput.value = address.calle_numero;
            coloniaInput.value = address.colonia;
            ciudadInput.value = address.ciudad;
            estadoInput.value = address.estado;
            codigoPostalInput.value = address.codigo_postal;
            paisInput.value = address.pais;
            telefonoInput.value = address.telefono;
            esPredeterminadaInput.checked = address.es_predeterminada;
        }
    }

    function closeAddressModal() {
        addressModal.style.display = 'none';
        addressForm.reset();
    }

    // Event listeners para el modal
    addAddressCardButton.addEventListener('click', () => openAddressModal('add'));
    closeButton.addEventListener('click', closeAddressModal);
    // Cierra el modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === addressModal) {
            closeAddressModal();
        }
    });

    // Envío del formulario de dirección (Agregar/Editar)
    addressForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addressForm);
        const addressId = formData.get('id');
        const isEdit = !!addressId;

        const payload = {
            id: isEdit ? parseInt(addressId) : undefined,
            nombre_completo: formData.get('nombre_completo'),
            calle_numero: formData.get('calle_numero'),
            colonia: formData.get('colonia'),
            ciudad: formData.get('ciudad'),
            estado: formData.get('estado'),
            codigo_postal: formData.get('codigo_postal'),
            pais: formData.get('pais'),
            telefono: formData.get('telefono'),
            es_predeterminada: esPredeterminadaInput.checked
        };

        const url = isEdit ? '/api/update_address.php' : '/api/add_address.php';

        try {
            const response = await fetch(url, {
                method: 'POST', // Usamos POST para ambos por simplicidad
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                closeAddressModal();
                fetchAndRenderAddresses(); // Recargar la lista
            } else {
                alert('Error al guardar dirección: ' + data.message);
                console.error('Error al guardar dirección:', data.message);
            }
        } catch (error) {
            console.error('Error de red al guardar dirección:', error);
            alert('Error de conexión al servidor al guardar la dirección.');
        }
    });

    // Función para eliminar una dirección
    async function deleteAddress(addressId) {
        try {
            const response = await fetch('/api/delete_address.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: addressId })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchAndRenderAddresses(); // Recargar la lista
            } else {
                alert('Error al eliminar dirección: ' + data.message);
                console.error('Error al eliminar dirección:', data.message);
            }
        } catch (error) {
            console.error('Error de red al eliminar dirección:', error);
            alert('Error de conexión al servidor al eliminar la dirección.');
        }
    }

    // Función para establecer una dirección como predeterminada
    async function setAddressAsDefault(addressId) {
        try {
            const response = await fetch('/api/update_address.php', { // Reutilizamos update_address
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: addressId, es_predeterminada: true }) // Solo enviamos el ID y que es predeterminada
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchAndRenderAddresses(); // Recargar la lista
            } else {
                alert('Error al establecer dirección como predeterminada: ' + data.message);
                console.error('Error al establecer dirección como predeterminada:', data.message);
            }
        } catch (error) {
            console.error('Error de red al establecer dirección como predeterminada:', error);
            alert('Error de conexión al servidor al establecer la dirección como predeterminada.');
        }
    }

    // Carga las direcciones al cargar la página
    fetchAndRenderAddresses();
});