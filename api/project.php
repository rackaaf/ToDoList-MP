<?php
include_once("../includes/db.php");
session_start();
header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Tidak ada akses']);
        exit;
    }

    $name = trim($_POST['name'] ?? '');
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


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $project_id = intval($_DELETE['id'] ?? 0);

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Tidak ada akses']);
        exit;
    }
    $user_id = $_SESSION['user_id'];

    if ($project_id === 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID proyek tidak valid']);
        exit;
    }


    $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
    $stmt->execute([$project_id, $user_id]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Proyek tidak ditemukan']);
        exit;
    }


    $pdo->prepare("DELETE FROM tasks WHERE project_id = ?")->execute([$project_id]);


    $pdo->prepare("DELETE FROM projects WHERE id = ?")->execute([$project_id]);

    echo json_encode(['success' => true]);
    exit;
}
