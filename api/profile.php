<?php
require_once 'db.php';

// Profile fetch usually needs a UID (or from session/token)
// For simplicity, we just look at the GET parameter or the URI segment
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $path);
$uid = end($parts);

if (!$uid || $uid === 'profile.php') {
    $uid = $_GET['uid'] ?? null;
}

if ($uid) {
    try {
        $stmt = $pdo->prepare("SELECT uid, email, displayName, role, phoneNumber, dateOfBirth, nationality FROM users WHERE uid = ?");
        $stmt->execute([$uid]);
        $user = $stmt->fetch();

        if ($user) {
            http_response_code(200);
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "UID missing."]);
}
?>
