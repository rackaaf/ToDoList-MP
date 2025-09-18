<?php
session_start();
require_once "../includes/db.php";
require_once "../includes/functions.php";

header('Content-Type: application/json');
ob_clean(); 


if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;

    if (!$project_id) {
        echo json_encode(['status' => 'error', 'message' => 'Project ID diperlukan']);
        exit;
    }


    $stmt = $pdo->prepare("SELECT id, title, status FROM tasks WHERE project_id = ?");
    $stmt->execute([$project_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($tasks);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';


    if ($action === 'add') {
        $project_id = $_POST['project_id'] ?? null;
        $title      = trim($_POST['title'] ?? '');
        $status     = $_POST['status'] ?? 'mulai';

        if (empty($project_id) || empty($title)) {
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO tasks (title, status, project_id, user_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $status, $project_id, $user_id]);

        echo json_encode(['status' => 'success', 'message' => 'Task berhasil ditambahkan']);
        exit;
    }


if ($action === 'edit') {
    $task_id = intval($_POST['task_id'] ?? 0);
    $title = trim($_POST['title'] ?? '');

    if ($task_id === 0 || $title === '') {
        echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
        exit;
    }


    $check = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
    $check->execute([$task_id, $user_id]);
    if ($check->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Task tidak ditemukan atau bukan milik Anda']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE tasks SET title = ? WHERE id = ?");
    $stmt->execute([$title, $task_id]);

    echo json_encode(['status' => 'success', 'message' => 'Task berhasil diubah!']);
    exit;
}


    if ($action === 'move') {
        $task_id = intval($_POST['task_id']);
        $new_status = $_POST['status'];

        $allowedStatus = ['mulai', 'proses', 'selesai'];
        if (!in_array($new_status, $allowedStatus)) {
            echo json_encode(['status' => 'error', 'message' => 'Status tidak valid']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
        $stmt->execute([$new_status, $task_id]);

        echo json_encode(['status' => 'success', 'message' => 'Status task berhasil diubah']);
        exit;
    }


}



if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $task_id = intval($_DELETE['id'] ?? 0);

    if ($task_id === 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID task tidak valid']);
        exit;
    }


    $check = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
    $check->execute([$task_id, $user_id]);
    if ($check->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Task tidak ditemukan atau bukan milik Anda']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$task_id, $user_id]);

    echo json_encode(['success' => true, 'message' => 'Task berhasil dihapus']);
    exit;
}
?>
