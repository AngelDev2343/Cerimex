<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para ver tus métodos de pago.']);
    close_db_connection($mysqli);
    exit();
}

$userId = $_SESSION['user_id'];
$paymentMethods = [];

try {
    // Seleccionar el número de tarjeta completo para este ejemplo educativo
    $stmt = $mysqli->prepare("SELECT id, tipo_tarjeta, numero_tarjeta_completo, fecha_expiracion, nombre_titular, es_predeterminado FROM metodos_pago WHERE user_id = ? ORDER BY es_predeterminado DESC, fecha_creacion DESC");
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de métodos de pago: " . $mysqli->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $paymentMethods[] = [
            'id' => $row['id'],
            'tipo_tarjeta' => $row['tipo_tarjeta'],
            'numero_tarjeta_completo' => $row['numero_tarjeta_completo'], // Incluye el número completo
            'fecha_expiracion' => $row['fecha_expiracion'],
            'nombre_titular' => $row['nombre_titular'],
            'es_predeterminado' => (bool)$row['es_predeterminado']
        ];
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'paymentMethods' => $paymentMethods
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en get_payment_methods.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener los métodos de pago. Por favor, inténtalo de nuevo más tarde.']);
} finally {
    close_db_connection($mysqli);
}
?>