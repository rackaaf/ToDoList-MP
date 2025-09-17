<?php
$host = "localhost";
$user = "root";       // sesuaikan dengan user MySQL Anda
$pass = "";           // sesuaikan dengan password MySQL Anda
$dbname = "todolistapp"; // nama database

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi gagal: " . $e->getMessage());
}
?>
