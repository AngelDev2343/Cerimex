<?php
session_start();
require_once '../server.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado.']);
    close_db_connection($mysqli);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$tableName = $input['table'] ?? '';
$action = $input['action'] ?? ''; // 'add', 'edit', 'delete'
$id = $input['id'] ?? null; // ID del registro para 'edit' o 'delete'
$primaryKeyColumn = $input['primary_key_column'] ?? 'id'; // Nombre de la columna clave primaria
$data = $input['data'] ?? []; // Datos de la fila para 'add' o 'edit'

// Validar el nombre de la tabla (IMPRESCINDIBLE)
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
    error_log("Error al obtener la lista de tablas permitidas para manage_table_row: " . $e->getMessage());
}

if (!in_array($tableName, $allowedTables)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de tabla inválido o no permitido.']);
    close_db_connection($mysqli);
    exit();
}

try {
    $stmt = null;
    $message = '';

    if ($action === 'add') {
        // Construir INSERT
        $columns = [];
        $placeholders = [];
        $values = [];
        $types = '';

        // Obtener el esquema para determinar los tipos y la PK
        $schemaResult = $mysqli->query("DESCRIBE `" . $tableName . "`");
        $schema = [];
        while ($row = $schemaResult->fetch_assoc()) {
            $schema[$row['Field']] = $row;
        }

        foreach ($data as $key => $value) {
            // No incluir la PK si es auto_increment y no se le está dando un valor
            if ($schema[$key]['Key'] === 'PRI' && $schema[$key]['Extra'] === 'auto_increment' && empty($value)) {
                continue;
            }
            $columns[] = "`" . $key . "`";
            $placeholders[] = "?";
            $values[] = $value;
            // Inferir tipo (básico)
            if (strpos($schema[$key]['Type'], 'int') !== false || strpos($schema[$key]['Type'], 'decimal') !== false) {
                $types .= 'i';
            } else if (strpos($schema[$key]['Type'], 'double') !== false || strpos($schema[$key]['Type'], 'float') !== false) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }

        $sql = "INSERT INTO `" . $tableName . "` (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar INSERT: " . $mysqli->error);
        }
        $stmt->bind_param($types, ...$values);
        $message = 'Registro añadido exitosamente.';

    } else if ($action === 'edit') {
        if ($id === null) {
            throw new Exception("ID de registro no proporcionado para edición.");
        }

        // Construir UPDATE
        $setParts = [];
        $values = [];
        $types = '';

        // Obtener el esquema para determinar los tipos
        $schemaResult = $mysqli->query("DESCRIBE `" . $tableName . "`");
        $schema = [];
        while ($row = $schemaResult->fetch_assoc()) {
            $schema[$row['Field']] = $row;
        }

        foreach ($data as $key => $value) {
            if ($key === $primaryKeyColumn) { // No actualizar la clave primaria
                continue;
            }
            $setParts[] = "`" . $key . "` = ?";
            $values[] = $value;
            // Inferir tipo (básico)
            if (strpos($schema[$key]['Type'], 'int') !== false || strpos($schema[$key]['Type'], 'decimal') !== false) {
                $types .= 'i';
            } else if (strpos($schema[$key]['Type'], 'double') !== false || strpos($schema[$key]['Type'], 'float') !== false) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }

        // Añadir el ID para la cláusula WHERE
        $values[] = $id;
        $types .= 'i'; // Asumiendo que la PK es un entero

        $sql = "UPDATE `" . $tableName . "` SET " . implode(", ", $setParts) . " WHERE `" . $primaryKeyColumn . "` = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar UPDATE: " . $mysqli->error);
        }
        $stmt->bind_param($types, ...$values);
        $message = 'Registro actualizado exitosamente.';

    } else if ($action === 'delete') {
        if ($id === null) {
            throw new Exception("ID de registro no proporcionado para eliminación.");
        }
        // Construir DELETE
        $sql = "DELETE FROM `" . $tableName . "` WHERE `" . $primaryKeyColumn . "` = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar DELETE: " . $mysqli->error);
        }
        $stmt->bind_param("i", $id); // Asumiendo que la PK es un entero
        $message = 'Registro eliminado exitosamente.';

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Acción inválida.']);
        close_db_connection($mysqli);
        exit();
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => $message]);
    } else {
        throw new Exception("Error al ejecutar la operación: " . $stmt->error);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en manage_table_row.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en la operación de base de datos: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>