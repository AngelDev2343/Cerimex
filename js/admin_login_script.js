document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('api/admin_authenticate.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Inicio de sesión exitoso!');
                    window.location.href = 'S5PoZ4N5^.html'; // Redirige al panel principal
                } else {
                    alert('Error de inicio de sesión: ' + data.message);
                }
            } catch (error) {
                console.error('Error de red durante el inicio de sesión:', error);
                alert('Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.');
            }
        });
    }
});
