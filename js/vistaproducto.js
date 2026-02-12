// --- Declaración de Funciones ---

// Función principal para cargar los detalles del producto
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // Obtiene el ID del producto de la URL

    const productImage = document.getElementById('product-detail-image');
    const productTitle = document.getElementById('product-detail-title');
    const productOriginalPrice = document.getElementById('product-original-price');
    const productDiscountedPrice = document.getElementById('product-discounted-price');
    const productDescription = document.getElementById('product-detail-description');
    const quantityInput = document.getElementById('quantity');
    const addToCartButton = document.getElementById('add-to-cart-detail-button');
    const buyNowButton = document.getElementById('buy-now-detail-button'); // Nuevo botón

    if (!productId) {
        if (productTitle) productTitle.textContent = 'Error: ID de producto no encontrado.';
        if (productDescription) productDescription.textContent = 'Por favor, regrese a la página de productos y seleccione un producto válido.';
        if (productImage) productImage.src = 'https://placehold.co/400x400/FF0000/FFFFFF?text=Error+ID';
        if (productOriginalPrice) productOriginalPrice.textContent = '';
        if (productDiscountedPrice) productDiscountedPrice.textContent = '';
        if (addToCartButton) addToCartButton.disabled = true; // Deshabilitar botones si no hay producto
        if (buyNowButton) buyNowButton.disabled = true;
        console.error('ID de producto no encontrado en la URL.');
        return;
    }

    try {
        const response = await fetch(`api/get_product_details.php?id=${encodeURIComponent(productId)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar detalles del producto: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();

        if (data.success && data.product) {
            const product = data.product;

            // Rellenar los elementos HTML con los detalles del producto
            if (productImage) productImage.src = product.image_url || 'https://placehold.co/400x400/cccccc/333333?text=No+Imagen';
            if (productImage) productImage.alt = product.name;
            if (productTitle) productTitle.textContent = product.name;
            if (productDescription) productDescription.textContent = product.description;

            // Mostrar precios
            if (product.oferta === 'SI' && product.original_price !== product.price) {
                if (productOriginalPrice) productOriginalPrice.textContent = `$${product.original_price.toFixed(2)}`;
                if (productDiscountedPrice) productDiscountedPrice.textContent = `$${product.price.toFixed(2)}`;
            } else {
                if (productOriginalPrice) productOriginalPrice.textContent = ''; // No mostrar precio original si no hay oferta
                if (productDiscountedPrice) productDiscountedPrice.textContent = `$${product.price.toFixed(2)}`;
            }

            // Opcional: Limitar la cantidad de compra al stock disponible
            if (quantityInput) {
                quantityInput.max = product.stock;
                if (product.stock === 0) {
                    quantityInput.value = 0;
                    quantityInput.disabled = true;
                    if(addToCartButton) addToCartButton.disabled = true;
                    if(buyNowButton) buyNowButton.disabled = true; // Deshabilitar también el botón "Comprar ahora"
                    if(productTitle) productTitle.textContent += " (AGOTADO)";
                }
            }

        } else {
            if (productTitle) productTitle.textContent = `Producto con ID "${productId}" no encontrado.`;
            if (productDescription) productDescription.textContent = data.message || 'El producto solicitado no existe.';
            if (productImage) productImage.src = 'https://placehold.co/400x400/FF0000/FFFFFF?text=Producto+No+Encontrado';
            if (productOriginalPrice) productOriginalPrice.textContent = '';
            if (productDiscountedPrice) productDiscountedPrice.textContent = '';
            if (addToCartButton) addToCartButton.disabled = true;
            if (buyNowButton) buyNowButton.disabled = true;
            console.error('Producto no encontrado:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
        if (productTitle) productTitle.textContent = 'Error al cargar los detalles del producto.';
        if (productDescription) productDescription.textContent = 'Por favor, inténtalo de nuevo más tarde.';
        if (productImage) productImage.src = 'https://placehold.co/400x400/FF0000/FFFFFF?text=Error+Carga';
        if (productOriginalPrice) productOriginalPrice.textContent = '';
        if (productDiscountedPrice) productDiscountedPrice.textContent = '';
        if (addToCartButton) addToCartButton.disabled = true;
        if (buyNowButton) buyNowButton.disabled = true;
    }
}

// Función para inicializar la barra de búsqueda (copiada de main.js)
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const searchButton = document.querySelector('.search-bar button[type="submit"]');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            // Redirige a la página de productos generales con el término de búsqueda
            window.location.href = `productos.html?search=${encodeURIComponent(searchTerm)}`;
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                window.location.href = `productos.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
}

// Configura el botón "Agregar al Carrito" en la página de detalles del producto
function setupAddToCartDetailButton() {
    const addToCartButton = document.getElementById('add-to-cart-detail-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', handleAddToCartDetail);
    }
}

