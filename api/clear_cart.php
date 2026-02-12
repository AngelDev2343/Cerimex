<?php
session_start(); // Siempre al inicio
require_once '../server.php'; // Incluye la conexión a la DB

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// --- Lógica para determinar la identidad del carrito ---
$userId = $_SESSION['user_id'] ?? null; // Si el usuario está logeado, usa su ID
$sessionId = session_id(); // Siempre obtenemos el ID de sesión

try {
    // Determinar qué identificador usar para la consulta
    $identifierColumn = $userId ? 'user_id' : 'session_id';
    $identifierValue = $userId ?? $sessionId;
    $identifierType = $userId ? 'i' : 's'; // 'i' para int, 's' para string

    $stmt = $mysqli->prepare("DELETE FROM carrito_items WHERE {$identifierColumn} = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar vaciado de carrito: " . $mysqli->error);
    }
    $stmt->bind_param("{$identifierType}", $identifierValue);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Carrito vaciado exitosamente.',
        'cartCount' => 0
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en clear_cart.php: " . $e->getMessage()); // Log del error para depuración
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>