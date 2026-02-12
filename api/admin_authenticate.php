<?php
session_start(); // Iniciar sesión para almacenar el estado del administrador
require_once '../server.php'; // Tu archivo de conexión a la base de datos

header('Content-Type: application/json');

// Solo permitir solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// --- VALIDACIÓN DE CREDENCIALES (PARA SIMPLIFICAR) ---
// En un entorno real, esto debería validar contra una base de datos
// y usar contraseñas hash (e.g., password_verify()).
$validUsername = 'admin'; // Nombre de usuario de administrador
$validPassword = 'angel2332'; // Contraseña del administrador

if ($username === $validUsername && $password === $validPassword) {
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso.']);
} else {
    // Si la autenticación falla, limpia cualquier sesión existente
    if (isset($_SESSION['admin_logged_in'])) {
        unset($_SESSION['admin_logged_in']);
        unset($_SESSION['admin_username']);
    }
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'Credenciales inválidas.']);
}

// No es necesario cerrar la conexión aquí si server.php ya la gestiona globalmente
// close_db_connection($mysqli); // Si usas la función de cierre en server.php
exit();
?>