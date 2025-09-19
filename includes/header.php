<?php
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To-Do List App</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
</head>
<body>
<nav class="navbar navbar-dark">

      <?php if(isset($_SESSION['username'])): ?>
          <div class="container-fluid d-flex justify-content-between pt-2 pb-2">
        <a class="navbar-brand" href="index.php"></a>
    <div>
        <span class="text-white me-3">👋 Halo, <?= htmlspecialchars($_SESSION['username']); ?></span>
        <a href="logout.php" class="btn btn-sm btn-outline-light">Logout</a>
      <?php endif; ?>
    </div>
  </div>
</nav>
<div class="container my-4">
