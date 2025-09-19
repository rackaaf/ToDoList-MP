<?php
include "includes/db.php";
session_start();

$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (!empty($username) && !empty($password)) {
        // cek username
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);

        if ($stmt->rowCount() > 0) {
            $message = "Username sudah terdaftar!";
        } else {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
            $stmt->execute(['username' => $username, 'password' => $hashedPassword]);
            $message = "Registrasi berhasil! Silakan login.";
        }
    } else {
        $message = "Semua field harus diisi!";
    }
}
?>

<?php include "includes/header.php"; ?>
<div class="row justify-content-center box">
    <div class="col-md-5">
        <div class="card shadow-lg border-0 rounded-4">
            <div class="card-body p-4">
                <h3 class="mb-4 text-center"><i class="bi bi-person-plus"></i> Registrasi</h3>

                <?php if (!empty($message)): ?>
                    <div class="alert alert-info"><?= htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-person"></i> Username</label>
                        <input type="text" name="username" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-shield-lock"></i> Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                    <button class="btn btn-primary w-100"><i class="bi bi-check-circle"></i> Daftar</button>
                </form>

                <p class="mt-3 text-center">
                    Sudah punya akun? <a href="login.php">Login</a>
                </p>
            </div>
        </div>
    </div>
</div>
<?php include "includes/footer.php"; ?>
