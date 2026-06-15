-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2026 at 08:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `magarite_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `concierge_messages`
--

CREATE TABLE `concierge_messages` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `roomNumber` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `organizerId` varchar(255) DEFAULT NULL,
  `organizerName` varchar(255) DEFAULT NULL,
  `date` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `serviceType` varchar(50) DEFAULT NULL,
  `serviceId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `itemName` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `lastUpdated` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `reservationId` int(11) DEFAULT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'unpaid',
  `issueDate` varchar(100) DEFAULT NULL,
  `dueDate` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `reservationId`, `guestId`, `amount`, `status`, `issueDate`, `dueDate`) VALUES
(1, 6, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 1050000.00, 'paid', '2026-04-27T15:41:32.222Z', '2026-04-08');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_reports`
--

CREATE TABLE `maintenance_reports` (
  `id` int(11) NOT NULL,
  `roomId` int(11) DEFAULT NULL,
  `reportedBy` varchar(255) DEFAULT NULL,
  `issue` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `senderId` varchar(255) DEFAULT NULL,
  `receiverId` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `timestamp` varchar(100) DEFAULT NULL,
  `readStatus` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `senderId`, `receiverId`, `content`, `timestamp`, `readStatus`) VALUES
(1, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'admin', 'hujl;km;\'\\', '2026-04-26T18:44:25.468Z', 0),
(2, 'admin_seeded_12345', '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'okayt', '2026-04-26T18:44:37.536Z', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `guestId`, `message`, `isRead`, `createdAt`) VALUES
(1, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your reservation for Room M17 has been approved!', 0, '2026-04-26T17:58:28.302Z'),
(2, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your room service order for Room M17 has been delivered!', 0, '2026-04-26T18:21:42.905Z'),
(3, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your reservation for Room 103 has been approved!', 0, '2026-04-27T08:04:33.119Z'),
(4, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your reservation for Room 201 has been approved!', 0, '2026-04-27T08:42:30.667Z'),
(5, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your reservation for Room 104 has been approved!', 0, '2026-04-27T14:08:22.175Z'),
(6, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your spa booking for Deluxe Manicure has been confirmed!', 0, '2026-04-27T14:59:02.939Z'),
(7, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your reservation for Room 304 has been approved!', 0, '2026-04-27T15:41:32.217Z'),
(8, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your spa session for Deluxe Manicure has been completed. Thank you!', 0, '2026-04-27T15:45:41.630Z'),
(9, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your room service order for Room 304 is being prepared! 👨‍🍳', 0, '2026-04-27T15:46:04.310Z'),
(10, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your room service order for Room 104 is being prepared! 👨‍🍳', 0, '2026-04-27T15:46:12.381Z'),
(11, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your room service order for Room 304 is ready! We\'ll bring it shortly. 🚚', 0, '2026-04-27T15:46:13.476Z'),
(12, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Your room service order for Room 104 is ready! We\'ll bring it shortly. 🚚', 0, '2026-04-27T15:46:15.284Z'),
(13, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your room service order for Room M17 is being prepared! 👨‍🍳', 0, '2026-04-27T15:46:36.245Z'),
(14, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your room service order for Room M17 is ready! We\'ll bring it shortly. 🚚', 0, '2026-04-27T15:46:56.130Z'),
(15, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Your room service order for Room M17 has been delivered! Enjoy! 🎉', 0, '2026-04-27T15:46:59.509Z');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_rules`
--

