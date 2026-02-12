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
$quantity = $input['quantity'] ?? 1;

// --- Lógica para determinar la identidad del carrito ---
// Si el usuario está logeado, $_SESSION['user_id'] debería estar establecido (lo harás en tu script de login).
$userId = $_SESSION['user_id'] ?? null;
$sessionId = session_id(); // Siempre obtenemos el ID de sesión

// Validar entrada
if (!$productId || !is_numeric($productId) || !is_numeric($quantity) || $quantity < 1) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos de producto o cantidad inválidos.']);
    close_db_connection($mysqli); // Cierra la conexión si hay un error temprano
    exit();
}

$productId = (int)$productId;
$quantity = (int)$quantity;

try {
    // Determinar qué identificador usar para la consulta (prioridad a user_id si está logeado)
    $identifierColumn = $userId ? 'user_id' : 'session_id';
    $identifierValue = $userId ?? $sessionId;
    $identifierType = $userId ? 'i' : 's'; // 'i' para int (integer), 's' para string

    // 1. Verificar si el producto ya existe en el carrito para este usuario/sesión
    $stmt = $mysqli->prepare("SELECT quantity FROM carrito_items WHERE {$identifierColumn} = ? AND product_id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar verificación: " . $mysqli->error);
    }
    $stmt->bind_param("{$identifierType}i", $identifierValue, $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingItem = $result->fetch_assoc();
    $stmt->close();

    if ($existingItem) {
        // Si existe, actualizar la cantidad
        $newQuantity = $existingItem['quantity'] + $quantity;
        $stmt = $mysqli->prepare("UPDATE carrito_items SET quantity = ? WHERE {$identifierColumn} = ? AND product_id = ?");
        if (!$stmt) {
            throw new Exception("Error al preparar actualización: " . $mysqli->error);
        }
        $stmt->bind_param("i{$identifierType}i", $newQuantity, $identifierValue, $productId);
        $stmt->execute();
        $stmt->close();
        $message = 'Cantidad del producto actualizada en el carrito.';
    } else {
        // Si no existe, insertar un nuevo ítem en el carrito
        // Insertamos user_id o session_id, el otro será NULL
        $stmt = $mysqli->prepare("INSERT INTO carrito_items (user_id, session_id, product_id, quantity) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Error al preparar inserción: " . $mysqli->error);
        }
        if ($userId) {
            $nullSessionId = NULL; // Usar NULL explícitamente para el bind
            $stmt->bind_param("isii", $userId, $nullSessionId, $productId, $quantity);
        } else {
            $nullUserId = NULL; // Usar NULL explícitamente para el bind
            $stmt->bind_param("isii", $nullUserId, $sessionId, $productId, $quantity);
        }
        $stmt->execute();
        $stmt->close();
        $message = 'Producto añadido al carrito.';
    }

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

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en add_to_cart.php: " . $e->getMessage()); // Log del error para depuración
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>