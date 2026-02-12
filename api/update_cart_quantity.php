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
$newQuantity = $input['quantity'] ?? null;

// --- Lógica para determinar la identidad del carrito ---
$userId = $_SESSION['user_id'] ?? null; // Si el usuario está logeado, usa su ID
$sessionId = session_id(); // Siempre obtenemos el ID de sesión

// Validar entrada
if (!$productId || !is_numeric($productId) || !is_numeric($newQuantity) || $newQuantity < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de producto o cantidad inválidos.']);
    close_db_connection($mysqli);
    exit();
}

$productId = (int)$productId;
$newQuantity = (int)$newQuantity;

try {
    // Determinar qué identificador usar para la consulta
    $identifierColumn = $userId ? 'user_id' : 'session_id';
    $identifierValue = $userId ?? $sessionId;
    $identifierType = $userId ? 'i' : 's'; // 'i' para int, 's' para string

    if ($newQuantity === 0) {
        // Si la nueva cantidad es 0, elimina el producto del carrito
        $stmt = $mysqli->prepare("DELETE FROM carrito_items WHERE {$identifierColumn} = ? AND product_id = ?");
        if (!$stmt) {
            throw new Exception("Error al preparar eliminación: " . $mysqli->error);
        }
        $stmt->bind_param("{$identifierType}i", $identifierValue, $productId);
        $stmt->execute();
        $stmt->close();
        $message = 'Producto eliminado del carrito.';
    } else {
        // Actualiza la cantidad
        $stmt = $mysqli->prepare("UPDATE carrito_items SET quantity = ? WHERE {$identifierColumn} = ? AND product_id = ?");
        if (!$stmt) {
            throw new Exception("Error al preparar actualización: " . $mysqli->error);
        }
        $stmt->bind_param("i{$identifierType}i", $newQuantity, $identifierValue, $productId);
        $stmt->execute();
        $stmt->close();
        
        if ($mysqli->affected_rows === 0) {
            // Si no se actualizó, podría ser que el producto no estaba en el carrito
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado en el carrito para actualizar.']);
            close_db_connection($mysqli);
            exit();
        }
        $message = 'Cantidad actualizada.';
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
    error_log("Error en update_cart_quantity.php: " . $e->getMessage()); // Log del error para depuración
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>