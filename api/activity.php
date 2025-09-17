<?php
require_once '../includes/db.php';
session_start();

// Pastikan user login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

// Pastikan project_id dikirim
if (!isset($_GET['project_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Project ID is required']);
    exit;
}

$project_id = intval($_GET['project_id']);

// Ambil data riwayat aktivitas
$query = "SELECT a.id, a.activity, a.created_at, u.username 
          FROM activity_logs a
          JOIN users u ON a.user_id = u.id
          WHERE a.project_id = ?
          ORDER BY a.created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute([$project_id]);
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'data' => $logs]);
exit;
