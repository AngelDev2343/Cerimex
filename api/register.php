<?php
session_start(); // Iniciar sesión para futuros usos (ej. login automático después de registro)
require_once '../server.php'; // Incluye la conexión a la DB

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validar entradas
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    close_db_connection($mysqli);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Formato de correo electrónico inválido.']);
    close_db_connection($mysqli);
    exit();
}

if (strlen($password) < 6) { // Requisito mínimo de longitud para la contraseña
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres.']);
    close_db_connection($mysqli);
    exit();
}

try {
    // Verificar si el email ya existe
    $stmt = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar verificación de email: " . $mysqli->error);
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
        $stmt->close();
        close_db_connection($mysqli);
        exit();
    }
    $stmt->close();

    // Hash de la contraseña antes de guardarla
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insertar nuevo usuario
    $stmt = $mysqli->prepare("INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Error al preparar registro: " . $mysqli->error);
    }
    $stmt->bind_param("sss", $name, $email, $hashedPassword);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registro exitoso. Ahora puedes iniciar sesión.']);
    } else {
        throw new Exception("Error al ejecutar registro: " . $stmt->error);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en register.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor al registrar: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>