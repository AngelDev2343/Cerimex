document.addEventListener('DOMContentLoaded', async () => {
    const orderHistoryContainer = document.getElementById('order-history-container');

    /**
     * @function fetchOrders
     * @description Obtiene el historial de pedidos del usuario desde el servidor.
     */
    async function fetchOrders() {
        try {
            const response = await fetch('api/get_orders.php');
            const data = await response.json();

            if (data.success && data.orders.length > 0) {
                renderOrders(data.orders);
            } else {
                orderHistoryContainer.innerHTML = '<p>No tienes pedidos en tu historial.</p>';
                console.warn('No se encontraron pedidos o error al cargar:', data.message);
                // Si el error es por no autorizado (401), redirigir al login
                if (response.status === 401) {
                    window.location.href = 'login.html'; // Redirigir a la página de login
                }
            }
        } catch (error) {
            console.error('Error de red al obtener los pedidos:', error);
            orderHistoryContainer.innerHTML = '<p>Error al cargar el historial de pedidos.</p>';
        }
    }

    /**
     * @function renderOrders
     * @description Renderiza la lista de pedidos en la página.
     * @param {Array} orders - Un array de objetos de pedido.
     */
    function renderOrders(orders) {
        orderHistoryContainer.innerHTML = ''; // Limpiar el contenido existente

        orders.forEach(order => {
            const orderItemDiv = document.createElement('div');
            orderItemDiv.classList.add('order-item');
            orderItemDiv.innerHTML = `
                <h5>Pedido #${order.id}</h5>
                <p>Fecha del pedido: ${new Date(order.fecha_pedido).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>Estado: <strong>${order.estado}</strong></p>
                <p>Total: <strong>$${parseFloat(order.total).toFixed(2)}</strong></p>
                <div class="order-products-summary">
                    <h6>Productos:</h6>
                    ${order.items.map(item => `
                        <div class="summary-product-item">
                            <img src="${item.imagen_url || 'https://placehold.co/50x50/cccccc/333333?text=Prod'}" alt="${item.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/50x50/cccccc/333333?text=No+Imagen';">
                            <span>${item.nombre} (x${item.cantidad}) - $${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <br>
                <button class="track-button" data-order-id="${order.id}">Rastrear paquete</button>
                ${order.estado === 'Entregado' ? `<button class="return-button" data-order-id="${order.id}">Devolver pedido</button>` : ''}
                <button class="buy-again-button" data-order-id="${order.id}">Comprar de nuevo</button>
            `;
            orderHistoryContainer.appendChild(orderItemDiv);
        });

        // Añadir event listeners a los botones de acción
        orderHistoryContainer.querySelectorAll('.track-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                console.log(`Rastrear paquete para Pedido #${orderId}`);
                // Aquí podrías redirigir a una página de rastreo o mostrar un modal
                alert(`Rastreando pedido #${orderId}. Funcionalidad no implementada.`);
            });
        });

        orderHistoryContainer.querySelectorAll('.return-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                console.log(`Devolver pedido para Pedido #${orderId}`);
                // Aquí podrías iniciar un proceso de devolución
                alert(`Iniciando devolución para pedido #${orderId}. Funcionalidad no implementada.`);
            });
        });

        orderHistoryContainer.querySelectorAll('.buy-again-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                console.log(`Comprar de nuevo para Pedido #${orderId}`);
                // Aquí podrías añadir los productos de este pedido al carrito
                alert(`Añadiendo productos del pedido #${orderId} al carrito. Funcionalidad no implementada.`);
            });
        });
    }

    // --- Inicialización ---
    fetchOrders();
});