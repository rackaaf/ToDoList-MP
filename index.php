<?php
include "includes/auth.php";
include "includes/db.php";
include "includes/header.php";

$stmt = $pdo->prepare("SELECT * FROM projects WHERE user_id = :uid ORDER BY created_at DESC");
$stmt->execute(['uid' => $_SESSION['user_id']]);
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="bi bi-speedometer2"></i> Dashboard</h2>
    <button class="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#addProjectModal">
        <i class="bi bi-plus-circle"></i> Tambah Proyek
    </button>
</div>

<div class="row">
    <?php if (count($projects) > 0): ?>
        <?php foreach ($projects as $project): ?>
            <div class="col-md-4">
                <div class="card project-card shadow-sm mb-3">
                    <div class="card-body">
                        <h5 class="card-title">
                          <i class="bi bi-folder2-open"></i> <?= htmlspecialchars($project['name']); ?>
                        </h5>
                        <p class="card-text text-muted">
                          <i class="bi bi-calendar-event"></i> <?= date('d M Y', strtotime($project['created_at'])); ?>
                        </p>
                        <a href="project.php?id=<?= $project['id']; ?>" class="btn btn-sm btn-success">
                            <i class="bi bi-eye"></i> Lihat
                        </a>
                        <a href="javascript:void(0)" 
                           class="btn btn-sm btn-danger"
                           onclick="deleteProject(<?= $project['id']; ?>)">
                           <i class="bi bi-trash"></i> Hapus
                        </a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <p class="text-muted">Belum ada proyek. Silakan tambah proyek baru.</p>
    <?php endif; ?>
</div>

<!-- Modal Tambah Proyek -->
<div class="modal fade" id="addProjectModal" tabindex="-1" aria-labelledby="addProjectModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addProjectModalLabel">Tambah Proyek Baru</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="addProjectForm">
          <div class="mb-3">
            <label for="projectName" class="form-label">Nama Proyek</label>
            <input type="text" class="form-control" id="projectName" name="name" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Simpan</button>
        </form>
      </div>
    </div>
  </div>
</div>

<?php
include "includes/footer.php";
?>