CREATE TABLE `pricing_rules` (
  `id` int(11) NOT NULL,
  `roomType` varchar(50) DEFAULT NULL,
  `multiplier` decimal(4,2) DEFAULT NULL,
  `startDate` varchar(50) DEFAULT NULL,
  `endDate` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `discountPercent` int(11) DEFAULT NULL,
  `activeFrom` varchar(50) DEFAULT NULL,
  `activeTo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL,
  `roomNumber` varchar(50) DEFAULT NULL,
  `checkInDate` varchar(50) DEFAULT NULL,
  `checkOutDate` varchar(50) DEFAULT NULL,
  `totalAmount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `paymentStatus` varchar(50) DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `approvedBy` varchar(255) DEFAULT NULL,
  `approvedAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `guestId`, `guestName`, `roomId`, `roomNumber`, `checkInDate`, `checkOutDate`, `totalAmount`, `status`, `paymentStatus`, `createdAt`, `approvedBy`, `approvedAt`) VALUES
(2, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Cycling Baby', 17, 'M17', '2026-04-24', '2026-04-30', 1500000.00, 'confirmed', 'paid', '2026-04-24T08:50:27.423Z', NULL, NULL),
(3, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Cycling Baby', 33, '103', '2026-04-27', '2026-04-28', 300000.00, 'confirmed', 'paid', '2026-04-27T08:04:01.707Z', NULL, NULL),
(4, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', 36, '201', '2026-04-28', '2026-04-29', 150000.00, 'confirmed', 'paid', '2026-04-27T08:08:00.771Z', NULL, NULL),
(5, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', 34, '104', '2026-04-27', '2026-04-28', 150000.00, 'confirmed', 'paid', '2026-04-27T14:07:53.002Z', NULL, NULL),
(6, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', 44, '304', '2026-04-01', '2026-04-08', 1050000.00, 'confirmed', 'paid', '2026-04-27T15:02:38.221Z', 'admin_seeded_12345', '2026-04-27T15:41:32.204Z'),
(7, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Cycling Baby', 32, '102', '2026-04-29', '2026-04-30', 56000.00, 'confirmed', 'pending', '2026-04-28T18:22:24.836Z', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `number` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `pricePerNight` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `floor` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `number`, `type`, `status`, `pricePerNight`, `description`, `floor`) VALUES
(1, 'M1', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(2, 'M2', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(3, 'M3', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(4, 'M4', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(5, 'M5', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(6, 'M6', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(7, 'M7', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(8, 'M8', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(9, 'M9', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(10, 'M10', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(11, 'M11', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(12, 'M12', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(13, 'M13', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(14, 'M14', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(15, 'M15', 'Standard', 'available', 250000.00, 'Cozy Standard room', 1),
(16, 'M16', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(17, 'M17', 'Deluxe', 'occupied', 250000.00, 'Cozy Deluxe room', 2),
(18, 'M18', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(19, 'M19', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(20, 'M20', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(21, 'M21', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(22, 'M22', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(23, 'M23', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(24, 'M24', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(25, 'M25', 'Deluxe', 'available', 250000.00, 'Cozy Deluxe room', 2),
(26, 'M26', 'Suite', 'available', 250000.00, 'Cozy Suite room', 3),
(27, 'M27', 'Suite', 'available', 250000.00, 'Cozy Suite room', 3),
(28, 'M28', 'Suite', 'available', 250000.00, 'Cozy Suite room', 3),
(29, 'M29', 'Suite', 'available', 250000.00, 'Cozy Suite room', 3),
(30, 'M30', 'Suite', 'available', 250000.00, 'Cozy Suite room', 3),
(31, '101', 'double', 'available', 150000.00, NULL, 1),
(32, '102', 'double', 'available', 150000.00, NULL, 1),
(33, '103', 'deluxe', 'occupied', 300000.00, NULL, 1),
(34, '104', 'double', 'occupied', 150000.00, NULL, 1),
(35, '105', 'suite', 'available', 500000.00, NULL, 1),
(36, '201', 'double', 'occupied', 150000.00, NULL, 2),
(37, '202', 'double', 'available', 150000.00, NULL, 2),
(38, '203', 'deluxe', 'available', 300000.00, NULL, 2),
(39, '204', 'double', 'available', 150000.00, NULL, 2),
(40, '205', 'suite', 'available', 500000.00, NULL, 2),
(41, '301', 'double', 'available', 150000.00, NULL, 3),
(42, '302', 'double', 'available', 150000.00, NULL, 3),
(43, '303', 'deluxe', 'available', 300000.00, NULL, 3),
(44, '304', 'double', 'occupied', 150000.00, NULL, 3),
(45, '305', 'suite', 'available', 500000.00, NULL, 3),
(46, '401', 'double', 'available', 150000.00, NULL, 4),
(47, '402', 'double', 'available', 150000.00, NULL, 4),
(48, '403', 'deluxe', 'available', 300000.00, NULL, 4),
(49, '404', 'double', 'available', 150000.00, NULL, 4),
(50, '405', 'suite', 'available', 500000.00, NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `room_service_orders`
--

CREATE TABLE `room_service_orders` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `roomNumber` varchar(50) DEFAULT NULL,
  `reservationId` int(11) DEFAULT NULL,
  `items` text DEFAULT NULL,
  `totalAmount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `specialInstructions` text DEFAULT NULL,
  `estimatedDeliveryTime` varchar(50) DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `updatedAt` varchar(100) DEFAULT NULL,
  `paymentStatus` varchar(50) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_service_orders`
--

INSERT INTO `room_service_orders` (`id`, `guestId`, `guestName`, `roomNumber`, `reservationId`, `items`, `totalAmount`, `status`, `specialInstructions`, `estimatedDeliveryTime`, `createdAt`, `updatedAt`, `paymentStatus`) VALUES
(1, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Cycling Baby', 'M17', 2, '[{\"id\":1,\"name\":\"Continental Breakfast\",\"category\":\"Breakfast\",\"price\":25000,\"description\":\"Coffee, tea, toast, jam, butter, fruits\",\"quantity\":1}]', 25000.00, 'delivered', '', '', '2026-04-26T18:18:00.470Z', '2026-04-26T18:21:42.898Z', 'paid'),
(2, '1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'Cycling Baby', 'M17', 2, '[{\"id\":6,\"name\":\"Margherita Pizza\",\"category\":\"Dinner\",\"price\":50000,\"description\":\"Tomato sauce, mozzarella, basil\",\"quantity\":1},{\"id\":3,\"name\":\"Chicken Caesar Salad\",\"category\":\"Lunch\",\"price\":35000,\"description\":\"Grilled chicken, romaine lettuce, parmesan, croutons\",\"quantity\":1}]', 85000.00, 'delivered', '', '', '2026-04-26T18:59:56.309Z', '2026-04-27T15:46:59.503Z', 'paid'),
(3, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', '104', 5, '[{\"id\":1,\"name\":\"Continental Breakfast\",\"category\":\"Breakfast\",\"price\":25000,\"description\":\"Coffee, tea, toast, jam, butter, fruits\",\"quantity\":1}]', 25000.00, 'ready', '', '', '2026-04-27T14:58:50.307Z', '2026-04-27T15:46:15.277Z', 'paid'),
(4, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', '304', 6, '[{\"id\":1,\"name\":\"Continental Breakfast\",\"category\":\"Breakfast\",\"price\":25000,\"description\":\"Coffee, tea, toast, jam, butter, fruits\",\"quantity\":1}]', 25000.00, 'ready', '', '', '2026-04-27T15:42:20.874Z', '2026-04-27T15:46:13.470Z', 'paid');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL,
  `requestType` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spa_bookings`
--

CREATE TABLE `spa_bookings` (
  `id` int(11) NOT NULL,
  `guestId` varchar(255) DEFAULT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `roomNumber` varchar(50) DEFAULT NULL,
  `service` varchar(100) DEFAULT NULL,
  `serviceLabel` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `bookingDate` varchar(50) DEFAULT NULL,
  `bookingTime` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `paymentStatus` varchar(50) DEFAULT 'pending',
  `approvedBy` varchar(255) DEFAULT NULL,
  `approvedAt` varchar(100) DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spa_bookings`
--

INSERT INTO `spa_bookings` (`id`, `guestId`, `guestName`, `roomNumber`, `service`, `serviceLabel`, `price`, `bookingDate`, `bookingTime`, `notes`, `status`, `paymentStatus`, `approvedBy`, `approvedAt`, `createdAt`) VALUES
(1, 'a6f4edea-f4d2-479d-a335-b525d0afff25', 'Nakibuule Kirabo', '104', 'manicure', 'Deluxe Manicure', 35000.00, '2026-04-28', '19:00', 'please', 'completed', 'paid', NULL, NULL, '2026-04-27T14:58:36.554Z');

-- --------------------------------------------------------

--
-- Table structure for table `staff_schedules`
--

CREATE TABLE `staff_schedules` (
  `id` int(11) NOT NULL,
  `staffId` varchar(255) DEFAULT NULL,
  `staffName` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `shiftDate` varchar(50) DEFAULT NULL,
  `startTime` varchar(50) DEFAULT NULL,
  `endTime` varchar(50) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `createdAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `adminId` varchar(255) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `timestamp` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `adminId`, `action`, `timestamp`) VALUES
(1, NULL, 'Room Service Order: Cycling Baby in Room M17 - 4 days remaining - Total: UGX 25000', '2026-04-26T18:18:00.480Z'),
(2, NULL, 'Room Service Order: Cycling Baby in Room M17 - 4 days remaining - Total: UGX 85000', '2026-04-26T18:59:56.318Z'),
(3, NULL, 'New booking by Cycling Baby for Room 103 (2026-04-27 to 2026-04-28)', '2026-04-27T08:04:01.719Z'),
(4, NULL, 'New booking by Nakibuule Kirabo for Room 201 (2026-04-28 to 2026-04-29)', '2026-04-27T08:08:00.778Z'),
(5, NULL, 'New booking by Nakibuule Kirabo for Room 104 (2026-04-27 to 2026-04-28)', '2026-04-27T14:07:53.020Z'),
(6, 'admin_seeded_12345', 'Reservation #2 payment marked as paid. Invoice synced to paid.', '2026-04-27T14:28:48.781Z'),
(7, 'admin_seeded_12345', 'Reservation #4 payment marked as pending. Invoice synced to unpaid.', '2026-04-27T14:28:54.140Z'),
(8, 'admin_seeded_12345', 'Reservation #5 payment marked as pending. Invoice synced to unpaid.', '2026-04-27T14:28:54.933Z'),
(9, 'admin_seeded_12345', 'Reservation #5 payment marked as paid. Invoice synced to paid.', '2026-04-27T14:28:55.832Z'),
(10, 'admin_seeded_12345', 'Reservation #4 payment marked as paid. Invoice synced to paid.', '2026-04-27T14:28:57.443Z'),
(11, NULL, 'New spa booking by Nakibuule Kirabo (manicure) for 2026-04-28 at 19:00', '2026-04-27T14:58:36.568Z'),
(12, NULL, 'Room Service Order: Nakibuule Kirabo in Room 104 - 1 days remaining - Total: UGX 25000', '2026-04-27T14:58:50.318Z'),
(13, 'admin_seeded_12345', 'Approved spa booking #1 for Nakibuule Kirabo (Deluxe Manicure). Payment: pending', '2026-04-27T14:59:02.955Z'),
(14, 'admin_seeded_12345', 'Spa Booking #1: Payment status updated to paid', '2026-04-27T14:59:04.580Z'),
(15, NULL, 'New booking by Nakibuule Kirabo for Room 304 (2026-04-01 to 2026-04-08)', '2026-04-27T15:02:38.233Z'),
(16, 'admin_seeded_12345', 'Reservation #6 payment marked as paid. Invoice synced to paid.', '2026-04-27T15:03:01.980Z'),
(17, 'admin_seeded_12345', 'Reservation #5 payment marked as pending. Invoice synced to unpaid.', '2026-04-27T15:04:07.925Z'),
(18, 'admin_seeded_12345', 'Reservation #6 payment marked as pending. Invoice synced to unpaid.', '2026-04-27T15:04:11.949Z'),
(19, 'admin_seeded_12345', 'Approved reservation #6 for Room 304. Invoice generated. Payment: unpaid', '2026-04-27T15:41:32.227Z'),
(20, NULL, 'Room Service Order: Nakibuule Kirabo in Room 304 - -19 days remaining - Total: UGX 25000', '2026-04-27T15:42:20.881Z'),
(21, 'admin_seeded_12345', 'Reservation #6 payment marked as paid. Invoice synced to paid.', '2026-04-27T15:45:00.466Z'),
(22, 'admin_seeded_12345', 'Reservation #5 payment marked as paid. Invoice synced to paid.', '2026-04-27T15:45:02.659Z'),
(23, 'admin_seeded_12345', 'Completed spa booking #1 for Nakibuule Kirabo (Deluxe Manicure)', '2026-04-27T15:45:41.637Z'),
(24, 'admin_seeded_12345', 'Room Service Order #4: Status updated to preparing - Room 304', '2026-04-27T15:46:04.314Z'),
(25, 'admin_seeded_12345', 'Room Service Order #3: Status updated to preparing - Room 104', '2026-04-27T15:46:12.387Z'),
(26, 'admin_seeded_12345', 'Room Service Order #4: Status updated to ready - Room 304', '2026-04-27T15:46:13.482Z'),
(27, 'admin_seeded_12345', 'Room Service Order #3: Status updated to ready - Room 104', '2026-04-27T15:46:15.290Z'),
(28, 'admin_seeded_12345', 'Room Service Order #2: Status updated to preparing - Room M17', '2026-04-27T15:46:36.252Z'),
(29, 'admin_seeded_12345', 'Room Service Order #2: Status updated to ready - Room M17', '2026-04-27T15:46:56.137Z'),
(30, 'admin_seeded_12345', 'Room Service Order #2: Status updated to delivered - Room M17', '2026-04-27T15:46:59.514Z'),
(31, 'admin_seeded_12345', 'Updated invoice 1 status to unpaid. Reservation payment synced.', '2026-04-27T15:57:26.524Z'),
(32, 'admin_seeded_12345', 'Updated invoice 1 status to paid. Reservation payment synced.', '2026-04-27T15:57:29.400Z'),
(33, NULL, 'Password reset requested by user: Stuart Admin (stuartdonsms@gmail.com). User details - Phone: N/A, Role: admin, Password hash: $2b$10$/kqIJ3hnf2vdQfsEMI0i7emohVSsHLBXartRYc46wUvAQnI5EdHuK', '2026-04-28T16:16:33.617Z'),
(34, NULL, 'Password reset requested by user: Cycling Baby (cyclingbaby10@gmail.com). User details - Phone: 0745330829, Role: guest, Password hash: $2b$10$7mOrQgfBHqha9tCgj2aDvOxyrwEErjJ2eCugiXnOP30AT/bsP7H16', '2026-04-28T16:17:18.148Z');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `displayName` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'guest',
  `phoneNumber` varchar(50) DEFAULT NULL,
  `passwordHash` varchar(255) DEFAULT NULL,
  `dateOfBirth` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `idType` varchar(50) DEFAULT NULL,
  `idNumber` varchar(100) DEFAULT NULL,
  `employeeId` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `emergencyContact` text DEFAULT NULL,
  `ipAddress` varchar(50) DEFAULT NULL,
  `deviceType` varchar(50) DEFAULT NULL,
  `accountStatus` varchar(50) DEFAULT 'Pending',
  `referralSource` varchar(100) DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `profilePicture` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`uid`, `email`, `displayName`, `role`, `phoneNumber`, `passwordHash`, `dateOfBirth`, `nationality`, `idType`, `idNumber`, `employeeId`, `department`, `emergencyContact`, `ipAddress`, `deviceType`, `accountStatus`, `referralSource`, `createdAt`, `profilePicture`) VALUES
