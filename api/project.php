<?php
include_once("../includes/db.php");
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Tidak ada akses']);
        exit;
    }

    $name = trim($_POST['name']);
    $user_id = $_SESSION['user_id'];

    if (!empty($name)) {
        $stmt = $pdo->prepare("INSERT INTO projects (user_id, name) VALUES (:user_id, :name)");
        $stmt->execute(['user_id' => $user_id, 'name' => $name]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nama proyek tidak boleh kosong']);
    }
    exit;
}
?>
