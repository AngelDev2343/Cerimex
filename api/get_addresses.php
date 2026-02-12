<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// Asegúrate de que el usuario haya iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para ver tus direcciones.']);
    close_db_connection($mysqli);
    exit();
}

$userId = $_SESSION['user_id'];
$addresses = [];

try {
    $stmt = $mysqli->prepare("SELECT id, nombre_completo, calle_numero, colonia, ciudad, estado, codigo_postal, pais, telefono, es_predeterminada FROM direcciones_envio WHERE user_id = ? ORDER BY es_predeterminada DESC, fecha_creacion DESC");
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de direcciones: " . $mysqli->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $addresses[] = [
            'id' => $row['id'],
            'nombre_completo' => $row['nombre_completo'],
            'calle_numero' => $row['calle_numero'],
            'colonia' => $row['colonia'],
            'ciudad' => $row['ciudad'],
            'estado' => $row['estado'],
            'codigo_postal' => $row['codigo_postal'],
            'pais' => $row['pais'],
            'telefono' => $row['telefono'],
            'es_predeterminada' => (bool)$row['es_predeterminada']
        ];
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'addresses' => $addresses
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en get_addresses.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener las direcciones. Por favor, inténtalo de nuevo más tarde.']);
} finally {
    close_db_connection($mysqli);
}
?>