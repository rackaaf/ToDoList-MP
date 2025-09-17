<?php
// Fungsi mencatat riwayat aktivitas
function addActivity($pdo, $user_id, $project_id, $task_id, $action, $details) {
    $stmt = $pdo->prepare("
        INSERT INTO activity_log (user_id, project_id, task_id, action, details)
        VALUES (?, ?, ?, ?, ?)
    ");
    return $stmt->execute([$user_id, $project_id, $task_id, $action, $details]);
}

// Fungsi mengambil riwayat aktivitas
function getActivityLog($pdo, $project_id) {
    $stmt = $pdo->prepare("
        SELECT a.id, a.action, a.details, a.created_at, u.username
        FROM activity_log a
        JOIN users u ON a.user_id = u.id
        WHERE a.project_id = ?
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$project_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


function addActivityLog($pdo, $user_id, $project_id, $activity) {
    $query = "INSERT INTO activity_logs (user_id, project_id, activity, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $pdo->prepare($query);
    return $stmt->execute([$user_id, $project_id, $activity]);
}

