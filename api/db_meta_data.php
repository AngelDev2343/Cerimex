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

try {
    $tables = [];
    // Obtener todas las tablas de la base de datos actual
    // Asegúrate de que el usuario de la DB tenga permisos para SHOW TABLES
    $result = $mysqli->query("SHOW TABLES");

    if ($result) {
        while ($row = $result->fetch_row()) {
            $tables[] = $row[0]; // El nombre de la tabla está en el primer elemento del array
        }
        $result->free();

        echo json_encode(['success' => true, 'tables' => $tables]);
    } else {
        throw new Exception("Error al obtener tablas: " . $mysqli->error);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error en db_meta_data.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al cargar metadatos de la base de datos: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli);
}
?>