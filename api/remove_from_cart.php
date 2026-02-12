<?php
session_start(); // Siempre al inicio
require_once '../server.php'; // Incluye la conexión a la DB

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$productId = $input['product_id'] ?? null;

// --- Lógica para determinar la identidad del carrito ---
$userId = $_SESSION['user_id'] ?? null; // Si el usuario está logeado, usa su ID
$sessionId = session_id(); // Siempre obtenemos el ID de sesión

// Validar entrada
if (!$productId || !is_numeric($productId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado o inválido.']);
    close_db_connection($mysqli);
    exit();
}

$productId = (int)$productId;

try {
    // Determinar qué identificador usar para la consulta
    $identifierColumn = $userId ? 'user_id' : 'session_id';
    $identifierValue = $userId ?? $sessionId;
    $identifierType = $userId ? 'i' : 's'; // 'i' para int, 's' para string

    $stmt = $mysqli->prepare("DELETE FROM carrito_items WHERE {$identifierColumn} = ? AND product_id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar eliminación: " . $mysqli->error);
    }
    $stmt->bind_param("{$identifierType}i", $identifierValue, $productId);
    $stmt->execute();
    $stmt->close();

    if ($mysqli->affected_rows > 0) {
        $message = 'Producto eliminado del carrito.';
        // Obtener el conteo actual del carrito después de la operación
        $stmt = $mysqli->prepare("SELECT SUM(quantity) as total_items FROM carrito_items WHERE {$identifierColumn} = ?");
        if (!$stmt) {
            throw new Exception("Error al preparar conteo: " . $mysqli->error);
        }
        $stmt->bind_param("{$identifierType}", $identifierValue);
        $stmt->execute();
        $result = $stmt->get_result();
        $cartCountRow = $result->fetch_assoc();
        $currentCartCount = $cartCountRow['total_items'] ?? 0;
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => $message,
            'cartCount' => $currentCartCount
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Producto no encontrado en el carrito para eliminar.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en remove_from_cart.php: " . $e->getMessage()); // Log del error para depuración
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>