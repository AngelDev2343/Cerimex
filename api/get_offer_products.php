<?php

require_once '../server.php'; // Incluye el script de conexión a la base de datos

header('Content-Type: application/json'); // Indica que la respuesta será JSON

// Verifica que la solicitud sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    close_db_connection($mysqli);
    exit();
}

$products = []; // Array para almacenar los productos

try {
    // Consulta SQL para seleccionar solo los productos con oferta = 'SI'
    // Seleccionamos también 'tipo_ofeta'
    $sql = "SELECT Id_Prod, Nom_Prod, Catego_Prod, Precio_Prod, Stock_Prod, description, image_url, oferta, tipo_ofeta FROM productos WHERE oferta = 'SI' ORDER BY Nom_Prod ASC";

    // Prepara la consulta SQL
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $mysqli->error);
    }

    $stmt->execute(); // Ejecuta la consulta
    $result = $stmt->get_result(); // Obtiene los resultados

    // Recorre los resultados y los añade al array de productos
    while ($row = $result->fetch_assoc()) {
        // Calcular el precio con descuento si hay un tipo de oferta numérico
        $originalPrice = (float)$row['Precio_Prod'];
        $discountedPrice = $originalPrice;
        $discountBadge = $row['tipo_ofeta']; // Mostrar el texto de tipo_ofeta directamente

        // Opcional: Si quieres calcular el precio con descuento y mostrarlo
        // Puedes parsear 'tipo_ofeta' si contiene porcentajes o cantidades fijas
        // Ejemplo simple si tipo_ofeta es "X OFF"
        if (preg_match('/(\d+)\s*OFF/i', $row['tipo_ofeta'], $matches)) {
            $discountValue = (float)$matches[1];
            // Suponemos que es un porcentaje, pero se puede adaptar para cantidad fija
            $discountedPrice = $originalPrice - ($originalPrice * ($discountValue / 100));
        }

        $products[] = [
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
            'discount_badge' => $discountBadge // Texto para el badge
        ];
    }
    $stmt->close(); // Cierra la declaración preparada

    // Devuelve la respuesta JSON con éxito y los productos
    echo json_encode(['success' => true, 'products' => $products]);

} catch (Exception $e) {
    http_response_code(500); // Error interno del servidor
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
} finally {
    close_db_connection($mysqli); // Cierra la conexión a la base de datos
}
?>