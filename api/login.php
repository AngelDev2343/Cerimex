<?php
session_start(); // Iniciar sesión para almacenar los datos del usuario
require_once '../server.php'; // Incluye la conexión a la DB

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validar entradas
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Correo y contraseña son obligatorios.']);
    close_db_connection($mysqli);
    exit();
}

try {
    // Buscar usuario por email
    $stmt = $mysqli->prepare("SELECT id, nombre, email, contrasena FROM usuarios WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de login: " . $mysqli->error);
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && password_verify($password, $user['contrasena'])) {
        // Contraseña correcta, iniciar sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nombre'];
        $_SESSION['user_email'] = $user['email'];

        // Opcional: Actualizar la última_sesion en la DB
        $stmt = $mysqli->prepare("UPDATE usuarios SET ultima_sesion = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->bind_param("i", $user['id']);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso.']);
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en login.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor al iniciar sesión: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>