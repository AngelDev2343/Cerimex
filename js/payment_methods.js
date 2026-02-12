document.addEventListener('DOMContentLoaded', () => {
    const paymentMethodsContainer = document.getElementById('payment-methods-container');
    const addPaymentCardButton = document.getElementById('add-payment-card-button');
    const paymentModal = document.getElementById('payment-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeButton = paymentModal.querySelector('.close-button');
    const paymentForm = document.getElementById('payment-form');
    const paymentIdInput = document.getElementById('payment-id');
    const tipoTarjetaInput = document.getElementById('tipo_tarjeta');
    const numeroTarjetaCompletoInput = document.getElementById('numero_tarjeta_completo'); // Nuevo ID
    const fechaExpiracionInput = document.getElementById('fecha_expiracion');
    const nombreTitularInput = document.getElementById('nombre_titular');
    const esPredeterminadoInput = document.getElementById('es_predeterminado');

    // Función para obtener y renderizar los métodos de pago
    async function fetchAndRenderPaymentMethods() {
        try {
            const response = await fetch('/api/get_payment_methods.php'); // Asegúrate de que esta ruta sea correcta
            const data = await response.json();

            if (data.success) {
                renderPaymentMethods(data.paymentMethods);
            } else {
                console.error('Error al obtener métodos de pago:', data.message);
                paymentMethodsContainer.innerHTML = '<p>Error al cargar métodos de pago. ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('Error de red al obtener métodos de pago:', error);
            paymentMethodsContainer.innerHTML = '<p>No se pudo conectar con el servidor para cargar los métodos de pago.</p>';
        }
    }

    // Función para renderizar los métodos de pago en el HTML
    function renderPaymentMethods(methods) {
        // Limpia el contenedor, pero mantiene el botón "Agregar"
        paymentMethodsContainer.innerHTML = '';
        paymentMethodsContainer.appendChild(addPaymentCardButton);

        if (methods.length === 0) {
            const noMethodsMessage = document.createElement('p');
            noMethodsMessage.textContent = 'No tienes métodos de pago guardados.';
            noMethodsMessage.style.textAlign = 'center';
            noMethodsMessage.style.width = '100%';
            paymentMethodsContainer.appendChild(noMethodsMessage);
            return;
        }

        methods.forEach(method => {
            const paymentCard = document.createElement('div');
            paymentCard.className = 'payment-card';
            paymentCard.dataset.id = method.id;

            // Siempre Mastercard para este ejemplo
            const cardImageSrc = 'img/mastercard.png'; // Asegúrate de tener img/mastercard.png

            // Mostrar solo los últimos 4 dígitos en la vista, pero el número completo en la base de datos
            const ultimosDigitosMostrados = method.numero_tarjeta_completo.slice(-4);

            paymentCard.innerHTML = `
                ${method.es_predeterminado ? '<div class="default-payment">Predeterminado</div>' : ''}
                <img src="${cardImageSrc}" alt="${method.tipo_tarjeta}" class="card-image">
                <h4>${method.tipo_tarjeta}</h4>
                <p>Tarjeta con terminación •••• ${ultimosDigitosMostrados}</p>
                <p>Expira: ${method.fecha_expiracion}</p>
                <p>Titular: ${method.nombre_titular}</p>
                <div class="actions">
                    <button class="edit-button" data-id="${method.id}">Editar</button>
                    <button class="delete-button" data-id="${method.id}">Eliminar</button>
                </div>
            `;
            paymentMethodsContainer.insertBefore(paymentCard, addPaymentCardButton);
        });

        // Adjuntar event listeners a los botones de editar y eliminar
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const methodId = event.target.dataset.id;
                const methodToEdit = methods.find(m => m.id == methodId);
                if (methodToEdit) {
                    openPaymentModal('edit', methodToEdit);
                }
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const methodId = event.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
                    deletePaymentMethod(methodId);
                }
            });
        });
    }

    // Funciones para abrir y cerrar el modal
    function openPaymentModal(mode = 'add', method = null) {
        paymentModal.style.display = 'flex'; // Cambiado a flex para centrar
        paymentForm.reset(); // Limpia el formulario
        paymentIdInput.value = '';
        esPredeterminadoInput.checked = false;

        if (mode === 'add') {
            modalTitle.textContent = 'Agregar Nuevo Método de Pago';
            // Solo una opción, así que no es necesario establecer el valor aquí
            // tipoTarjetaInput.value = 'Mastercard';
        } else { // edit mode
            modalTitle.textContent = 'Editar Método de Pago';
            paymentIdInput.value = method.id;
            tipoTarjetaInput.value = method.tipo_tarjeta;
            numeroTarjetaCompletoInput.value = method.numero_tarjeta_completo; // Carga el número completo
            fechaExpiracionInput.value = method.fecha_expiracion;
            nombreTitularInput.value = method.nombre_titular;
            esPredeterminadoInput.checked = method.es_predeterminado;
        }
    }

    function closePaymentModal() {
        paymentModal.style.display = 'none';
        paymentForm.reset();
    }

    // Event listeners para el modal
    addPaymentCardButton.addEventListener('click', () => openPaymentModal('add'));
    closeButton.addEventListener('click', closePaymentModal);
    // Cierra el modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            closePaymentModal();
        }
    });

    // Envío del formulario de pago (Agregar/Editar)
    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(paymentForm);
        const methodId = formData.get('id');
        const isEdit = !!methodId;

        const payload = {
            id: isEdit ? parseInt(methodId) : undefined,
            tipo_tarjeta: formData.get('tipo_tarjeta'),
            numero_tarjeta_completo: formData.get('numero_tarjeta_completo'), // Envía el número completo
            fecha_expiracion: formData.get('fecha_expiracion'),
            nombre_titular: formData.get('nombre_titular'),
            es_predeterminado: esPredeterminadoInput.checked
        };

        const url = isEdit ? '/api/update_payment_method.php' : '/api/add_payment_method.php';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                closePaymentModal();
                fetchAndRenderPaymentMethods(); // Recargar la lista
            } else {
                alert('Error al guardar método de pago: ' + data.message);
                console.error('Error al guardar método de pago:', data.message);
            }
        } catch (error) {
            console.error('Error de red al guardar método de pago:', error);
            alert('Error de conexión al servidor al guardar el método de pago.');
        }
    });

    // Función para eliminar un método de pago
    async function deletePaymentMethod(methodId) {
        try {
            const response = await fetch('/api/delete_payment_method.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: methodId })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchAndRenderPaymentMethods(); // Recargar la lista
            } else {
                alert('Error al eliminar método de pago: ' + data.message);
                console.error('Error al eliminar método de pago:', data.message);
            }
        } catch (error) {
            console.error('Error de red al eliminar método de pago:', error);
            alert('Error de conexión al servidor al eliminar el método de pago.');
        }
    }

    // Carga los métodos de pago al cargar la página
    fetchAndRenderPaymentMethods();
});