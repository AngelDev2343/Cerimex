document.addEventListener('DOMContentLoaded', async () => {
    const adminNameSpan = document.getElementById('admin-name');
    const sidebarTableList = document.getElementById('sidebar-table-list');
    const totalTablesSpan = document.getElementById('total-tables');
    const totalUsersSpan = document.getElementById('total-users');
    const usersTableBody = document.getElementById('users-table-body');
    const logoutButton = document.getElementById('admin-logout-button');

    // Función para verificar la sesión del administrador
    async function checkAdminSession() {
        try {
            const response = await fetch('api/check_admin_session.php'); // Crearemos este archivo
            const data = await response.json();
            if (!data.logged_in) {
                alert('No autorizado. Por favor, inicia sesión como administrador.');
                window.location.href = 'admin.html'; // Redirige a la página de login
            } else {
                if (adminNameSpan) adminNameSpan.textContent = data.username;
            }
        } catch (error) {
            console.error('Error al verificar sesión del administrador:', error);
            alert('Error de conexión al verificar la sesión. Por favor, inténtalo de nuevo.');
            window.location.href = 'admin.html';
        }
    }

    // Función para cargar los metadatos de la base de datos (tablas, etc.)
    async function fetchDbMetaData() {
        try {
            const response = await fetch('api/db_meta_data.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                // Actualizar total de tablas
                if (totalTablesSpan) totalTablesSpan.textContent = data.tables.length;

                // Llenar la lista de tablas en la barra lateral
                if (sidebarTableList) {
                    // Limpiar elementos existentes, excepto los estáticos
                    const staticItems = Array.from(sidebarTableList.children).filter(item =>
                        item.textContent.includes('Vista General') ||
                        item.textContent.includes('Configuración') ||
                        item.textContent.includes('Cerrar Sesión')
                    );
                    sidebarTableList.innerHTML = ''; // Limpiar todo
                    staticItems.forEach(item => sidebarTableList.appendChild(item)); // Añadir de nuevo los estáticos

                    data.tables.forEach(table => {
                        const li = document.createElement('li');
                        // Enlazar a la página genérica de gestión de tablas
                        li.innerHTML = `<a href="023B3!a29dt.html?table=${encodeURIComponent(table)}">${table}</a>`;
                        // Insertar antes del botón de cerrar sesión
                        const logoutLi = document.getElementById('admin-logout-button')?.parentElement;
                        if (logoutLi) {
                            sidebarTableList.insertBefore(li, logoutLi);
                        } else {
                            sidebarTableList.appendChild(li); // Fallback si no encuentra el botón de logout
                        }
                    });
                }

            } else {
                console.error('Error al cargar metadatos de la DB:', data.message);
                if (totalTablesSpan) totalTablesSpan.textContent = 'Error';
            }
        } catch (error) {
            console.error('Error de red al cargar metadatos de la DB:', error);
            if (totalTablesSpan) totalTablesSpan.textContent = 'Error';
        }
    }

    // Función para cargar datos de la tabla 'usuarios'
    async function fetchUsersPreview() {
        try {
            const response = await fetch('api/fetch_table_data.php?table=usuarios&limit=5'); // Limitar a 5 para la previsualización
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                if (totalUsersSpan) totalUsersSpan.textContent = data.total_rows; // Si el PHP devuelve el total

                if (usersTableBody) {
                    usersTableBody.innerHTML = ''; // Limpiar cualquier mensaje de "Cargando..."
                    if (data.data.length > 0) {
                        data.data.forEach(user => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${user.id || 'N/A'}</td>
                                <td>${user.nombre || 'N/A'}</td>
                                <td>${user.email || 'N/A'}</td>
                                <td>${user.fecha_registro || 'N/A'}</td>
                                <td>
                                    <a href="023B3!a29dt.html?table=usuarios&id=${user.id}&action=edit" class="button">Editar</a>
                                    <button class="button secondary delete-row-button" data-table="usuarios" data-id="${user.id}">Eliminar</button>
                                </td>
                            `;
                            usersTableBody.appendChild(row);
                        });
                    } else {
                        usersTableBody.innerHTML = '<tr><td colspan="5">No hay usuarios registrados.</td></tr>';
                    }
                }
            } else {
                console.error('Error al cargar datos de usuarios:', data.message);
                if (totalUsersSpan) totalUsersSpan.textContent = 'Error';
                if (usersTableBody) usersTableBody.innerHTML = '<tr><td colspan="5">Error al cargar usuarios.</td></tr>';
            }
        } catch (error) {
            console.error('Error de red al cargar datos de usuarios:', error);
            if (totalUsersSpan) totalUsersSpan.textContent = 'Error';
            if (usersTableBody) usersTableBody.innerHTML = '<tr><td colspan="5">Error de conexión al cargar usuarios.</td></tr>';
        }
    }

    // Manejar el clic en el botón de cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Evitar la redirección por defecto
            try {
                const response = await fetch('api/admin_logout.php'); // Crearemos este archivo
                const data = await response.json();
                if (data.success) {
                    alert('Sesión cerrada correctamente.');
                    window.location.href = 'admin.html';
                } else {
                    alert('Error al cerrar sesión: ' + data.message);
                }
            } catch (error) {
                console.error('Error de red al cerrar sesión:', error);
                alert('Error de conexión al cerrar sesión.');
            }
        });
    }

    // --- Inicialización ---
    checkAdminSession(); // Primero, verificar si el admin está logeado
    fetchDbMetaData();    // Luego, cargar metadatos de la DB
    fetchUsersPreview();  // Y finalmente, la previsualización de usuarios
});