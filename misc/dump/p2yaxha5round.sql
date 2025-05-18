-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: May 18, 2025 at 05:05 PM
-- Server version: 5.7.44-log
-- PHP Version: 8.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebd_yaxha_711957`
--

-- --------------------------------------------------------

--
-- Table structure for table `cubes`
--

CREATE TABLE `cubes` (
  `card_id` int(10) UNSIGNED NOT NULL,
  `card_type` varchar(16) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` enum('bag','market','pyramid','to_discard','discarded') NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  `color` tinyint(4) NOT NULL,
  `pos_x` tinyint(4) DEFAULT NULL,
  `pos_y` tinyint(4) DEFAULT NULL,
  `pos_z` tinyint(4) DEFAULT NULL,
  `order_in_construction` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cubes`
--

INSERT INTO `cubes` (`card_id`, `card_type`, `card_type_arg`, `card_location`, `card_location_arg`, `color`, `pos_x`, `pos_y`, `pos_z`, `order_in_construction`) VALUES
(1, 'cube', 0, 'bag', 100, 0, NULL, NULL, NULL, NULL),
(2, 'cube', 0, 'bag', 67, 0, NULL, NULL, NULL, NULL),
(3, 'cube', 0, 'bag', 41, 0, NULL, NULL, NULL, NULL),
(4, 'cube', 0, 'bag', 91, 0, NULL, NULL, NULL, NULL),
(5, 'cube', 0, 'pyramid', 2367142, 0, 3, 0, 0, 1),
(6, 'cube', 0, 'bag', 37, 0, NULL, NULL, NULL, NULL),
(7, 'cube', 0, 'bag', 94, 0, NULL, NULL, NULL, NULL),
(8, 'cube', 0, 'bag', 63, 0, NULL, NULL, NULL, NULL),
(9, 'cube', 0, 'bag', 76, 0, NULL, NULL, NULL, NULL),
(10, 'cube', 0, 'pyramid', 2367142, 0, 0, 0, 0, NULL),
(11, 'cube', 0, 'bag', 50, 0, NULL, NULL, NULL, NULL),
(12, 'cube', 0, 'bag', 69, 0, NULL, NULL, NULL, NULL),
(13, 'cube', 0, 'bag', 106, 0, NULL, NULL, NULL, NULL),
(14, 'cube', 0, 'pyramid', 2367143, 0, 0, 2, 1, NULL),
(15, 'cube', 0, 'pyramid', 2367143, 0, 0, 3, 0, NULL),
(16, 'cube', 0, 'bag', 93, 0, NULL, NULL, NULL, NULL),
(17, 'cube', 0, 'bag', 66, 0, NULL, NULL, NULL, NULL),
(18, 'cube', 0, 'pyramid', 2367142, 0, 1, 0, 0, NULL),
(19, 'cube', 0, 'bag', 88, 0, NULL, NULL, NULL, NULL),
(20, 'cube', 0, 'bag', 73, 0, NULL, NULL, NULL, NULL),
(21, 'cube', 0, 'bag', 42, 0, NULL, NULL, NULL, NULL),
(22, 'cube', 0, 'bag', 89, 0, NULL, NULL, NULL, NULL),
(23, 'cube', 0, 'bag', 40, 0, NULL, NULL, NULL, NULL),
(24, 'cube', 0, 'bag', 97, 0, NULL, NULL, NULL, NULL),
(25, 'cube', 0, 'bag', 87, 1, NULL, NULL, NULL, NULL),
(26, 'cube', 0, 'bag', 92, 1, NULL, NULL, NULL, NULL),
(27, 'cube', 0, 'pyramid', 2367142, 1, 1, 0, 1, NULL),
(28, 'cube', 0, 'pyramid', 2367143, 1, 0, 1, 0, NULL),
(29, 'cube', 0, 'bag', 95, 1, NULL, NULL, NULL, NULL),
(30, 'cube', 0, 'bag', 96, 1, NULL, NULL, NULL, NULL),
(31, 'cube', 0, 'pyramid', 2367143, 1, 2, 2, 0, NULL),
(32, 'cube', 0, 'bag', 68, 1, NULL, NULL, NULL, NULL),
(33, 'cube', 0, 'pyramid', 2367143, 1, -1, 3, 0, NULL),
(34, 'cube', 0, 'bag', 99, 1, NULL, NULL, NULL, NULL),
(35, 'cube', 0, 'pyramid', 2367142, 1, 0, 0, 1, NULL),
(36, 'cube', 0, 'bag', 61, 1, NULL, NULL, NULL, NULL),
(37, 'cube', 0, 'pyramid', 2367142, 1, 1, 1, 0, NULL),
(38, 'cube', 0, 'bag', 119, 1, NULL, NULL, NULL, NULL),
(39, 'cube', 0, 'bag', 77, 1, NULL, NULL, NULL, NULL),
(40, 'cube', 0, 'bag', 47, 1, NULL, NULL, NULL, NULL),
(41, 'cube', 0, 'bag', 55, 1, NULL, NULL, NULL, NULL),
(42, 'cube', 0, 'pyramid', 2367143, 1, 0, 2, 0, NULL),
(43, 'cube', 0, 'bag', 30, 1, NULL, NULL, NULL, NULL),
(44, 'cube', 0, 'bag', 57, 1, NULL, NULL, NULL, NULL),
(45, 'cube', 0, 'bag', 113, 1, NULL, NULL, NULL, NULL),
(46, 'cube', 0, 'pyramid', 2367142, 1, 2, 1, 0, NULL),
(47, 'cube', 0, 'bag', 80, 1, NULL, NULL, NULL, NULL),
(48, 'cube', 0, 'pyramid', 2367142, 1, 1, 2, 0, NULL),
(49, 'cube', 0, 'bag', 53, 2, NULL, NULL, NULL, NULL),
(50, 'cube', 0, 'bag', 82, 2, NULL, NULL, NULL, NULL),
(51, 'cube', 0, 'bag', 109, 2, NULL, NULL, NULL, NULL),
(52, 'cube', 0, 'pyramid', 2367142, 2, 1, 1, 1, NULL),
(53, 'cube', 0, 'bag', 59, 2, NULL, NULL, NULL, NULL),
(54, 'cube', 0, 'bag', 51, 2, NULL, NULL, NULL, NULL),
(55, 'cube', 0, 'bag', 49, 2, NULL, NULL, NULL, NULL),
(56, 'cube', 0, 'bag', 81, 2, NULL, NULL, NULL, NULL),
(57, 'cube', 0, 'bag', 71, 2, NULL, NULL, NULL, NULL),
(58, 'cube', 0, 'bag', 83, 2, NULL, NULL, NULL, NULL),
(59, 'cube', 0, 'pyramid', 2367143, 2, 2, 3, 0, NULL),
(60, 'cube', 0, 'bag', 44, 2, NULL, NULL, NULL, NULL),
(61, 'cube', 0, 'bag', 102, 2, NULL, NULL, NULL, NULL),
(62, 'cube', 0, 'bag', 110, 2, NULL, NULL, NULL, NULL),
(63, 'cube', 0, 'bag', 101, 2, NULL, NULL, NULL, NULL),
(64, 'cube', 0, 'pyramid', 2367143, 2, 1, 1, 0, 1),
(65, 'cube', 0, 'pyramid', 2367142, 2, 2, 2, 0, NULL),
(66, 'cube', 0, 'bag', 64, 2, NULL, NULL, NULL, NULL),
(67, 'cube', 0, 'bag', 118, 2, NULL, NULL, NULL, NULL),
(68, 'cube', 0, 'bag', 39, 2, NULL, NULL, NULL, NULL),
(69, 'cube', 0, 'pyramid', 2367143, 2, 1, 2, 0, NULL),
(70, 'cube', 0, 'pyramid', 2367142, 2, 3, 1, 0, 2),
(71, 'cube', 0, 'bag', 32, 2, NULL, NULL, NULL, NULL),
(72, 'cube', 0, 'bag', 54, 2, NULL, NULL, NULL, NULL),
(73, 'cube', 0, 'pyramid', 2367142, 3, 0, 1, 0, NULL),
(74, 'cube', 0, 'bag', 74, 3, NULL, NULL, NULL, NULL),
(75, 'cube', 0, 'pyramid', 2367143, 3, 0, 0, 0, NULL),
(76, 'cube', 0, 'bag', 48, 3, NULL, NULL, NULL, NULL),
(77, 'cube', 0, 'bag', 104, 3, NULL, NULL, NULL, NULL),
(78, 'cube', 0, 'bag', 108, 3, NULL, NULL, NULL, NULL),
(79, 'cube', 0, 'bag', 75, 3, NULL, NULL, NULL, NULL),
(80, 'cube', 0, 'pyramid', 2367142, 3, 2, 0, 1, 3),
(81, 'cube', 0, 'bag', 105, 3, NULL, NULL, NULL, NULL),
(82, 'cube', 0, 'bag', 103, 3, NULL, NULL, NULL, NULL),
(83, 'cube', 0, 'bag', 114, 3, NULL, NULL, NULL, NULL),
(84, 'cube', 0, 'bag', 84, 3, NULL, NULL, NULL, NULL),
(85, 'cube', 0, 'bag', 46, 3, NULL, NULL, NULL, NULL),
(86, 'cube', 0, 'pyramid', 2367143, 3, 2, 1, 0, 2),
(87, 'cube', 0, 'bag', 62, 3, NULL, NULL, NULL, NULL),
(88, 'cube', 0, 'bag', 38, 3, NULL, NULL, NULL, NULL),
(89, 'cube', 0, 'bag', 115, 3, NULL, NULL, NULL, NULL),
(90, 'cube', 0, 'bag', 52, 3, NULL, NULL, NULL, NULL),
(91, 'cube', 0, 'bag', 36, 3, NULL, NULL, NULL, NULL),
(92, 'cube', 0, 'pyramid', 2367142, 3, 2, 0, 0, NULL),
(93, 'cube', 0, 'bag', 70, 3, NULL, NULL, NULL, NULL),
(94, 'cube', 0, 'pyramid', 2367143, 3, -1, 2, 0, NULL),
(95, 'cube', 0, 'bag', 98, 3, NULL, NULL, NULL, NULL),
(96, 'cube', 0, 'pyramid', 2367143, 3, 1, 1, 1, 3),
(97, 'cube', 0, 'bag', 86, 4, NULL, NULL, NULL, NULL),
(98, 'cube', 0, 'bag', 58, 4, NULL, NULL, NULL, NULL),
(99, 'cube', 0, 'bag', 35, 4, NULL, NULL, NULL, NULL),
(100, 'cube', 0, 'bag', 85, 4, NULL, NULL, NULL, NULL),
(101, 'cube', 0, 'bag', 65, 4, NULL, NULL, NULL, NULL),
(102, 'cube', 0, 'bag', 45, 4, NULL, NULL, NULL, NULL),
(103, 'cube', 0, 'bag', 60, 4, NULL, NULL, NULL, NULL),
(104, 'cube', 0, 'bag', 90, 4, NULL, NULL, NULL, NULL),
(105, 'cube', 0, 'bag', 107, 4, NULL, NULL, NULL, NULL),
(106, 'cube', 0, 'bag', 79, 4, NULL, NULL, NULL, NULL),
(107, 'cube', 0, 'pyramid', 2367143, 4, 1, 3, 0, NULL),
(108, 'cube', 0, 'bag', 111, 4, NULL, NULL, NULL, NULL),
(109, 'cube', 0, 'bag', 116, 4, NULL, NULL, NULL, NULL),
(110, 'cube', 0, 'bag', 33, 4, NULL, NULL, NULL, NULL),
(111, 'cube', 0, 'bag', 56, 4, NULL, NULL, NULL, NULL),
(112, 'cube', 0, 'bag', 117, 4, NULL, NULL, NULL, NULL),
(113, 'cube', 0, 'bag', 34, 4, NULL, NULL, NULL, NULL),
(114, 'cube', 0, 'bag', 31, 4, NULL, NULL, NULL, NULL),
(115, 'cube', 0, 'bag', 72, 4, NULL, NULL, NULL, NULL),
(116, 'cube', 0, 'bag', 112, 4, NULL, NULL, NULL, NULL),
(117, 'cube', 0, 'pyramid', 2367142, 4, 2, 3, 0, NULL),
(118, 'cube', 0, 'bag', 78, 4, NULL, NULL, NULL, NULL),
(119, 'cube', 0, 'bag', 43, 4, NULL, NULL, NULL, NULL),
(120, 'cube', 0, 'pyramid', 2367143, 4, 1, 2, 1, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cubes`
--
ALTER TABLE `cubes`
  ADD PRIMARY KEY (`card_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cubes`
--
ALTER TABLE `cubes`
  MODIFY `card_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
