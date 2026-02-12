document.addEventListener('DOMContentLoaded', async () => {
    const accountPageTitle = document.getElementById('account-page-title');
    const notLoggedInContent = document.getElementById('not-logged-in-content');
    const loggedInContent = document.getElementById('logged-in-content');
    const logoutButtonContainer = document.getElementById('logout-button-container');
    const logoutButton = document.getElementById('logout-button');

    // Función para verificar el estado de la sesión
    async function checkLoginStatus() {
        try {
            const response = await fetch('api/check_login_status.php'); // RUTA A api/
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error de red al verificar estado de login:', error);
            // En caso de error de red, asume que no está logueado
            return { isLoggedIn: false, userName: 'Invitado' };
        }
    }

    // Función para actualizar la UI según el estado de la sesión
    async function updateUI() { // DEFINICIÓN DE LA FUNCIÓN
        const status = await checkLoginStatus();

        if (status.isLoggedIn) {
            accountPageTitle.textContent = `Mi Cuenta (${status.userName})`;
            notLoggedInContent.style.display = 'none';
            loggedInContent.style.display = 'flex'; // Asegura display: flex
            loggedInContent.style.flexWrap = 'wrap';
            loggedInContent.style.gap = '20px';
            loggedInContent.style.justifyContent = 'center';
            logoutButtonContainer.style.display = 'block';
        } else {
            accountPageTitle.textContent = 'Mi Cuenta';
            notLoggedInContent.style.display = 'block';
            loggedInContent.style.display = 'none';
            logoutButtonContainer.style.display = 'none';
        }
    }

    // Event listener para el botón de cerrar sesión
    logoutButton.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres cerrar tu sesión?')) {
            try {
                const response = await fetch('api/logout.php', { // RUTA A api/
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    window.location.href = 'sesion.html';
                } else {
                    alert('Error al cerrar sesión: ' + data.message);
                    console.error('Error al cerrar sesión:', data.message);
                }
            } catch (error) {
                console.error('Error de red al cerrar sesión:', error);
                alert('Error de conexión al servidor al cerrar la sesión.');
            }
        }
    });

    // Llama a la función para actualizar la UI cuando la página se carga
    updateUI(); // LLAMADA A LA FUNCIÓN (esto es la línea 51 en el código original)
});