// Configura el botón "Comprar ahora" en la página de detalles del producto
function setupBuyNowButton() {
    const buyNowButton = document.getElementById('buy-now-detail-button');
    if (buyNowButton) {
        buyNowButton.addEventListener('click', handleBuyNow);
    }
}

// Maneja el evento de clic en el botón "Agregar al Carrito" de la página de detalles
async function handleAddToCartDetail(event) {
    const productId = new URLSearchParams(window.location.search).get('id');
    const productName = document.getElementById('product-detail-title')?.textContent.trim();
    const productPriceText = document.getElementById('product-discounted-price')?.textContent.replace('$', '').replace(',', '.').trim();
    const productPrice = parseFloat(productPriceText);
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput ? quantityInput.value : '1', 10);

    if (!productId || !productName || isNaN(productPrice) || productPrice <= 0 || isNaN(quantity) || quantity < 1) {
        alert('No se pudo añadir el producto al carrito. Faltan datos o son inválidos.');
        return;
    }

    try {
        const response = await fetch('api/add_to_cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                product_name: productName,
                product_price: productPrice,
                quantity: quantity
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de red o servidor: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            // alert(`${productName} (x${quantity}) ha sido añadido al carrito.`); // Considera usar un modal personalizado
            console.log(`${productName} (x${quantity}) ha sido añadido al carrito.`);
            // Asumiendo que updateCartCount está en main.js y main.js se carga después de vistaproducto.js
            if (typeof updateCartCount === 'function') {
                updateCartCount(); // Actualiza el contador global del carrito
            }
        } else {
            // alert(`Error al añadir ${productName} al carrito: ${result.message}`); // Considera usar un modal personalizado
            console.error(`Error al añadir ${productName} al carrito: ${result.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud AJAX:', error);
        // alert('Hubo un problema al añadir el producto al carrito. Por favor, inténtalo de nuevo.'); // Considera usar un modal personalizado
    }
}

// Maneja el evento de clic en el botón "Comprar ahora" de la página de detalles
async function handleBuyNow() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const productName = document.getElementById('product-detail-title')?.textContent.trim();
    const productPriceText = document.getElementById('product-discounted-price')?.textContent.replace('$', '').replace(',', '.').trim();
    const productPrice = parseFloat(productPriceText);
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput ? quantityInput.value : '1', 10);

    if (!productId || !productName || isNaN(productPrice) || productPrice <= 0 || isNaN(quantity) || quantity < 1) {
        alert('No se pudo procesar la compra. Faltan datos o son inválidos.');
        return;
    }

    try {
        // Primero, añade el producto al carrito (si tu flujo de compra lo requiere)
        // O podrías tener un endpoint de "compra directa" si no pasa por el carrito
        const response = await fetch('api/add_to_cart.php', { // Reutilizamos add_to_cart.php
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                product_name: productName,
                product_price: productPrice,
                quantity: quantity
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de red o servidor al añadir al carrito para compra directa: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`${productName} (x${quantity}) añadido al carrito para compra directa.`);
            // Actualiza el contador del carrito si es necesario
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            // Redirige a la página de pago después de añadir al carrito
            window.location.href = 'pago.html';
        } else {
            alert(`Error al preparar la compra: ${result.message}`);
            console.error(`Error al preparar la compra: ${result.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud AJAX para "Comprar ahora":', error);
        alert('Hubo un problema al procesar la compra. Por favor, inténtalo de nuevo.');
    }
}


// --- Inicialización al cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails(); // Llama a la función para cargar los detalles
    setupSearchBar();
    setupAddToCartDetailButton();
    setupBuyNowButton(); // Configura el botón "Comprar ahora"
});