<?php
session_start();
require_once '../server.php'; // Ajusta la ruta si server.php no está en la raíz

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit();
}

try {
    // Asume que tienes una tabla `direcciones` con columnas como `user_id`, `es_predeterminada`, y campos de dirección.
    // Ajusta los nombres de las columnas según tu base de datos.
    $stmt = $mysqli->prepare("SELECT * FROM direcciones_envio WHERE user_id = ? AND es_predeterminada = 1 LIMIT 1");
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de dirección: " . $mysqli->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $address = $result->fetch_assoc();
    $stmt->close();

    if ($address) {
        echo json_encode(['success' => true, 'address' => $address]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró una dirección predeterminada.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en get_default_address.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
} finally {
    close_db_connection($mysqli);
}
?>