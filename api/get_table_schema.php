<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado.']);
    close_db_connection($mysqli);
    exit();
}

$tableName = $_GET['table'] ?? '';

// Validar el nombre de la tabla (importante para la seguridad)
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
    error_log("Error al obtener la lista de tablas permitidas para get_table_schema: " . $e->getMessage());
}

if (!in_array($tableName, $allowedTables)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de tabla inválido o no permitido.']);
    close_db_connection($mysqli);
    exit();
}

try {
    $schema = [];
    $primaryKeyColumn = null;

    // Obtener el esquema de la tabla (DESCRIBE table_name)
    $stmt = $mysqli->prepare("DESCRIBE `" . $tableName . "`"); // Usa comillas inversas para nombres de tabla
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta DESCRIBE: " . $mysqli->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $schema[] = $row;
        if ($row['Key'] === 'PRI') {
            $primaryKeyColumn = $row['Field'];
        }
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'schema' => $schema,
        'primary_key_column' => $primaryKeyColumn
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en get_table_schema.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al obtener el esquema de la tabla: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>