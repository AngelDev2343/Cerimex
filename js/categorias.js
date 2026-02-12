document.addEventListener('DOMContentLoaded', () => {
    loadProductsByCategory('all'); // Carga todos los productos al inicio
    setupCategoryFilters();        // Configura los botones de categoría
    setupSearchBar();              // Configura la barra de búsqueda
});

// Configura los event listeners para la barra de búsqueda
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const searchButton = document.querySelector('.search-bar button[type="submit"]');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            const activeCategoryButton = document.querySelector('.category-button.active');
            const currentCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'all';
            loadProductsByCategory(currentCategory, searchTerm); // Recarga con categoría y búsqueda
        });

        // Permite buscar al presionar Enter en el campo de texto
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                const activeCategoryButton = document.querySelector('.category-button.active');
                const currentCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'all';
                loadProductsByCategory(currentCategory, searchTerm);
            }
        });
    }
}

// Configura los event listeners para los botones de categoría
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Eliminar clase 'active' de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase 'active' al botón clickeado
            button.classList.add('active');

            const category = button.dataset.category;
            const searchInput = document.querySelector('.search-bar input[type="text"]');
            const searchTerm = searchInput ? searchInput.value.trim() : ''; // Obtener término de búsqueda actual
            loadProductsByCategory(category, searchTerm); // Carga productos de la categoría seleccionada
        });
    });

    // Activar el botón "Todos" al inicio
    const allButton = document.querySelector('.category-button[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active');
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

// Actualiza el contador visual del carrito en la barra de navegación (copiado de main.js/productos.js)
function updateCartCount() {
    const cartLink = document.querySelector('.nav-links a[href="carrito.html"]');
    if (cartLink) {
        let currentCount = parseInt(cartLink.textContent.match(/\((\d+)\)/)?.[1] || '0', 10);
        currentCount++;
        cartLink.textContent = `Carrito (${currentCount})`;
    }
}

// Carga y muestra los productos según la categoría y el término de búsqueda
async function loadProductsByCategory(category = 'all', searchTerm = '') {
    const productGrid = document.getElementById('category-product-grid');
    const productsHeading = document.getElementById('category-products-heading');
    if (!productGrid || !productsHeading) return;

    try {
        let url = `api/get_products_by_category.php?category=${encodeURIComponent(category)}`;
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`; // Añade el término de búsqueda
        }

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al cargar productos: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            productGrid.innerHTML = ''; // Limpia el contenedor

            // Actualiza el título
            if (searchTerm && category !== 'all') {
                productsHeading.textContent = `Resultados para "${searchTerm}" en "${category}"`;
            } else if (searchTerm) {
                productsHeading.textContent = `Resultados de la búsqueda para "${searchTerm}"`;
            } else if (category !== 'all') {
                productsHeading.textContent = `Productos en la categoría: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
            } else {
                productsHeading.textContent = 'Todos los Productos';
            }


            if (data.products.length === 0) {
                let message = 'No se encontraron productos';
                if (searchTerm && category !== 'all') {
                    message += ` para "${searchTerm}" en la categoría "${category}".`;
                } else if (searchTerm) {
                    message += ` para "${searchTerm}".`;
                } else if (category !== 'all') {
                    message += ` en la categoría "${category}".`;
                } else {
                    message += ' disponibles en este momento.';
                }
                productGrid.innerHTML = `<p>${message}</p>`;
            } else {
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.dataset.productId = product.id;
                    productCard.dataset.category = product.category; // Asegurarse de que tenga la categoría

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
        console.error('Error al obtener productos:', error);
        productGrid.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
    }
}