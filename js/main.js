document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts(); // Carga productos al inicio
    setupSearchBar();       // Configura la barra de búsqueda
});

// Configura los event listeners para la barra de búsqueda
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const searchButton = document.querySelector('.search-bar button[type="submit"]');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            loadFeaturedProducts(searchTerm); // Recarga los productos con el término de búsqueda
        });

        // Permite buscar al presionar Enter en el campo de texto
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                loadFeaturedProducts(searchTerm);
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

// Maneja la lógica para añadir un producto al carrito
async function handleAddToCart(event) {
    const productCard = event.target.closest('.product-card');
    if (!productCard) {
        alert('Error: No se pudo identificar el producto.');
        return;
    }

    const productId = productCard.dataset.productId;
    const productName = productCard.querySelector('h3')?.textContent.trim();
    const productPriceText = productCard.querySelector('.price')?.textContent.replace('$', '').replace(',', '.').trim();
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

// Actualiza el contador visual del carrito en la barra de navegación
function updateCartCount() {
    const cartLink = document.querySelector('.nav-links a[href="carrito.html"]');
    if (cartLink) {
        let currentCount = parseInt(cartLink.textContent.match(/\((\d+)\)/)?.[1] || '0', 10);
        currentCount++;
        cartLink.textContent = `Carrito (${currentCount})`;
    }
}

// Carga y muestra los productos destacados, con opción de búsqueda
async function loadFeaturedProducts(searchTerm = '') {
    const productGrid = document.getElementById('featured-product-grid');
    const productsHeading = document.getElementById('products-heading'); // Obtener el encabezado
    if (!productGrid || !productsHeading) return;

    try {
        let url = 'api/get_products.php';
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`; // Añade el término de búsqueda a la URL
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar productos: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            productGrid.innerHTML = ''; // Limpia el contenedor
            if (searchTerm) {
                productsHeading.textContent = `Resultados de la búsqueda para "${searchTerm}"`;
            } else {
                productsHeading.textContent = 'Productos Destacados';
            }

            if (data.products.length === 0 && searchTerm) {
                productGrid.innerHTML = `<p>No se encontraron productos para "${searchTerm}".</p>`;
            } else if (data.products.length === 0) {
                productGrid.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
            } else {
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.dataset.productId = product.id;

                    productCard.innerHTML = `
                        <img src="${product.image_url || 'https://placehold.co/200x200/cccccc/333333?text=No+Imagen'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <a href="vistaproducto.html?id=${encodeURIComponent(product.id)}"><button class="comprar">Comprar ahora</button></a>
                        <button class="add-to-cart">Añadir al Carrito</button>
                    `;
                    productGrid.appendChild(productCard);
                });
            }
            setupAddToCartButtons(); // Vuelve a adjuntar eventos a los nuevos botones
        } else {
            console.error('Error al cargar productos:', data.message || 'Formato de respuesta inválido.');
            productGrid.innerHTML = '<p>No se pudieron cargar los productos en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        productGrid.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
    }
}