('1f9c0880-883b-43ed-80f7-7286e6fad2c3', 'cyclingbaby10@gmail.com', 'Cycling Baby', 'guest', '0745330829', '$2b$10$7mOrQgfBHqha9tCgj2aDvOxyrwEErjJ2eCugiXnOP30AT/bsP7H16', '2026-04-24', 'ugandan', 'Passport', 'asw2568456', NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, '2026-04-24T08:49:56.199Z', NULL),
('4048cc48-53e0-4b39-b019-6f5a2e523ccf', 'testadmin@example.com', 'Test Admin', 'admin', NULL, '$2b$10$tmlPw7X9uy2XaxltcETq9e57BOQlsYRWShM4vAXnTw1rsyzxTHk6i', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, '2026-04-28T16:23:26.353Z', NULL),
('a6f4edea-f4d2-479d-a335-b525d0afff25', 'nakibuulekirabo@gmail.com', 'Nakibuule Kirabo', 'guest', '0745330829', '$2b$10$ZNW0ABSFWdShoxGq6xDBFOGHPn2XYqk20c7lKihszPax9wttSCE0G', '2008-02-27', 'ugandan', 'National ID', '4544364csad6s4d', NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, '2026-04-27T07:38:38.517Z', NULL),
('admin_seeded_12345', 'stuartdonsms@gmail.com', 'Stuart Admin', 'admin', NULL, '$2b$10$/kqIJ3hnf2vdQfsEMI0i7emohVSsHLBXartRYc46wUvAQnI5EdHuK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-04-17T12:00:00.000Z', NULL),
('f6ec148a-33f3-4e6c-a6fd-a4c7dff1155a', 'testadmin2@example.com', 'Test Admin 2', 'admin', NULL, '$2b$10$n3kd0rzdmwTawuCLQYIwXOhCYlfSsnubQLVudmjtvKyOdiF07Pao.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, '2026-04-28T16:23:37.553Z', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `concierge_messages`
--
ALTER TABLE `concierge_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `itemName` (`itemName`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservationId` (`reservationId`),
  ADD KEY `guestId` (`guestId`);

--
-- Indexes for table `maintenance_reports`
--
ALTER TABLE `maintenance_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `roomId` (`roomId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`);

--
-- Indexes for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`),
  ADD KEY `roomId` (`roomId`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`);

--
-- Indexes for table `room_service_orders`
--
ALTER TABLE `room_service_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`),
  ADD KEY `reservationId` (`reservationId`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`),
  ADD KEY `roomId` (`roomId`);

--
-- Indexes for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guestId` (`guestId`);

--
-- Indexes for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staffId` (`staffId`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adminId` (`adminId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `concierge_messages`
--
ALTER TABLE `concierge_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `maintenance_reports`
--
ALTER TABLE `maintenance_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `room_service_orders`
--
ALTER TABLE `room_service_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `concierge_messages`
--
ALTER TABLE `concierge_messages`
  ADD CONSTRAINT `concierge_messages_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`);

--
-- Constraints for table `maintenance_reports`
--
ALTER TABLE `maintenance_reports`
  ADD CONSTRAINT `maintenance_reports_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `room_service_orders`
--
ALTER TABLE `room_service_orders`
  ADD CONSTRAINT `room_service_orders_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`),
  ADD CONSTRAINT `room_service_orders_ibfk_2` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`);

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`),
  ADD CONSTRAINT `service_requests_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  ADD CONSTRAINT `spa_bookings_ibfk_1` FOREIGN KEY (`guestId`) REFERENCES `users` (`uid`);

--
-- Constraints for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD CONSTRAINT `staff_schedules_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `users` (`uid`);

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `users` (`uid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
