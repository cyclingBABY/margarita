-- Create the database
CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  displayName VARCHAR(255),
  role VARCHAR(50) DEFAULT 'guest',
  phoneNumber VARCHAR(50),
  passwordHash VARCHAR(255),
  dateOfBirth VARCHAR(50),
  nationality VARCHAR(100),
  idType VARCHAR(50),
  idNumber VARCHAR(100),
  employeeId VARCHAR(100),
  department VARCHAR(100),
  emergencyContact TEXT,
  ipAddress VARCHAR(50),
  deviceType VARCHAR(50),
  accountStatus VARCHAR(50) DEFAULT 'Pending',
  referralSource VARCHAR(100),
  createdAt VARCHAR(100)
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(50) UNIQUE,
  type VARCHAR(50),
  status VARCHAR(50),
  pricePerNight DECIMAL(10, 2),
  description TEXT,
  floor INT
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guestId VARCHAR(255),
  guestName VARCHAR(255),
  roomId INT,
  roomNumber VARCHAR(50),
  checkInDate VARCHAR(50),
  checkOutDate VARCHAR(50),
  totalAmount DECIMAL(10, 2),
  status VARCHAR(50),
  paymentStatus VARCHAR(50),
  createdAt VARCHAR(100),
  FOREIGN KEY(guestId) REFERENCES users(uid),
  FOREIGN KEY(roomId) REFERENCES rooms(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId VARCHAR(255),
  receiverId VARCHAR(255),
  content TEXT,
  timestamp VARCHAR(100),
  readStatus TINYINT(1) DEFAULT 0
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guestId VARCHAR(255),
  guestName VARCHAR(255),
  rating INT,
  comment TEXT,
  createdAt VARCHAR(100)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  organizerId VARCHAR(255),
  organizerName VARCHAR(255),
  date VARCHAR(100),
  location VARCHAR(255),
  status VARCHAR(50)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservationId INT,
  guestId VARCHAR(255),
  amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'unpaid',
  issueDate VARCHAR(100),
  dueDate VARCHAR(100),
  FOREIGN KEY(reservationId) REFERENCES reservations(id),
  FOREIGN KEY(guestId) REFERENCES users(uid)
);

-- Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomType VARCHAR(50),
  multiplier DECIMAL(4, 2),
  startDate VARCHAR(50),
  endDate VARCHAR(50),
  description TEXT
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  discountPercent INT,
  activeFrom VARCHAR(50),
  activeTo VARCHAR(50)
);

-- Maintenance Reports Table
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT,
  reportedBy VARCHAR(255),
  issue TEXT,
  status VARCHAR(50) DEFAULT 'open',
  createdAt VARCHAR(100),
  FOREIGN KEY(roomId) REFERENCES rooms(id)
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemName VARCHAR(100) UNIQUE,
  quantity INT DEFAULT 0,
  lastUpdated VARCHAR(100)
);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guestId VARCHAR(255),
  roomId INT,
  requestType VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  createdAt VARCHAR(100),
  FOREIGN KEY(guestId) REFERENCES users(uid),
  FOREIGN KEY(roomId) REFERENCES rooms(id)
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  adminId VARCHAR(255),
  action TEXT,
  timestamp VARCHAR(100),
  FOREIGN KEY(adminId) REFERENCES users(uid)
);

-- Seed initial rooms
INSERT IGNORE INTO rooms (number, type, status, pricePerNight, floor) VALUES 
('101', 'double', 'available', 150000.00, 1),
('102', 'double', 'available', 150000.00, 1),
('103', 'deluxe', 'available', 300000.00, 1),
('104', 'double', 'available', 150000.00, 1),
('105', 'suite', 'available', 500000.00, 1),
('201', 'double', 'available', 150000.00, 2),
('202', 'double', 'available', 150000.00, 2),
('203', 'deluxe', 'available', 300000.00, 2),
('204', 'double', 'available', 150000.00, 2),
('205', 'suite', 'available', 500000.00, 2),
('301', 'double', 'available', 150000.00, 3),
('302', 'double', 'available', 150000.00, 3),
('303', 'deluxe', 'available', 300000.00, 3),
('304', 'double', 'available', 150000.00, 3),
('305', 'suite', 'available', 500000.00, 3),
('401', 'double', 'available', 150000.00, 4),
('402', 'double', 'available', 150000.00, 4),
('403', 'deluxe', 'available', 300000.00, 4),
('404', 'double', 'available', 150000.00, 4),
('405', 'suite', 'available', 500000.00, 4);
