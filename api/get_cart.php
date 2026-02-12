<?php
session_start(); // Siempre al inicio
require_once '../server.php'; // Incluye la conexión a la DB

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// --- Lógica para determinar la identidad del carrito ---
$userId = $_SESSION['user_id'] ?? null; // Si el usuario está logeado, usa su ID
$sessionId = session_id(); // Siempre obtenemos el ID de sesión

$cartItems = [];
$cartCount = 0;

try {
    // Determinar qué identificador usar para la consulta
    $identifierColumn = $userId ? 'user_id' : 'session_id';
    $identifierValue = $userId ?? $sessionId;
    $identifierType = $userId ? 'i' : 's'; // 'i' para int, 's' para string

    // Seleccionar ítems del carrito y detalles de productos
    $stmt = $mysqli->prepare("
        SELECT
            ci.product_id,
            ci.quantity,
            p.Nom_Prod AS name,
            p.Precio_Prod AS price,
            p.image_url
        FROM
            carrito_items ci
        JOIN
            productos p ON ci.product_id = p.Id_Prod
        WHERE
            ci.{$identifierColumn} = ?
    ");
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de carrito: " . $mysqli->error);
    }
    $stmt->bind_param("{$identifierType}", $identifierValue);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $cartItems[] = [
            'id' => $row['product_id'],
            'name' => $row['name'],
            'price' => (float)$row['price'],
            'quantity' => (int)$row['quantity'],
            'image_url' => $row['image_url']
        ];
        $cartCount += (int)$row['quantity']; // Suma la cantidad de cada producto para el total
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'cartItems' => $cartItems,
        'cartCount' => $cartCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en get_cart.php: " . $e->getMessage()); // Log del error para depuración
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>