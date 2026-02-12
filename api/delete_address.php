<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // O DELETE si configuras tu servidor para ello
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para eliminar direcciones.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$id = $input['id'] ?? null;

// Validar ID
if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de dirección no proporcionado o inválido.']);
    close_db_connection($mysqli);
    exit();
}

$id = (int)$id;

try {
    $stmt = $mysqli->prepare("DELETE FROM direcciones_envio WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("Error al preparar eliminar dirección: " . $mysqli->error);
    }
    $stmt->bind_param("ii", $id, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Dirección eliminada exitosamente.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Dirección no encontrada o no autorizada para eliminar.']);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en delete_address.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al eliminar dirección.']);
} finally {
    close_db_connection($mysqli);
}
?>