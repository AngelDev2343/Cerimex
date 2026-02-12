<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // O PUT si configuras tu servidor para ello
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para actualizar direcciones.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = $_SESSION['user_id'];
$id = $input['id'] ?? null;
$nombreCompleto = $input['nombre_completo'] ?? null;
$calleNumero = $input['calle_numero'] ?? null;
$colonia = $input['colonia'] ?? null;
$ciudad = $input['ciudad'] ?? null;
$estado = $input['estado'] ?? null;
$codigoPostal = $input['codigo_postal'] ?? null;
$pais = $input['pais'] ?? null;
$telefono = $input['telefono'] ?? null;
$esPredeterminada = $input['es_predeterminada'] ?? null; // Puede venir como null si solo se actualiza otra cosa

// Validaciones
if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de dirección no proporcionado o inválido.']);
    close_db_connection($mysqli);
    exit();
}

$id = (int)$id;

try {
    // Para la actualización, construimos la consulta dinámicamente para permitir actualizaciones parciales
    $updateFields = [];
    $bindTypes = 'i'; // Para el user_id final
    $bindValues = [$userId]; // Para el user_id final

    // Desmarcar otras direcciones predeterminadas si esta se va a marcar como predeterminada
    if ($esPredeterminada === true) {
        $stmt = $mysqli->prepare("UPDATE direcciones_envio SET es_predeterminada = FALSE WHERE user_id = ? AND es_predeterminada = TRUE AND id != ?");
        if (!$stmt) {
            throw new Exception("Error al preparar desmarcar predeterminada para update: " . $mysqli->error);
        }
        $stmt->bind_param("ii", $userId, $id);
        $stmt->execute();
        $stmt->close();
        
        // Asegurarse de que esta dirección se marque como predeterminada
        $updateFields[] = 'es_predeterminada = ?';
        $bindTypes .= 'i';
        $bindValues[] = 1; // true
    } elseif ($esPredeterminada === false) {
        // Si explícitamente se desmarca, agregar al update
        $updateFields[] = 'es_predeterminada = ?';
        $bindTypes .= 'i';
        $bindValues[] = 0; // false
    }

    if (isset($input['nombre_completo'])) { $updateFields[] = 'nombre_completo = ?'; $bindTypes .= 's'; $bindValues[] = $nombreCompleto; }
    if (isset($input['calle_numero'])) { $updateFields[] = 'calle_numero = ?'; $bindTypes .= 's'; $bindValues[] = $calleNumero; }
    if (isset($input['colonia'])) { $updateFields[] = 'colonia = ?'; $bindTypes .= 's'; $bindValues[] = $colonia; }
    if (isset($input['ciudad'])) { $updateFields[] = 'ciudad = ?'; $bindTypes .= 's'; $bindValues[] = $ciudad; }
    if (isset($input['estado'])) { $updateFields[] = 'estado = ?'; $bindTypes .= 's'; $bindValues[] = $estado; }
    if (isset($input['codigo_postal'])) { $updateFields[] = 'codigo_postal = ?'; $bindTypes .= 's'; $bindValues[] = $codigoPostal; }
    if (isset($input['pais'])) { $updateFields[] = 'pais = ?'; $bindTypes .= 's'; $bindValues[] = $pais; }
    if (isset($input['telefono'])) { $updateFields[] = 'telefono = ?'; $bindTypes .= 's'; $bindValues[] = $telefono; }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No hay datos para actualizar.']);
        close_db_connection($mysqli);
        exit();
    }
    
    // El ID de la dirección a actualizar va al final de los bind_values
    $bindTypes .= 'i';
    $bindValues[] = $id;

    $query = "UPDATE direcciones_envio SET " . implode(', ', $updateFields) . " WHERE id = ? AND user_id = ?";
    
    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar actualizar dirección: " . $mysqli->error . " Query: " . $query);
    }

    // Usar call_user_func_array para bind_param debido al número variable de argumentos
    call_user_func_array([$stmt, 'bind_param'], array_merge([$bindTypes], $bindValues));
    
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        // Si no se actualizó, podría ser que no se encontraron cambios o el ID no pertenece al usuario
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Dirección no encontrada o no autorizada para actualizar.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Dirección actualizada exitosamente.']);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en update_address.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al actualizar dirección.']);
} finally {
    close_db_connection($mysqli);
}
?>