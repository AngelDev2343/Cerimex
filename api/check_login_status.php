<?php
session_start();
header('Content-Type: application/json');

// Simplemente verifica si $_SESSION['user_id'] está establecido
if (isset($_SESSION['user_id']) && $_SESSION['user_id'] !== null) {
    echo json_encode(['isLoggedIn' => true, 'userName' => $_SESSION['user_name'] ?? 'Usuario']);
} else {
    echo json_encode(['isLoggedIn' => false]);
}
?>