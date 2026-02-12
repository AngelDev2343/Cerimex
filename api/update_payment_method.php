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
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para actualizar métodos de pago.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$id = $input['id'] ?? null;
$tipoTarjeta = $input['tipo_tarjeta'] ?? null;
$numeroTarjetaCompleto = $input['numero_tarjeta_completo'] ?? null; // Nuevo campo
$fechaExpiracion = $input['fecha_expiracion'] ?? null;
$nombreTitular = $input['nombre_titular'] ?? null;
$esPredeterminado = $input['es_predeterminado'] ?? false;

// Validaciones básicas (solo ID y que no estén vacíos)
if (!$id || !is_numeric($id) || empty($tipoTarjeta) || empty($numeroTarjetaCompleto) || empty($fechaExpiracion) || empty($nombreTitular)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos o formato incorrecto para actualizar.']);
    close_db_connection($mysqli);
    exit();
}

$id = (int)$id;

try {
    // Si se marca como predeterminado, primero desmarcar otros métodos predeterminados del usuario
    if ($esPredeterminado) {
        $stmt = $mysqli->prepare("UPDATE metodos_pago SET es_predeterminado = FALSE WHERE user_id = ? AND es_predeterminado = TRUE AND id != ?");
        if (!$stmt) {
            throw new Exception("Error al preparar desmarcar predeterminado para update: " . $mysqli->error);
        }
        $stmt->bind_param("ii", $userId, $id);
        $stmt->execute();
        $stmt->close();
    }

    // Actualizar el número de tarjeta completo
    $stmt = $mysqli->prepare("UPDATE metodos_pago SET tipo_tarjeta = ?, numero_tarjeta_completo = ?, fecha_expiracion = ?, nombre_titular = ?, es_predeterminado = ? WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar actualizar método de pago: " . $mysqli->error);
    }
    $stmt->bind_param("ssssiii", $tipoTarjeta, $numeroTarjetaCompleto, $fechaExpiracion, $nombreTitular, $esPredeterminado, $id, $userId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Método de pago no encontrado o no autorizado para actualizar.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Método de pago actualizado exitosamente.']);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en update_payment_method.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al actualizar método de pago.']);
} finally {
    close_db_connection($mysqli);
}
?>