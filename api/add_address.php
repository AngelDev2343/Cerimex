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
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para añadir direcciones.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$nombreCompleto = $input['nombre_completo'] ?? null;
$calleNumero = $input['calle_numero'] ?? null;
$colonia = $input['colonia'] ?? null;
$ciudad = $input['ciudad'] ?? null;
$estado = $input['estado'] ?? null;
$codigoPostal = $input['codigo_postal'] ?? null;
$pais = $input['pais'] ?? null;
$telefono = $input['telefono'] ?? null;
$esPredeterminada = $input['es_predeterminada'] ?? false; // Viene como booleano de JS

// Validaciones básicas (solo que no estén vacíos para el ejemplo)
if (empty($nombreCompleto) || empty($calleNumero) || empty($colonia) || empty($ciudad) || empty($estado) || empty($codigoPostal) || empty($pais) || empty($telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos de la dirección.']);
    close_db_connection($mysqli);
    exit();
}

try {
    // Si se marca como predeterminada, primero desmarcar otras direcciones predeterminadas del usuario
    if ($esPredeterminada) {
        $stmt = $mysqli->prepare("UPDATE direcciones_envio SET es_predeterminada = FALSE WHERE user_id = ? AND es_predeterminada = TRUE");
        if (!$stmt) {
            throw new Exception("Error al preparar desmarcar predeterminada: " . $mysqli->error);
        }
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->close();
    }

    $stmt = $mysqli->prepare("INSERT INTO direcciones_envio (user_id, nombre_completo, calle_numero, colonia, ciudad, estado, codigo_postal, pais, telefono, es_predeterminada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Error al preparar añadir dirección: " . $mysqli->error);
    }
    $stmt->bind_param("issssssssi", $userId, $nombreCompleto, $calleNumero, $colonia, $ciudad, $estado, $codigoPostal, $pais, $telefono, $esPredeterminada);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Dirección añadida exitosamente.']);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en add_address.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al añadir dirección.']);
} finally {
    close_db_connection($mysqli);
}
?>