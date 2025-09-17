// assets/js/app.js
document.addEventListener("DOMContentLoaded", () => {
  const addProjectForm = document.getElementById("addProjectForm");

  if (addProjectForm) {
    addProjectForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      fetch("api/project.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Proyek berhasil ditambahkan!");
            location.reload(); // refresh halaman
          } else {
            alert(data.message || "Terjadi kesalahan.");
          }
        })
        .catch((err) => console.error(err));
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const taskColumns = document.querySelectorAll(".task-column");

  function loadTasks() {
    fetch("api/task.php?project_id=" + projectId)
      .then((res) => res.json())
      .then((data) => {
        // Pastikan kolom dikosongkan terlebih dahulu
        document.getElementById("mulaiColumn").innerHTML = "";
        document.getElementById("prosesColumn").innerHTML = "";
        document.getElementById("selesaiColumn").innerHTML = "";

        // Loop semua task dari response API
        data.forEach((task) => {
          const item = document.createElement("div");

          // ====== RENDER TASK DENGAN TOMBOL EDIT ======
          item.innerHTML = `
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">${task.title}</h5>
                            <button class="btn btn-sm btn-warning"
                                onclick="openEditTaskModal(${task.id}, '${task.title}', '${task.status}')">
                                Edit
                            </button>
                        </div>
                    </div>
                `;

          // Masukkan ke kolom sesuai status
          if (task.status === "mulai") {
            document.getElementById("mulaiColumn").appendChild(item);
          } else if (task.status === "proses") {
            document.getElementById("prosesColumn").appendChild(item);
          } else if (task.status === "selesai") {
            document.getElementById("selesaiColumn").appendChild(item);
          }
        });
      })
      .catch((error) => console.error("Error loading tasks:", error));
  }

  loadTasks();

  // Tambah task
  const addTaskForm = document.getElementById("addTaskForm");
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);

      fetch("api/task.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Task berhasil ditambahkan!");
            loadTasks();
            this.reset();
            bootstrap.Modal.getInstance(
              document.getElementById("addTaskModal")
            ).hide();
          } else {
            alert(data.message || "Gagal menambahkan task.");
          }
        });
    });
  }

  // Drag and Drop
  taskColumns.forEach((column) => {
    column.addEventListener("dragover", (e) => e.preventDefault());

    column.addEventListener("drop", function (e) {
      const taskId = e.dataTransfer.getData("text");
      const newStatus = this.dataset.status;

      fetch("api/task.php", {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `task_id=${taskId}&status=${newStatus}`,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            loadTasks();
          } else {
            alert(data.message || "Gagal update status.");
          }
        });
    });
  });

  // Drag start
  document.addEventListener("dragstart", function (e) {
    if (e.target.classList.contains("task-item")) {
      e.dataTransfer.setData("text", e.target.dataset.id);
    }
  });

  // Hapus task
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete")) {
      const taskId = e.target.dataset.id;
      if (confirm("Yakin ingin menghapus task ini?")) {
        fetch("api/task.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `task_id=${taskId}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              loadTasks();
            } else {
              alert(data.message || "Gagal menghapus task.");
            }
          });
      }
    }
  });
});

// Pindah task antar kolom
function moveTask(taskId, newStatus) {
  fetch("api/task.php", {
    method: "POST",
    body: new URLSearchParams({
      action: "move",
      task_id: taskId,
      status: newStatus,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        console.log(data.message);
        // Refresh tampilan board setelah dipindahkan
        loadTasks();
      } else {
        alert("Gagal memindahkan task: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat memindahkan task.");
    });
}

// ================== EDIT TASK ==================
document
  .getElementById("editTaskForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    formData.append("action", "edit");

    fetch("api/task.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert(data.message);
          loadTasks();
          loadActivityLogs(projectId);
          bootstrap.Modal.getInstance(
            document.getElementById("editTaskModal")
          ).hide();
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error(err));
  });

// ================== LOAD ACTIVITY LOG ==================
function loadActivityLogs(projectId) {
  fetch("api/activity.php?project_id=" + projectId)
    .then((res) => res.json())
    .then((data) => {
      const logList = document.getElementById("activityLogs");
      logList.innerHTML = "";

      if (data.status === "success") {
        if (data.data.length === 0) {
          logList.innerHTML =
            '<li class="list-group-item text-muted">Belum ada aktivitas.</li>';
        } else {
          data.data.forEach((log) => {
            const item = document.createElement("li");
            item.className = "list-group-item";
            item.innerHTML = `<strong>${log.username}</strong> - ${log.activity}<br><small class="text-muted">${log.created_at}</small>`;
            logList.appendChild(item);
          });
        }
      } else {
        logList.innerHTML =
          '<li class="list-group-item text-danger">Gagal memuat aktivitas.</li>';
      }
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("activityLogs").innerHTML =
        '<li class="list-group-item text-danger">Error loading logs.</li>';
    });
}

// ================== LOAD TASK DETAIL INTO EDIT MODAL ==================
function openEditTaskModal(taskId, title, status) {
  document.getElementById("editTaskId").value = taskId;
  document.getElementById("editTaskTitle").value = title;
  document.getElementById("editTaskStatus").value = status;

  const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
  modal.show();
}
