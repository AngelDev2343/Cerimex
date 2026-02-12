document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    // Función para mostrar mensajes
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`; // Add 'success' or 'error' class
        element.style.display = 'block';
    }

    // Manejador para el formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            loginMessage.style.display = 'none'; // Ocultar mensaje anterior

            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage(loginMessage, data.message, 'success');
                    // Redirigir al usuario o actualizar la UI (ej. a mi-cuenta.html o index.html)
                    window.location.href = 'index.html'; // O la página que desees
                } else {
                    showMessage(loginMessage, data.message, 'error');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                showMessage(loginMessage, 'Error de conexión. Inténtalo de nuevo más tarde.', 'error');
            }
        });
    }

    // Manejador para el formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            registerMessage.style.display = 'none'; // Ocultar mensaje anterior

            try {
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage(registerMessage, data.message, 'success');
                    // Opcional: limpiar el formulario de registro
                    registerForm.reset();
                } else {
                    showMessage(registerMessage, data.message, 'error');
                }
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                showMessage(registerMessage, 'Error de conexión. Inténtalo de nuevo más tarde.', 'error');
            }
        });
    }
});