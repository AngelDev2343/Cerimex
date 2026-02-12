<?php
session_start();
require_once '../server.php'; // Asegúrate de que esta ruta sea correcta para tu archivo de conexión a la base de datos

header('Content-Type: application/json');

// Verificar que la solicitud sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para ver tu información de seguridad.']);
    exit();
}

$userId = $_SESSION['user_id'];
$userData = [];

try {
    // Preparar y ejecutar la consulta para obtener el nombre y email del usuario
    // La contraseña no se selecciona por seguridad
    $stmtUser = $mysqli->prepare("SELECT nombre, email FROM usuarios WHERE id = ? LIMIT 1");
    if (!$stmtUser) {
        throw new Exception("Error al preparar consulta de usuario: " . $mysqli->error);
    }
    $stmtUser->bind_param("i", $userId);
    $stmtUser->execute();
    $resultUser = $stmtUser->get_result();
    $user = $resultUser->fetch_assoc(); // Obtener la fila como un array asociativo
    $stmtUser->close();

    if ($user) {
        // Ahora, obtener el número de teléfono de la tabla direcciones_envio
        // Asumiendo que quieres el teléfono de la dirección predeterminada
        $stmtAddress = $mysqli->prepare("SELECT telefono FROM direcciones_envio WHERE user_id = ? AND es_predeterminada = 1 LIMIT 1");
        if (!$stmtAddress) {
            throw new Exception("Error al preparar consulta de dirección: " . $mysqli->error);
        }
        $stmtAddress->bind_param("i", $userId);
        $stmtAddress->execute();
        $resultAddress = $stmtAddress->get_result();
        $address = $resultAddress->fetch_assoc();
        $stmtAddress->close();

        $telefonoPrincipal = $address['telefono'] ?? 'No disponible'; // Usar el teléfono si existe, sino 'No disponible'

        // Construir el array de datos del usuario
        $userData = [
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'telefono_principal' => $telefonoPrincipal, // Ahora se obtiene de la DB
            'contrasena_mascarada' => '********' // Contraseña enmascarada, nunca la real
        ];
        echo json_encode([
            'success' => true,
            'userData' => $userData
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
    }

} catch (Exception $e) {
    http_response_code(500); // Error interno del servidor
    error_log("Error en get_user_security_data.php: " . $e->getMessage()); // Registrar el error
    echo json_encode(['success' => false, 'message' => 'Error al obtener los datos de seguridad del usuario.']);
} finally {
    // Asegurarse de cerrar la conexión a la base de datos
    if (isset($mysqli)) {
        close_db_connection($mysqli);
    }
}
?>