<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
session_start();

// Cek login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    /**
     * ================================
     * 1. Tambah Task
     * ================================
     */
    if ($action === 'add') {
        $project_id = intval($_POST['project_id']);
        $title = trim($_POST['title']);

        if ($project_id === 0 || $title === '') {
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO tasks (project_id, title, status) VALUES (?, ?, 'mulai')");
        $stmt->execute([$project_id, $title]);

        $task_id = $pdo->lastInsertId();

        // Catat riwayat aktivitas
        addActivity($pdo, $user_id, $project_id, $task_id, 'Menambahkan Task', "Task '{$title}' ditambahkan ke kolom Mulai");

        echo json_encode(['status' => 'success', 'message' => 'Task berhasil ditambahkan!']);
        exit;
    }

    /**
     * ================================
     * 2. Edit Task
     * ================================
     */
    if ($action === 'edit') {
        $task_id = intval($_POST['task_id']);
        $title = trim($_POST['title']);

        if ($task_id === 0 || $title === '') {
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        // Ambil data lama
        $oldTaskStmt = $pdo->prepare("SELECT title, project_id FROM tasks WHERE id = ?");
        $oldTaskStmt->execute([$task_id]);
        $oldTask = $oldTaskStmt->fetch(PDO::FETCH_ASSOC);

        if (!$oldTask) {
            echo json_encode(['status' => 'error', 'message' => 'Task tidak ditemukan']);
            exit;
        }

        // Update task
        $stmt = $pdo->prepare("UPDATE tasks SET title = ? WHERE id = ?");
        $stmt->execute([$title, $task_id]);

        // Catat riwayat aktivitas
        $details = "Mengubah judul task dari '{$oldTask['title']}' menjadi '{$title}'";
        addActivity($pdo, $user_id, $oldTask['project_id'], $task_id, 'Mengedit Task', $details);

        echo json_encode(['status' => 'success', 'message' => 'Task berhasil diubah!']);
        exit;
    }

    /**
     * ================================
     * 3. Pindah Status Task (Drag & Drop)
     * ================================
     */
    if ($action === 'move') {
        $task_id = intval($_POST['task_id']);
        $new_status = $_POST['status'];

        // Validasi status
        $allowedStatus = ['mulai', 'proses', 'selesai'];
        if (!in_array($new_status, $allowedStatus)) {
            echo json_encode(['status' => 'error', 'message' => 'Status tidak valid']);
            exit;
        }

        // Ambil data lama untuk log
        $oldTaskStmt = $pdo->prepare("SELECT title, status, project_id FROM tasks WHERE id = ?");
        $oldTaskStmt->execute([$task_id]);
        $oldTask = $oldTaskStmt->fetch(PDO::FETCH_ASSOC);

        if (!$oldTask) {
            echo json_encode(['status' => 'error', 'message' => 'Task tidak ditemukan']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
        $stmt->execute([$new_status, $task_id]);

        // Catat riwayat aktivitas
        $details = "Task '{$oldTask['title']}' dipindah dari {$oldTask['status']} ke {$new_status}";
        addActivity($pdo, $user_id, $oldTask['project_id'], $task_id, 'Memindahkan Task', $details);

        echo json_encode(['status' => 'success', 'message' => 'Status task berhasil diubah']);
        exit;
    }

    /**
     * ================================
     * 4. Hapus Task
     * ================================
     */
    if ($action === 'delete') {
        $task_id = intval($_POST['task_id']);

        // Ambil data lama untuk log
        $oldTaskStmt = $pdo->prepare("SELECT title, project_id FROM tasks WHERE id = ?");
        $oldTaskStmt->execute([$task_id]);
        $oldTask = $oldTaskStmt->fetch(PDO::FETCH_ASSOC);

        if (!$oldTask) {
            echo json_encode(['status' => 'error', 'message' => 'Task tidak ditemukan']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$task_id]);

        // Catat riwayat aktivitas
        addActivity($pdo, $user_id, $oldTask['project_id'], $task_id, 'Menghapus Task', "Task '{$oldTask['title']}' dihapus");

        echo json_encode(['status' => 'success', 'message' => 'Task berhasil dihapus']);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Aksi tidak dikenali']);
    exit;
}

if ($_POST['action'] === 'move') {
    $task_id = intval($_POST['task_id']);
    $status = $_POST['status'];

    $query = "UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($query);
    if ($stmt->execute([$status, $task_id])) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Task berhasil dipindahkan!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal memindahkan task.'
        ]);
    }
    exit;
}

