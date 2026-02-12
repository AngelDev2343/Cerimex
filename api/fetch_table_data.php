<?php
session_start();
require_once '../server.php'; // Tu archivo de conexión a la base de datos

header('Content-Type: application/json');

// Verificar si el administrador ha iniciado sesión
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado.']);
    close_db_connection($mysqli);
    exit();
}

$tableName = $_GET['table'] ?? '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0; // 0 significa sin límite
$id = $_GET['id'] ?? null; // Para obtener una fila específica
$pkColumn = $_GET['pk_column'] ?? 'id'; // Nuevo: Nombre de la columna PK, por defecto 'id'

// Validar el nombre de la tabla (muy importante para prevenir SQL Injection)
// Se obtiene la lista de tablas permitidas de la base de datos.
$allowedTables = [];
try {
    $result = $mysqli->query("SHOW TABLES");
    if ($result) {
        while ($row = $result->fetch_row()) {
            $allowedTables[] = $row[0];
        }
        $result->free();
    }
} catch (Exception $e) {
    error_log("Error al obtener la lista de tablas permitidas: " . $e->getMessage());
}

if (!in_array($tableName, $allowedTables)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de tabla inválido o no permitido.']);
    close_db_connection($mysqli);
    exit();
}

$data = [];
$totalRows = 0;

try {
    // Primero, obtener el conteo total de filas para la tabla (opcional)
    $countStmt = $mysqli->prepare("SELECT COUNT(*) FROM `" . $tableName . "`");
    if ($countStmt) {
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalRows = $countResult->fetch_row()[0];
        $countStmt->close();
    }

    // Construir la consulta principal
    $sql = "SELECT * FROM `" . $tableName . "`";
    $params = [];
    $types = '';

    if ($id !== null) {
        // Usar la columna PK proporcionada para la cláusula WHERE
        $sql .= " WHERE `" . $pkColumn . "` = ?";
        $params[] = $id;
        // Asumiendo que las PKs son enteros. Ajusta si tienes PKs de string (ej. UUIDs)
        $types .= 'i';
    }

    if ($limit > 0 && $id === null) { // Aplicar límite solo si no se busca un ID específico
        $sql .= " LIMIT ?";
        $params[] = $limit;
        $types .= 'i';
    }

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta de datos para tabla '" . $tableName . "': " . $mysqli->error);
    }

    if (!empty($params)) {
        // bind_param requiere que los parámetros se pasen por referencia,
        // pero la sintaxis `...$params` en PHP 5.6+ lo maneja automáticamente para arrays.
        // Si tienes problemas, verifica tu versión de PHP.
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'table_name' => $tableName,
        'total_rows' => $totalRows,
        'data' => $data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en fetch_table_data.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener datos de la tabla ' . $tableName . ': ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>