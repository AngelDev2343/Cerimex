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
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para eliminar métodos de pago.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$id = $input['id'] ?? null;

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de método de pago no proporcionado o inválido.']);
    close_db_connection($mysqli);
    exit();
}

$id = (int)$id;

try {
    $stmt = $mysqli->prepare("DELETE FROM metodos_pago WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar eliminar método de pago: " . $mysqli->error);
    }
    $stmt->bind_param("ii", $id, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Método de pago eliminado exitosamente.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Método de pago no encontrado o no autorizado para eliminar.']);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en delete_payment_method.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al eliminar método de pago.']);
} finally {
    close_db_connection($mysqli);
}
?>