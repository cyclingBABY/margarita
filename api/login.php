<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->email) &&
    !empty($data->password)
) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        $user = $stmt->fetch();

        if ($user && password_verify($data->password, $user['passwordHash'])) {
            // Generate a fake token for frontend compatibility
            $token = base64_encode(json_encode(["uid" => $user['uid'], "exp" => time() + 86400]));

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "uid" => $user['uid'],
                    "email" => $user['email'],
                    "displayName" => $user['displayName'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Login failed: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Incomplete data."]);
}
?>
