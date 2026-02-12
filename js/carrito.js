document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartShippingSpan = document.getElementById('cart-shipping');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountNavSpan = document.getElementById('cart-count-nav'); // Para el contador en la navegación

    // Función para obtener y renderizar los ítems del carrito
    async function fetchAndRenderCart() {
        try {
            const response = await fetch('api/get_cart.php');
            const data = await response.json();

            if (data.success) {
                renderCartItems(data.cartItems);
                updateCartSummary(data.cartItems);
                updateCartCountNav(data.cartCount);
            } else {
                console.error('Error al obtener el carrito:', data.message);
                cartItemsContainer.innerHTML = '<p>Error al cargar el carrito. Por favor, inténtalo de nuevo más tarde.</p>';
                updateCartCountNav(0);
            }
        } catch (error) {
            console.error('Error de red al obtener el carrito:', error);
            cartItemsContainer.innerHTML = '<p>No se pudo conectar con el servidor para cargar el carrito.</p>';
            updateCartCountNav(0);
        }
    }

    // Función para renderizar los ítems en el HTML
    function renderCartItems(items) {
        cartItemsContainer.innerHTML = ''; // Limpiar contenedor actual

        if (items.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            return;
        }

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.setAttribute('data-product-id', item.id); // Guardar el ID del producto

            itemElement.innerHTML = `
                <img src="${item.image_url || 'img/placeholder.png'}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <label for="quantity-${item.id}">Cantidad:</label>
                        <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    </div>
                </div>
                <div class="cart-buttons">
                    <button class="cart-save-button" data-product-id="${item.id}">Actualizar</button>
                    <button class="cart-remove-button" data-product-id="${item.id}">Eliminar</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Añadir event listeners después de renderizar
        addCartEventListeners();
    }

    // Función para actualizar el resumen del carrito (subtotal, envío, total)
    function updateCartSummary(items) {
        let subtotal = 0;
        // Asumiendo que el envío es fijo o calculado de otra manera.
        // Por ahora, lo dejamos en 0.00 o puedes poner un valor fijo.
        let shipping = 0.00; 

        items.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const total = subtotal + shipping;

        cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        cartShippingSpan.textContent = `$${shipping.toFixed(2)}`;
        cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    }

    // Función para actualizar el contador del carrito en la navegación
    function updateCartCountNav(count) {
        if (cartCountNavSpan) {
            cartCountNavSpan.textContent = count;
        }
    }

    // Función para añadir event listeners a los botones del carrito
    function addCartEventListeners() {
        // Event listeners para actualizar cantidad
        document.querySelectorAll('.cart-item-quantity input[type="number"]').forEach(input => {
            input.onchange = async (event) => {
                const productId = event.target.dataset.productId;
                const newQuantity = parseInt(event.target.value);

                if (newQuantity < 0) {
                    alert('La cantidad no puede ser negativa.');
                    event.target.value = 1; // Restaura a 1 o la cantidad anterior
                    return;
                }

                if (newQuantity === 0) {
                     if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
                        event.target.value = 1; // Restaura a 1 si el usuario cancela
                        return;
                    }
                }
                await updateProductQuantity(productId, newQuantity);
            };
        });

        // Event listeners para botones de "Actualizar"
        document.querySelectorAll('.cart-save-button').forEach(button => {
            button.onclick = async (event) => {
                const productId = event.target.dataset.productId;
                const quantityInput = document.querySelector(`#quantity-${productId}`);
                const newQuantity = parseInt(quantityInput.value);
                
                if (newQuantity < 0) {
                    alert('La cantidad no puede ser negativa.');
                    quantityInput.value = 1; 
                    return;
                }

                await updateProductQuantity(productId, newQuantity);
            };
        });

        // Event listeners para botones de "Eliminar"
        document.querySelectorAll('.cart-remove-button').forEach(button => {
            button.onclick = async (event) => {
                const productId = event.target.dataset.productId;
                if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
                    await removeProductFromCart(productId);
                     location.reload();
                }
            };
        });
    }

    // Función para actualizar la cantidad de un producto en el carrito (backend)
    async function updateProductQuantity(productId, quantity) {
        try {
            const response = await fetch('api/update_cart_quantity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: productId, quantity: quantity })
            });
            const data = await response.json();

            if (data.success) {
                console.log(data.message);
                fetchAndRenderCart(); // Volver a cargar el carrito para reflejar los cambios
            } else {
                alert('Error al actualizar la cantidad: ' + data.message);
                console.error('Error al actualizar la cantidad:', data.message);
            }
        } catch (error) {
            console.error('Error de red al actualizar la cantidad:', error);
            alert('Error de conexión al servidor al actualizar la cantidad.');
        }
    }

    // Función para eliminar un producto del carrito (backend)
    async function removeProductFromCart(productId) {
        try {
            const response = await fetch('api/remove_from_cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: productId })
            });
            const data = await response.json();

            if (data.success) {
                console.log(data.message);
                fetchAndRenderCart(); // Volver a cargar el carrito para reflejar los cambios
            } else {
                console.error('Error al eliminar el producto:', data.message);
            }
        } catch (error) {
            console.error('Error de red al eliminar el producto:', error);
            alert('Error de conexión al servidor al eliminar el producto.');
        }
    }

    // Llama a la función para cargar el carrito cuando la página se carga
    fetchAndRenderCart();
});