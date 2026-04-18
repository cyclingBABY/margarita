<?php
header("Content-Type: text/plain");
$host = '127.0.0.1';
$db   = 'magarite_db';
$user = 'root';
$pass = '';

echo "Attempting to connect to $host...\n";
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    echo "Connection successful!\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
}
?>
