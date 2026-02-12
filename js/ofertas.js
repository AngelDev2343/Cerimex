document.addEventListener('DOMContentLoaded', () => {
    loadOfferProducts(); // Carga los productos en oferta al inicio
    setupSearchBar(); // Configura la barra de búsqueda para esta página también
});

// Configura los event listeners para la barra de búsqueda
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const searchButton = document.querySelector('.search-bar button[type="submit"]');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            loadOfferProducts(searchTerm); // Recarga con el término de búsqueda
        });

        // Permite buscar al presionar Enter en el campo de texto
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                loadOfferProducts(searchTerm);
            }
        });
    }
}

// Configura los event listeners para los botones "Añadir al Carrito"
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.removeEventListener('click', handleAddToCart); // Evita duplicados
        button.addEventListener('click', handleAddToCart);
    });
}

// Maneja la lógica para añadir un producto al carrito (copiado de main.js/productos.js)
async function handleAddToCart(event) {
    const productCard = event.target.closest('.product-card');
    if (!productCard) {
        alert('Error: No se pudo identificar el producto.');
        return;
    }

    const productId = productCard.dataset.productId;
    const productName = productCard.querySelector('h3')?.textContent.trim();
    const productPriceText = productCard.querySelector('.discounted-price')?.textContent.replace('$', '').replace(',', '.').trim(); // Obtener el precio de oferta
    const productPrice = parseFloat(productPriceText);
    const quantity = 1;

    if (!productId || !productName || isNaN(productPrice) || productPrice <= 0) {
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
            alert(`${productName} ha sido añadido al carrito.`);
            updateCartCount();
        } else {
            alert(`Error al añadir ${productName} al carrito: ${result.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud AJAX:', error);
        alert('Hubo un problema al añadir el producto al carrito. Por favor, inténtalo de nuevo.');
    }
}

// Actualiza el contador visual del carrito en la barra de navegación (copiado de main.js/productos.js)
function updateCartCount() {
    const cartLink = document.querySelector('.nav-links a[href="carrito.html"]');
    if (cartLink) {
        let currentCount = parseInt(cartLink.textContent.match(/\((\d+)\)/)?.[1] || '0', 10);
        currentCount++;
        cartLink.textContent = `Carrito (${currentCount})`;
    }
}

// Función para cargar y mostrar los productos en oferta
async function loadOfferProducts(searchTerm = '') {
    const productGrid = document.getElementById('offer-product-grid');
    if (!productGrid) return;

    try {
        let url = `api/get_offer_products.php`;
        if (searchTerm) {
            // Si la búsqueda también debe filtrar ofertas, el PHP de ofertas necesitaría un parámetro 'search'
            // Por ahora, si hay search term, no se usa en este PHP, pero se puede añadir
            // url += `?search=${encodeURIComponent(searchTerm)}`;
            // Para fines de esta página de ofertas, asumimos que no hay búsqueda de momento.
            // Si quieres búsqueda dentro de ofertas, modifica get_offer_products.php para que acepte un parámetro 'search'
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar ofertas: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            productGrid.innerHTML = ''; // Limpia el contenedor

            if (data.products.length === 0) {
                productGrid.innerHTML = '<p>No se encontraron productos en oferta en este momento.</p>';
            } else {
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.dataset.productId = product.id; // Asignar el ID del producto

                    let originalPriceHTML = '';
                    if (product.original_price && product.original_price !== product.price) {
                        originalPriceHTML = `<span class="offer-price">$${product.original_price.toFixed(2)}</span>`;
                    }

                    productCard.innerHTML = `
                        <img src="${product.image_url || 'https://placehold.co/200x200/cccccc/333333?text=No+Imagen'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>
                            ${originalPriceHTML}
                            <span class="discounted-price">$${product.price.toFixed(2)}</span>
                        </p>
                        <a href="vistaproducto.html?id=${encodeURIComponent(product.id)}"><button class="comprar">Comprar ahora</button></a>
                        <button class="add-to-cart">Añadir al Carrito</button>
                        ${product.discount_badge ? `<div class="discount-badge">${product.discount_badge}</div>` : ''}
                    `;
                    productGrid.appendChild(productCard);
                });
            }
            setupAddToCartButtons(); // Vuelve a adjuntar eventos a los nuevos botones
        } else {
            console.error('Error al cargar ofertas:', data.message || 'Formato de respuesta inválido.');
            productGrid.innerHTML = '<p>No se pudieron cargar las ofertas en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al obtener productos en oferta:', error);
        productGrid.innerHTML = '<p>Error al cargar las ofertas. Inténtalo de nuevo más tarde.</p>';
    }
}