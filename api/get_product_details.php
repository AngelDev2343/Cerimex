<?php

// Incluye el script de conexión a la base de datos
require_once '../server.php';

// Indica que la respuesta será JSON
header('Content-Type: application/json');

// Verifica que la solicitud sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no permitido.']);
    close_db_connection($mysqli);
    exit();
}

// Obtiene el ID del producto de la URL
$productId = $_GET['id'] ?? null;

// Valida que se haya proporcionado un ID
if (empty($productId)) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado.']);
    close_db_connection($mysqli);
    exit();
}

$product = null; // Variable para almacenar los detalles del producto

try {
    // Consulta SQL para seleccionar todos los detalles del producto por su ID
    $sql = "SELECT Id_Prod, Nom_Prod, Catego_Prod, Precio_Prod, Stock_Prod, description, image_url, oferta, tipo_ofeta FROM productos WHERE Id_Prod = ?";

    // Prepara la consulta SQL para mayor seguridad
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $mysqli->error);
    }

    // Vincula el parámetro (el ID del producto)
    // ¡CAMBIO CLAVE AQUÍ! Usamos "i" para entero, ya que Id_Prod es numérico.
    $stmt->bind_param("i", $productId); // "i" para integer

    $stmt->execute(); // Ejecuta la consulta
    $result = $stmt->get_result(); // Obtiene los resultados

    // Si se encontró el producto, lo asigna a la variable $product
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        $originalPrice = (float)$row['Precio_Prod'];
        $discountedPrice = $originalPrice;
        $discountBadge = $row['tipo_ofeta'];

        // Calcular el precio con descuento si aplica y el tipo_ofeta es numérico (ej. "20 OFF")
        if ($row['oferta'] === 'SI' && preg_match('/(\d+)\s*OFF/i', $row['tipo_ofeta'], $matches)) {
            $discountValue = (float)$matches[1];
            $discountedPrice = $originalPrice - ($originalPrice * ($discountValue / 100));
        }

        $product = [
            'id' => $row['Id_Prod'],
            'name' => $row['Nom_Prod'],
            'category' => $row['Catego_Prod'],
            'original_price' => $originalPrice,
            'price' => $discountedPrice, // Precio ya con descuento aplicado
            'stock' => (int)$row['Stock_Prod'],
            'description' => $row['description'],
            'image_url' => $row['image_url'],
            'oferta' => $row['oferta'],
            'tipo_oferta' => $row['tipo_ofeta'],
            'discount_badge' => $discountBadge
        ];
    }
    $stmt->close(); // Cierra la declaración preparada

    // Devuelve la respuesta JSON
    if ($product) {
        echo json_encode(['success' => true, 'product' => $product]);
    } else {
        http_response_code(404); // No encontrado
        echo json_encode(['success' => false, 'message' => 'Producto no encontrado.']);
    }

} catch (Exception $e) {
    http_response_code(500); // Error interno del servidor
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli); // Cierra la conexión a la base de datos
}
?>