document.addEventListener('DOMContentLoaded', async () => {
    const addressMissingMessage = document.getElementById('address-missing-message');
    const checkoutSection = document.querySelector('.checkout-section');
    const defaultAddressDisplay = document.getElementById('default-address-display');
    const paymentMethodsList = document.getElementById('payment-methods-list');
    const orderItemsSummary = document.getElementById('order-items-summary');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartShippingSpan = document.getElementById('cart-shipping');
    const cartTotalSpan = document.getElementById('cart-total');
    const placeOrderButton = document.getElementById('place-order-button');
    const cartCountNavSpan = document.getElementById('cart-count-nav'); // Para el contador en la navegación

    let selectedPaymentMethodId = null;
    let currentCartItems = [];
    let defaultAddress = null;

    // Función para actualizar el contador del carrito en la navegación (reutilizada de carrito.js)
    function updateCartCountNav(count) {
        if (cartCountNavSpan) {
            cartCountNavSpan.textContent = count;
        }
    }

    // --- Funciones de carga de datos ---

    async function fetchDefaultAddress() {
        try {
            const response = await fetch('api/get_default_address.php');
            const data = await response.json();

            if (data.success && data.address) {
                defaultAddress = data.address; // Guarda la dirección por si la necesitas más tarde
                renderAddress(data.address);
                return true; // Hay dirección
            } else {
                defaultAddressDisplay.innerHTML = '<p>No se encontró una dirección predeterminada.</p>';
                return false; // No hay dirección
            }
        } catch (error) {
            console.error('Error de red al obtener la dirección predeterminada:', error);
            defaultAddressDisplay.innerHTML = '<p>Error al cargar la dirección.</p>';
            return false;
        }
    }

    async function fetchPaymentMethods() {
        try {
            const response = await fetch('api/get_payment_methods.php');
            const data = await response.json();

            if (data.success && data.paymentMethods.length > 0) {
                renderPaymentMethods(data.paymentMethods);
            } else {
                paymentMethodsList.innerHTML = '<p>No tienes métodos de pago guardados. Por favor, <a href="pagos.html">agrega uno</a>.</p>';
            }
        } catch (error) {
            console.error('Error de red al obtener métodos de pago:', error);
            paymentMethodsList.innerHTML = '<p>Error al cargar métodos de pago.</p>';
        }
    }

    async function fetchCartForSummary() {
        try {
            const response = await fetch('api/get_cart.php');
            const data = await response.json();

            if (data.success && data.cartItems.length > 0) {
                currentCartItems = data.cartItems; // Guarda los ítems del carrito
                renderOrderSummary(data.cartItems);
                updateCartTotals(data.cartItems);
                updateCartCountNav(data.cartCount);
            } else {
                orderItemsSummary.innerHTML = '<p>Tu carrito está vacío.</p>';
                updateCartTotals([]);
                updateCartNavCount(0);
                // Si el carrito está vacío, quizás deshabilitar el botón de pago
                placeOrderButton.disabled = true;
                placeOrderButton.textContent = 'Carrito Vacío';
            }
        } catch (error) {
            console.error('Error de red al obtener el carrito para el resumen:', error);
            orderItemsSummary.innerHTML = '<p>Error al cargar los productos del carrito.</p>';
            updateCartTotals([]);
            updateCartNavCount(0);
            placeOrderButton.disabled = true;
            placeOrderButton.textContent = 'Error al Cargar Carrito';
        }
    }

    // --- Funciones de renderizado ---

    function renderAddress(address) {
        // Se han actualizado los nombres de las propiedades para que coincidan con las columnas de tu base de datos
        defaultAddressDisplay.innerHTML = `
            <p><strong>${address?.nombre_completo ?? 'N/A'}</strong></p>
            <p>${address?.calle_numero ?? 'N/A'}</p>
            <p>${address?.colonia ?? 'N/A'}</p>
            <p>${address?.ciudad ?? 'N/A'}, ${address?.estado ?? 'N/A'} ${address?.codigo_postal ?? 'N/A'}</p>
            <p>${address?.pais ?? 'N/A'}</p>
            <p>Teléfono: ${address?.telefono ?? 'N/A'}</p>
        `;
    }

    function renderPaymentMethods(methods) {
        paymentMethodsList.innerHTML = ''; // Limpia el contenido anterior

        methods.forEach(method => {
            // Extraer los últimos cuatro dígitos de numero_tarjeta_completo
            const lastFourDigits = method.numero_tarjeta_completo ? method.numero_tarjeta_completo.slice(-4) : 'N/A';
            
            // Extraer mes y año de fecha_expiracion (formato YYYY-MM)
            let expiryMonth = 'N/A';
            let expiryYear = 'N/A';
            if (method.fecha_expiracion) {
                const dateParts = method.fecha_expiracion.split('-');
                if (dateParts.length === 2) {
                    expiryYear = dateParts[0];
                    expiryMonth = dateParts[1];
                }
            }

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('saved-card');
            cardDiv.dataset.paymentMethodId = method.id; // Guarda el ID para seleccionarlo
            cardDiv.dataset.cardType = method.tipo_tarjeta.toLowerCase(); // Utiliza tipo_tarjeta y conviértelo a minúsculas

            // Seleccionar la primera tarjeta por defecto si no hay una seleccionada
            if (selectedPaymentMethodId === null) {
                selectedPaymentMethodId = method.id;
                cardDiv.classList.add('selected');
            }

            cardDiv.innerHTML = `
                <img src="img/${method.tipo_tarjeta.toLowerCase()}.png" alt="${method.tipo_tarjeta}">
                <div class="saved-card-info">
                    <span>${method.tipo_tarjeta} termina en ${lastFourDigits}</span>
                </div>
                <button class="select-card-btn">Seleccionar</button>
            `;
            paymentMethodsList.appendChild(cardDiv);
        });

        // Añadir event listeners a los botones de seleccionar tarjeta
        paymentMethodsList.querySelectorAll('.select-card-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const clickedCard = event.target.closest('.saved-card');
                // Remover 'selected' de todas las tarjetas
                paymentMethodsList.querySelectorAll('.saved-card').forEach(card => {
                    card.classList.remove('selected');
                });
                // Añadir 'selected' a la tarjeta clickeada
                clickedCard.classList.add('selected');
                selectedPaymentMethodId = clickedCard.dataset.paymentMethodId;
                console.log('Método de pago seleccionado:', selectedPaymentMethodId);
            });
        });
    }


    function renderOrderSummary(items) {
        orderItemsSummary.innerHTML = '';
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('order-item');
            itemDiv.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItemsSummary.appendChild(itemDiv);
        });
    }

    function updateCartTotals(items) {
        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        const shipping = 0; // Puedes añadir lógica de envío aquí
        const total = subtotal + shipping;

        cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        cartShippingSpan.textContent = `$${shipping.toFixed(2)}`;
        cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    }

    // --- Lógica de procesamiento de pago ---

    placeOrderButton.addEventListener('click', async () => {
        if (!defaultAddress) {
            alert('Por favor, agrega una dirección de envío predeterminada en "Mi Cuenta" para completar tu pedido.');
            window.location.href = 'direcciones.html';
            return;
        }

        if (!selectedPaymentMethodId) {
            alert('Por favor, selecciona un método de pago.');
            return;
        }

        if (currentCartItems.length === 0) {
            alert('Tu carrito está vacío. No puedes proceder con el pago.');
            window.location.href = 'carrito.html';
            return;
        }

        placeOrderButton.disabled = true;
        placeOrderButton.textContent = 'Procesando...';

        try {
            const response = await fetch('api/place_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address_id: defaultAddress.id, // Asume que la dirección tiene un ID
                    payment_method_id: selectedPaymentMethodId,
                    cart_items: currentCartItems, // Enviar los items actuales del carrito
                    total_amount: parseFloat(cartTotalSpan.textContent.replace('$', ''))
                })
            });
            const data = await response.json();

            if (data.success) {
                // Almacenar los datos del pedido en sessionStorage antes de redirigir
                sessionStorage.setItem('orderItems', JSON.stringify(currentCartItems));
                sessionStorage.setItem('orderTotal', cartTotalSpan.textContent);
                // Obtener la fecha actual en formato legible
                const orderDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                sessionStorage.setItem('orderDate', orderDate);

                // alert(data.message); // Considera usar un modal personalizado en lugar de alert
                window.location.href = 'pagorealizado.html'; // Redirigir a la página de confirmación
            } else {
                // alert('Error al procesar el pago: ' + data.message); // Considera usar un modal personalizado
                console.error('Error al procesar el pago:', data.message);
                placeOrderButton.disabled = false;
                placeOrderButton.textContent = 'Confirmar y Pagar';
            }
        } catch (error) {
            console.error('Error de red al procesar el pago:', error);
            // alert('Error de conexión al servidor al procesar el pago.'); // Considera usar un modal personalizado
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = 'Confirmar y Pagar';
        }
    });

    // --- Inicialización ---

    async function initializePage() {
        const hasAddress = await fetchDefaultAddress();
        if (!hasAddress) {
            addressMissingMessage.style.display = 'block';
            checkoutSection.style.display = 'none'; // Oculta el resto del contenido de pago
            placeOrderButton.disabled = true;
            placeOrderButton.textContent = 'Requiere Dirección';
        } else {
            addressMissingMessage.style.display = 'none';
            checkoutSection.style.display = 'grid'; // Asegura que la sección de pago se muestre
            fetchPaymentMethods();
            fetchCartForSummary();
        }
    }

    initializePage();
});
