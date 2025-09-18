<?php
include "includes/auth.php";
include "includes/db.php";
include "includes/header.php";


if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo "<p class='text-danger'>Proyek tidak ditemukan.</p>";
    include "includes/footer.php";
    exit;
}

$project_id = (int)$_GET['id'];


$stmt = $pdo->prepare("SELECT * FROM projects WHERE id = :id AND user_id = :uid");
$stmt->execute(['id' => $project_id, 'uid' => $_SESSION['user_id']]);
$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {
    echo "<p class='text-danger'>Anda tidak memiliki akses ke proyek ini.</p>";
    include "includes/footer.php";
    exit;
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Proyek: <?= htmlspecialchars($project['name']); ?></h2>
    <a href="index.php" class="btn btn-secondary">← Kembali</a>
</div>


<div class="mb-4">
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTaskModal">+ Tambah Task</button>
</div>


<div class="row">
    <div class="col-md-4">
        <h4 class="text-center">Mulai</h4>
        <div class="task-column bg-light p-3 rounded" data-status="mulai" id="mulaiColumn"></div>
    </div>
    <div class="col-md-4">
        <h4 class="text-center">Proses</h4>
        <div class="task-column bg-light p-3 rounded" data-status="proses" id="prosesColumn"></div>
    </div>
    <div class="col-md-4">
        <h4 class="text-center">Selesai</h4>
        <div class="task-column bg-light p-3 rounded" data-status="selesai" id="selesaiColumn"></div>
    </div>
</div>


<div class="modal fade" id="addTaskModal" tabindex="-1" aria-labelledby="addTaskModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addTaskModalLabel">Tambah Task Baru</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="addTaskForm">
          <input type="hidden" name="action" value="add">
          <input type="hidden" name="user_id" value="<?php echo $_SESSION['user_id']; ?>">
          <input type="hidden" name="project_id" value="<?php echo $_GET['id']; ?>">
          <input type="hidden" name="status" value="mulai">

          <div class="mb-3">
            <label for="taskTitle" class="form-label">Judul Task</label>
            <input type="text" class="form-control" id="taskTitle" name="title" required>
          </div>

          <button type="submit" class="btn btn-primary">Simpan</button>
        </form>
      </div>
    </div>
  </div>
</div>



<div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="editTaskModalLabel">Edit Task</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="editTaskForm">
          <input type="hidden" name="task_id" id="editTaskId">
          <div class="mb-3">
            <label for="editTaskTitle" class="form-label">Judul Task</label>
            <input type="text" class="form-control" id="editTaskTitle" name="title" required>
          </div>
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
        </form>
      </div>
    </div>
  </div>
</div>


<script>
  const projectId = <?php echo $_GET['id']; ?>;
</script>



<?php include "includes/footer.php"; ?>
