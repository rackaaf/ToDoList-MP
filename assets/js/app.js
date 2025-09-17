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

// ================= LOAD TASKS =================
function loadTasks() {
  fetch("api/task.php?project_id=" + projectId)
    .then((res) => res.json())
    .then((data) => {
      console.log("Task Data:", data);

      document.getElementById("mulaiColumn").innerHTML = "";
      document.getElementById("prosesColumn").innerHTML = "";
      document.getElementById("selesaiColumn").innerHTML = "";

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        return;
      }

      data.forEach((task) => {
        const item = document.createElement("div");
        item.classList.add("task-item");
        item.setAttribute("draggable", "true");
        item.dataset.id = task.id;

        item.innerHTML = `
          <div class="card mb-2">
            <div class="card-body">
              <h5 class="card-title">${task.title}</h5>
              <button class="btn btn-sm btn-warning"
                onclick="openEditTaskModal(${task.id}, '${task.title}')">
                Edit
              </button>
            </div>
          </div>
        `;

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

document.addEventListener("DOMContentLoaded", () => {
  const taskColumns = document.querySelectorAll(".task-column");

  loadTasks();

  // Tambah task
  const addTaskForm = document.getElementById("addTaskForm");

  if (addTaskForm) {
    addTaskForm.addEventListener("submit", function (e) {
      e.preventDefault(); // ✅ cegah submit default

      const formData = new FormData(this);

      fetch("api/task.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.text()) // ambil raw text dulu
        .then((data) => {
          console.log("Raw Response:", data); // ✅ debug

          let jsonData;
          try {
            jsonData = JSON.parse(data); // coba parse JSON
          } catch (error) {
            console.error("JSON Parse Error:", error);
            alert("Gagal memproses respon server. Cek console untuk detail.");
            return;
          }

          // ✅ cek hasil respon
          if (jsonData.status === "success") {
            alert("Task berhasil ditambahkan!");

            // reload daftar task
            if (typeof loadTasks === "function") {
              loadTasks();
            }

            // reset form
            addTaskForm.reset();

            // tutup modal
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("addTaskModal")
            );
            if (modal) modal.hide();
          } else {
            alert(jsonData.message || "Gagal menambahkan task.");
          }
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          alert("Terjadi kesalahan saat mengirim data.");
        });
    });
  }

  // Drag and Drop
  taskColumns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", function (e) {
      e.preventDefault();
      column.classList.remove("drag-over");

      const taskId = e.dataTransfer.getData("text");
      const newStatus = this.dataset.status;

      fetch("api/task.php", {
        method: "POST", // pakai POST, bukan PUT
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=move&task_id=${taskId}&status=${newStatus}`,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            loadTasks(); // refresh tampilan
          } else {
            alert(data.message || "Gagal update status.");
          }
        })
        .catch((err) => console.error(err));
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
          Swal.fire({
            title: "Berhasil!",
            text: data.message,
            icon: "success",
            confirmButtonText: "OK",
          });

          // Refresh daftar task setelah edit
          loadTasks();

          // Jika punya log aktivitas, reload juga
          if (typeof loadActivityLogs === "function") {
            loadActivityLogs(projectId);
          }

          // Tutup modal edit
          const editModal = bootstrap.Modal.getInstance(
            document.getElementById("editTaskModal")
          );
          if (editModal) editModal.hide();
        } else {
          Swal.fire({
            title: "Gagal!",
            text: data.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((err) => {
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat memproses data.",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error(err);
      });
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
function openEditTaskModal(taskId, title) {
  document.getElementById("editTaskId").value = taskId;
  document.getElementById("editTaskTitle").value = title;

  const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
  modal.show();
}
