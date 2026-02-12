<?php
session_start();
require_once '../server.php'; // Asegúrate de que esta ruta sea correcta

header('Content-Type: application/json');

// Verificar que la solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado. Inicia sesión para actualizar tu información.']);
    exit();
}

$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

$field = $input['field'] ?? '';
$value = $input['value'] ?? '';

// Validación básica de entrada
if (empty($field) || empty($value)) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos para la actualización.']);
    exit();
}

try {
    $mysqli->begin_transaction(); // Iniciar una transacción para asegurar la atomicidad

    $success = false;
    $message = 'Error desconocido al actualizar.';

    switch ($field) {
        case 'nombre':
            $stmt = $mysqli->prepare("UPDATE usuarios SET nombre = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("si", $value, $userId);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $success = true;
                    $message = 'Nombre actualizado exitosamente.';
                } else {
                    $message = 'No se pudo actualizar el nombre o no hubo cambios.';
                }
                $stmt->close();
            } else {
                throw new Exception("Error al preparar la consulta para nombre: " . $mysqli->error);
            }
            break;

        case 'email':
            // Validar formato de email
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $message = 'Formato de correo electrónico inválido.';
                break;
            }
            $stmt = $mysqli->prepare("UPDATE usuarios SET email = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("si", $value, $userId);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $success = true;
                    $message = 'Correo electrónico actualizado exitosamente.';
                } else {
                    $message = 'No se pudo actualizar el correo electrónico o no hubo cambios.';
                }
                $stmt->close();
            } else {
                throw new Exception("Error al preparar la consulta para email: " . $mysqli->error);
            }
            break;

        case 'telefono':
            // Asumiendo que el teléfono está en direcciones_envio y se actualiza la dirección predeterminada
            // Considera si necesitas una lógica más compleja para múltiples direcciones
            $stmt = $mysqli->prepare("UPDATE direcciones_envio SET telefono = ? WHERE user_id = ? AND es_predeterminada = 1");
            if ($stmt) {
                $stmt->bind_param("si", $value, $userId);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $success = true;
                    $message = 'Número de teléfono actualizado exitosamente.';
                } else {
                    $message = 'No se pudo actualizar el número de teléfono o no hubo cambios (asegúrate de tener una dirección predeterminada).';
                }
                $stmt->close();
            } else {
                throw new Exception("Error al preparar la consulta para teléfono: " . $mysqli->error);
            }
            break;

        case 'contrasena':
            // Hashear la nueva contraseña
            $hashedPassword = password_hash($value, PASSWORD_DEFAULT);
            $stmt = $mysqli->prepare("UPDATE usuarios SET contrasena = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("si", $hashedPassword, $userId);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $success = true;
                    $message = 'Contraseña actualizada exitosamente.';
                } else {
                    $message = 'No se pudo actualizar la contraseña o no hubo cambios.';
                }
                $stmt->close();
            } else {
                throw new Exception("Error al preparar la consulta para contraseña: " . $mysqli->error);
            }
            break;

        default:
            $message = 'Campo de actualización no válido.';
            break;
    }

    if ($success) {
        $mysqli->commit(); // Confirmar la transacción si todo fue bien
        echo json_encode(['success' => true, 'message' => $message]);
    } else {
        $mysqli->rollback(); // Revertir la transacción si hubo un error
        echo json_encode(['success' => false, 'message' => $message]);
    }

} catch (Exception $e) {
    $mysqli->rollback(); // Revertir en caso de excepción
    http_response_code(500);
    error_log("Error en update_user_security_data.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor al actualizar: ' . $e->getMessage()]);
} finally {
    if (isset($mysqli)) {
        close_db_connection($mysqli);
    }
}
?>