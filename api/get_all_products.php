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

// Obtiene el término de búsqueda de la URL (si existe)
$searchTerm = $_GET['search'] ?? '';

$products = []; // Array para almacenar los productos

try {
    // Consulta SQL base para seleccionar todos los productos con los nombres de columna especificados
    // Nota: Has puesto Precio_Prod dos veces en tu solicitud, lo he mantenido así.
    // También he añadido Stock_Prod que estaba en tu solicitud.
    $sql = "SELECT Id_Prod, Nom_Prod, Catego_Prod, Precio_Prod, Precio_Prod AS price_duplicate, Stock_Prod, description, image_url FROM productos";
    $params = []; // Parámetros para la consulta preparada
    $types = '';  // Tipos de los parámetros para la consulta preparada

    // Si hay un término de búsqueda, añade la cláusula WHERE para filtrar por nombre (Nom_Prod)
    if (!empty($searchTerm)) {
        $sql .= " WHERE Nom_Prod LIKE ?"; // Filtra por Nom_Prod usando LIKE
        $params[] = "%" . $searchTerm . "%"; // Añade comodines para búsqueda parcial
        $types = 's'; // 's' indica que el parámetro es un string
    }

    $sql .= " ORDER BY Nom_Prod ASC"; // Ordena los resultados por Nom_Prod alfabéticamente

    // Prepara la consulta SQL para mayor seguridad (previene inyección SQL)
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $mysqli->error);
    }

    // Si hay un término de búsqueda, vincula el parámetro a la consulta preparada
    if (!empty($searchTerm)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute(); // Ejecuta la consulta
    $result = $stmt->get_result(); // Obtiene los resultados

    // Recorre los resultados y los añade al array de productos
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['Id_Prod'], // Mapea Id_Prod a 'id' para el JS
            'name' => $row['Nom_Prod'], // Mapea Nom_Prod a 'name' para el JS
            'description' => $row['description'],
            'price' => (float)$row['Precio_Prod'], // Mapea Precio_Prod a 'price' para el JS
            'image_url' => $row['image_url'],
            'category' => $row['Catego_Prod'], // Mapea Catego_Prod a 'category' para el JS
            'stock' => (int)$row['Stock_Prod'] // Mapea Stock_Prod a 'stock'
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