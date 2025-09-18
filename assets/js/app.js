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
            Swal.fire({
              title: "Berhasil!",
              text: "Proyek berhasil ditambahkan!",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Gagal!", data.message || "Terjadi kesalahan.", "error");
          }
        })
        .catch((err) => console.error(err));
    });
  }
});

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
      <a href="javascript:void(0)" 
         class="btn btn-sm btn-warning"
         onclick="openEditTaskModal(${task.id}, '${task.title}')">
         Edit
      </a>
      <a href="javascript:void(0)" 
         class="btn btn-sm btn-danger"
         onclick="deleteTask(${task.id})">
         Hapus
      </a>
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

function deleteProject(projectId) {
  Swal.fire({
    title: "Yakin hapus project ini?",
    text: "Semua task di dalam project ini juga akan terhapus!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("api/project.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id=" + projectId,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire({
              title: "Terhapus!",
              text: data.message,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              window.location.href = "index.php";
            });
          } else {
            Swal.fire("Gagal!", data.message, "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire("Error!", "Terjadi kesalahan di server", "error");
        });
    }
  });
}

function deleteTask(taskId) {
  Swal.fire({
    title: "Yakin hapus task ini?",
    text: "Task yang dihapus tidak bisa dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("api/task.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id=" + taskId,
      })
        .then((response) => response.text())
        .then((text) => {
          if (!text) {
            throw new Error("Server tidak mengirim respons JSON");
          }
          return JSON.parse(text);
        })
        .then((data) => {
          if (data.success) {
            Swal.fire({
              title: "Terhapus!",
              text: data.message,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              loadTasks(projectId);
            });
          } else {
            Swal.fire("Gagal!", data.message, "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire("Error!", error.message, "error");
        });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const taskColumns = document.querySelectorAll(".task-column");

  if (typeof projectId !== "undefined") {
    loadTasks();
  }

  const addTaskForm = document.getElementById("addTaskForm");

  if (addTaskForm) {
    addTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      fetch("api/task.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.text())
        .then((data) => {
          console.log("Raw Response:", data);

          let jsonData;
          try {
            jsonData = JSON.parse(data);
          } catch (error) {
            console.error("JSON Parse Error:", error);
            alert("Gagal memproses respon server. Cek console untuk detail.");
            return;
          }

          if (jsonData.status === "success") {
            Swal.fire({
              title: "Berhasil!",
              text: "Task berhasil ditambahkan!",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              loadTasks();
              addTaskForm.reset();
              const modal = bootstrap.Modal.getInstance(
                document.getElementById("addTaskModal")
              );
              if (modal) modal.hide();
            });
          } else {
            Swal.fire(
              "Gagal!",
              jsonData.message || "Gagal menambahkan task.",
              "error"
            );
          }
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          alert("Terjadi kesalahan saat mengirim data.");
        });
    });
  }

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
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=move&task_id=${taskId}&status=${newStatus}`,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            loadTasks();
          } else {
            alert(data.message || "Gagal update status.");
          }
        })
        .catch((err) => console.error(err));
    });
  });

  document.addEventListener("dragstart", function (e) {
    if (e.target.classList.contains("task-item")) {
      e.dataTransfer.setData("text", e.target.dataset.id);
    }
  });

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

          loadTasks();

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

function openEditTaskModal(taskId, title) {
  document.getElementById("editTaskId").value = taskId;
  document.getElementById("editTaskTitle").value = title;

  const modal = new bootstrap.Modal(document.getElementById("editTaskModal"));
  modal.show();
}
