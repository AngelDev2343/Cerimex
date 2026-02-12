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

// Obtiene el término de búsqueda y la categoría de la URL
$searchTerm = $_GET['search'] ?? '';
$category = $_GET['category'] ?? ''; // Nuevo parámetro para la categoría

$products = []; // Array para almacenar los productos

try {
    // Consulta SQL base para seleccionar los productos con los nombres de columna especificados
    $sql = "SELECT Id_Prod, Nom_Prod, Catego_Prod, Precio_Prod, Stock_Prod, description, image_url FROM productos";
    $params = []; // Parámetros para la consulta preparada
    $types = '';  // Tipos de los parámetros para la consulta preparada

    $whereClauses = []; // Array para almacenar las condiciones WHERE

    // Si hay una categoría, añade la condición de categoría
    if (!empty($category) && $category !== 'all') { // 'all' será nuestra categoría para mostrar todos
        $whereClauses[] = "Catego_Prod LIKE ?";
        $params[] = $category;
        $types .= 's';
    }

    // Si hay un término de búsqueda, añade la condición de búsqueda por nombre
    if (!empty($searchTerm)) {
        $whereClauses[] = "Nom_Prod LIKE ?";
        $params[] = "%" . $searchTerm . "%";
        $types .= 's';
    }

    // Si hay cláusulas WHERE, constrúyelas
    if (!empty($whereClauses)) {
        $sql .= " WHERE " . implode(" AND ", $whereClauses);
    }

    $sql .= " ORDER BY Nom_Prod ASC"; // Ordena los resultados por Nom_Prod alfabéticamente

    // Prepara la consulta SQL para mayor seguridad (previene inyección SQL)
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $mysqli->error);
    }

    // Si hay parámetros, vincúlalos a la consulta preparada
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute(); // Ejecuta la consulta
    $result = $stmt->get_result(); // Obtiene los resultados

    // Recorre los resultados y los añade al array de productos
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['Id_Prod'],
            'name' => $row['Nom_Prod'],
            'category' => $row['Catego_Prod'],
            'price' => (float)$row['Precio_Prod'],
            'stock' => (int)$row['Stock_Prod'],
            'description' => $row['description'],
            'image_url' => $row['image_url']
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