<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->displayName)
) {
    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT uid FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Email already in use."]);
            exit();
        }

        $uid = uniqid('user_', true);
        $passwordHash = password_hash($data->password, PASSWORD_BCRYPT);
        $now = date('Y-m-d\TH:i:s.v\Z');

        $stmt = $pdo->prepare("INSERT INTO users (
            uid, email, displayName, role, phoneNumber, passwordHash, 
            dateOfBirth, nationality, idType, idNumber, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $uid,
            $data->email,
            $data->displayName,
            $data->role ?? 'guest',
            $data->phoneNumber ?? null,
            $passwordHash,
            $data->dateOfBirth ?? null,
            $data->nationality ?? null,
            $data->idType ?? 'Passport',
            $data->idNumber ?? null,
            $now
        ]);

        // Generate a fake token for frontend compatibility
        $token = base64_encode(json_encode(["uid" => $uid, "exp" => time() + 86400]));

        http_response_code(201);
        echo json_encode([
            "message" => "User registered successfully",
            "token" => $token,
            "user" => [
                "uid" => $uid,
                "email" => $data->email,
                "displayName" => $data->displayName,
                "role" => $data->role ?? 'guest'
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Incomplete data."]);
}
?>
