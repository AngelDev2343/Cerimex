<?php
session_start();
require_once '../server.php'; // Ajusta la ruta si server.php no está en la raíz

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'] ?? null;
$addressId = $input['address_id'] ?? null;
$paymentMethodId = $input['payment_method_id'] ?? null;
$cartItems = $input['cart_items'] ?? [];
$totalAmount = $input['total_amount'] ?? 0;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit();
}

if (!$addressId || !$paymentMethodId || empty($cartItems) || $totalAmount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos de pedido incompletos o inválidos.']);
    exit();
}

// Iniciar una transacción para asegurar la atomicidad de las operaciones
$mysqli->begin_transaction();

try {
    // 1. Crear un nuevo pedido en la tabla `pedidos` (ej. 'orders')
    // Ajusta los nombres de las columnas y los tipos según tu DB
    $stmt = $mysqli->prepare("INSERT INTO pedidos (user_id, direccion_id, metodo_pago_id, total, fecha_pedido, estado) VALUES (?, ?, ?, ?, NOW(), 'pendiente')");
    if (!$stmt) {
        throw new Exception("Error al preparar inserción de pedido: " . $mysqli->error);
    }
    $stmt->bind_param("iiid", $userId, $addressId, $paymentMethodId, $totalAmount);
    $stmt->execute();
    $orderId = $mysqli->insert_id; // Obtener el ID del pedido recién insertado
    $stmt->close();

    // 2. Insertar los ítems del carrito en la tabla `pedidos_items` (ej. 'order_items')
    // Asume que tienes una tabla 'pedidos_items' que vincula productos a pedidos
    $stmt = $mysqli->prepare("INSERT INTO pedidos_items (pedido_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Error al preparar inserción de ítems de pedido: " . $mysqli->error);
    }
    foreach ($cartItems as $item) {
        $productId = $item['id'];
        $quantity = $item['quantity'];
        $price = $item['price']; // Precio en el momento de la compra
        $stmt->bind_param("iiid", $orderId, $productId, $quantity, $price);
        $stmt->execute();
    }
    $stmt->close();

    // 3. Vaciar el carrito del usuario/sesión
    // Reutilizamos la lógica de clear_cart.php pero directamente aquí
    $identifierColumn = 'user_id'; // Siempre user_id aquí ya que estamos logueados
    $identifierValue = $userId;
    $identifierType = 'i';

    $stmt = $mysqli->prepare("DELETE FROM carrito_items WHERE {$identifierColumn} = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar vaciado de carrito: " . $mysqli->error);
    }
    $stmt->bind_param("{$identifierType}", $identifierValue);
    $stmt->execute();
    $stmt->close();

    // Si todo fue bien, confirmar la transacción
    $mysqli->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido realizado con éxito!', 'orderId' => $orderId]);

} catch (Exception $e) {
    // Si algo falló, revertir la transacción
    $mysqli->rollback();
    http_response_code(500);
    error_log("Error en place_order.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al procesar el pedido. Por favor, inténtalo de nuevo.']);
} finally {
    close_db_connection($mysqli);
}
?>