<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para añadir métodos de pago.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$tipoTarjeta = $input['tipo_tarjeta'] ?? null;
$numeroTarjetaCompleto = $input['numero_tarjeta_completo'] ?? null; // Nuevo campo
$fechaExpiracion = $input['fecha_expiracion'] ?? null;
$nombreTitular = $input['nombre_titular'] ?? null;
$esPredeterminado = $input['es_predeterminado'] ?? false;

// Validaciones básicas (solo que no estén vacíos, sin formato estricto para el ejemplo)
if (empty($tipoTarjeta) || empty($numeroTarjetaCompleto) || empty($fechaExpiracion) || empty($nombreTitular)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos de la tarjeta.']);
    close_db_connection($mysqli);
    exit();
}

try {
    // Si se marca como predeterminado, primero desmarcar otros métodos predeterminados del usuario
    if ($esPredeterminado) {
        $stmt = $mysqli->prepare("UPDATE metodos_pago SET es_predeterminado = FALSE WHERE user_id = ? AND es_predeterminado = TRUE");
        if (!$stmt) {
            throw new Exception("Error al preparar desmarcar predeterminado: " . $mysqli->error);
        }
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->close();
    }

    // Insertar el número de tarjeta completo
    $stmt = $mysqli->prepare("INSERT INTO metodos_pago (user_id, tipo_tarjeta, numero_tarjeta_completo, fecha_expiracion, nombre_titular, es_predeterminado) VALUES (?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Error al preparar añadir método de pago: " . $mysqli->error);
    }
    $stmt->bind_param("issssi", $userId, $tipoTarjeta, $numeroTarjetaCompleto, $fechaExpiracion, $nombreTitular, $esPredeterminado);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Método de pago añadido exitosamente.']);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en add_payment_method.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al añadir método de pago.']);
} finally {
    close_db_connection($mysqli);
}
?>