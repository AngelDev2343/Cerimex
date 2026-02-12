<?php
session_start();
require_once '../server.php'; // Asegúrate de que esta ruta sea correcta para tu archivo de conexión a la base de datos

header('Content-Type: application/json');

// Verificar que la solicitud sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para ver tus pedidos.']);
    exit();
}

$userId = $_SESSION['user_id'];
$orders = [];

try {
    // Consulta para obtener los pedidos del usuario
    $stmtOrders = $mysqli->prepare("SELECT id, fecha_pedido, estado, total FROM pedidos WHERE user_id = ? ORDER BY fecha_pedido DESC");
    if (!$stmtOrders) {
        // Incluir el error de MySQL para depuración
        throw new Exception("Error al preparar consulta de pedidos: " . $mysqli->error);
    }
    $stmtOrders->bind_param("i", $userId);
    $stmtOrders->execute();
    $resultOrders = $stmtOrders->get_result();

    while ($orderRow = $resultOrders->fetch_assoc()) {
        $orderId = $orderRow['id'];
        $orderItems = [];

        // Consulta para obtener los detalles de los productos para cada pedido
        // Actualizado para usar la tabla 'pedidos_items' y las columnas correctas de 'productos'
        $stmtItems = $mysqli->prepare("
            SELECT pi.quantity, pi.price_at_purchase, p.Nom_Prod, p.description, p.image_url
            FROM pedidos_items pi
            JOIN productos p ON pi.product_id = p.Id_Prod  -- Cambiado p.id a p.Id_Prod
            WHERE pi.pedido_id = ?
        ");
        if (!$stmtItems) {
            // Incluir el error de MySQL para depuración
            throw new Exception("Error al preparar consulta de detalles de pedido: " . $mysqli->error);
        }
        $stmtItems->bind_param("i", $orderId);
        $stmtItems->execute();
        $resultItems = $stmtItems->get_result();

        while ($itemRow = $resultItems->fetch_assoc()) {
            $orderItems[] = [
                'nombre' => $itemRow['Nom_Prod'],        // Usar Nom_Prod
                'cantidad' => $itemRow['quantity'],
                'precio_unitario' => $itemRow['price_at_purchase'],
                'descripcion' => $itemRow['description'],  // Usar description
                'imagen_url' => $itemRow['image_url']      // Usar image_url
            ];
        }
        $stmtItems->close();

        $orders[] = [
            'id' => $orderRow['id'],
            'fecha_pedido' => $orderRow['fecha_pedido'],
            'estado' => $orderRow['estado'],
            'total' => $orderRow['total'],
            'items' => $orderItems
        ];
    }
    $stmtOrders->close();

    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);

} catch (Exception $e) {
    http_response_code(500); // Error interno del servidor
    error_log("Error en get_orders.php: " . $e->getMessage()); // Registrar el error
    echo json_encode(['success' => false, 'message' => 'Error al obtener el historial de pedidos. Por favor, verifica los logs del servidor para más detalles.']);
} finally {
    // Asegurarse de cerrar la conexión a la base de datos
    if (isset($mysqli)) {
        close_db_connection($mysqli);
    }
}
?>