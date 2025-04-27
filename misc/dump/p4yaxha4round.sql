-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Apr 27, 2025 at 08:09 PM
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
-- Database: `ebd_yaxha_709466`
--

-- --------------------------------------------------------

--
-- Table structure for table `cubes`
--

CREATE TABLE `cubes` (
  `card_id` int(10) UNSIGNED NOT NULL,
  `card_type` varchar(16) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` enum('bag','market','in_construction','pyramid') NOT NULL,
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
(1, 'cube', 0, 'pyramid', 2367144, 0, 1, 3, 0, NULL),
(2, 'cube', 0, 'pyramid', 2367142, 0, 2, 0, 0, NULL),
(3, 'cube', 0, 'pyramid', 2367142, 0, 3, 1, 0, NULL),
(4, 'cube', 0, 'pyramid', 2367143, 0, 1, 2, 0, NULL),
(5, 'cube', 0, 'bag', 72, 0, NULL, NULL, NULL, NULL),
(6, 'cube', 0, 'bag', 103, 0, NULL, NULL, NULL, NULL),
(7, 'cube', 0, 'market', 3, 0, NULL, NULL, NULL, NULL),
(8, 'cube', 0, 'bag', 110, 0, NULL, NULL, NULL, NULL),
(9, 'cube', 0, 'market', 3, 0, NULL, NULL, NULL, NULL),
(10, 'cube', 0, 'bag', 112, 0, NULL, NULL, NULL, NULL),
(11, 'cube', 0, 'pyramid', 2367145, 0, 1, 2, 1, NULL),
(12, 'cube', 0, 'pyramid', 2367143, 0, 0, 0, 0, NULL),
(13, 'cube', 0, 'market', 1, 0, NULL, NULL, NULL, NULL),
(14, 'cube', 0, 'pyramid', 2367145, 0, 2, 2, 0, NULL),
(15, 'cube', 0, 'pyramid', 2367144, 0, 2, 2, 0, NULL),
(16, 'cube', 0, 'pyramid', 2367143, 0, -1, 1, 0, NULL),
(17, 'cube', 0, 'pyramid', 2367144, 0, -1, 0, 0, NULL),
(18, 'cube', 0, 'pyramid', 2367143, 0, -1, 2, 0, NULL),
(19, 'cube', 0, 'pyramid', 2367143, 0, -1, -1, 0, NULL),
(20, 'cube', 0, 'bag', 78, 0, NULL, NULL, NULL, NULL),
(21, 'cube', 0, 'bag', 97, 0, NULL, NULL, NULL, NULL),
(22, 'cube', 0, 'bag', 77, 0, NULL, NULL, NULL, NULL),
(23, 'cube', 0, 'bag', 102, 0, NULL, NULL, NULL, NULL),
(24, 'cube', 0, 'pyramid', 2367142, 0, 3, 2, 0, NULL),
(25, 'cube', 0, 'pyramid', 2367144, 1, 0, 0, 0, NULL),
(26, 'cube', 0, 'bag', 95, 1, NULL, NULL, NULL, NULL),
(27, 'cube', 0, 'pyramid', 2367145, 1, 0, 0, 0, NULL),
(28, 'cube', 0, 'bag', 98, 1, NULL, NULL, NULL, NULL),
(29, 'cube', 0, 'bag', 84, 1, NULL, NULL, NULL, NULL),
(30, 'cube', 0, 'pyramid', 2367145, 1, 1, 3, 0, NULL),
(31, 'cube', 0, 'bag', 91, 1, NULL, NULL, NULL, NULL),
(32, 'cube', 0, 'bag', 115, 1, NULL, NULL, NULL, NULL),
(33, 'cube', 0, 'pyramid', 2367142, 1, 0, 0, 0, NULL),
(34, 'cube', 0, 'bag', 92, 1, NULL, NULL, NULL, NULL),
(35, 'cube', 0, 'market', 0, 1, NULL, NULL, NULL, NULL),
(36, 'cube', 0, 'bag', 107, 1, NULL, NULL, NULL, NULL),
(37, 'cube', 0, 'pyramid', 2367143, 1, 1, -1, 0, NULL),
(38, 'cube', 0, 'pyramid', 2367144, 1, 1, 2, 0, NULL),
(39, 'cube', 0, 'bag', 86, 1, NULL, NULL, NULL, NULL),
(40, 'cube', 0, 'market', 2, 1, NULL, NULL, NULL, NULL),
(41, 'cube', 0, 'pyramid', 2367143, 1, -2, 2, 0, NULL),
(42, 'cube', 0, 'market', 1, 1, NULL, NULL, NULL, NULL),
(43, 'cube', 0, 'bag', 109, 1, NULL, NULL, NULL, NULL),
(44, 'cube', 0, 'pyramid', 2367143, 1, -1, 0, 1, NULL),
(45, 'cube', 0, 'market', 0, 1, NULL, NULL, NULL, NULL),
(46, 'cube', 0, 'bag', 100, 1, NULL, NULL, NULL, NULL),
(47, 'cube', 0, 'pyramid', 2367145, 1, 0, 0, 1, NULL),
(48, 'cube', 0, 'pyramid', 2367144, 1, 0, 1, 0, NULL),
(49, 'cube', 0, 'pyramid', 2367144, 2, 2, 3, 0, NULL),
(50, 'cube', 0, 'pyramid', 2367144, 2, -1, 1, 0, NULL),
(51, 'cube', 0, 'bag', 96, 2, NULL, NULL, NULL, NULL),
(52, 'cube', 0, 'pyramid', 2367145, 2, 1, 0, 0, NULL),
(53, 'cube', 0, 'bag', 80, 2, NULL, NULL, NULL, NULL),
(54, 'cube', 0, 'pyramid', 2367145, 2, 0, 2, 0, NULL),
(55, 'cube', 0, 'bag', 99, 2, NULL, NULL, NULL, NULL),
(56, 'cube', 0, 'pyramid', 2367145, 2, 2, 1, 0, NULL),
(57, 'cube', 0, 'pyramid', 2367143, 2, 1, 1, 0, NULL),
(58, 'cube', 0, 'pyramid', 2367145, 2, 1, 2, 0, NULL),
(59, 'cube', 0, 'pyramid', 2367142, 2, 0, 1, 0, NULL),
(60, 'cube', 0, 'bag', 74, 2, NULL, NULL, NULL, NULL),
(61, 'cube', 0, 'bag', 94, 2, NULL, NULL, NULL, NULL),
(62, 'cube', 0, 'bag', 105, 2, NULL, NULL, NULL, NULL),
(63, 'cube', 0, 'pyramid', 2367144, 2, 2, 1, 0, NULL),
(64, 'cube', 0, 'bag', 90, 2, NULL, NULL, NULL, NULL),
(65, 'cube', 0, 'pyramid', 2367144, 2, 0, 2, 0, NULL),
(66, 'cube', 0, 'pyramid', 2367142, 2, 0, -1, 1, NULL),
(67, 'cube', 0, 'bag', 87, 2, NULL, NULL, NULL, NULL),
(68, 'cube', 0, 'bag', 104, 2, NULL, NULL, NULL, NULL),
(69, 'cube', 0, 'bag', 116, 2, NULL, NULL, NULL, NULL),
(70, 'cube', 0, 'pyramid', 2367145, 2, 0, 1, 1, NULL),
(71, 'cube', 0, 'bag', 81, 2, NULL, NULL, NULL, NULL),
(72, 'cube', 0, 'bag', 106, 2, NULL, NULL, NULL, NULL),
(73, 'cube', 0, 'bag', 85, 3, NULL, NULL, NULL, NULL),
(74, 'cube', 0, 'pyramid', 2367145, 3, 1, 1, 0, NULL),
(75, 'cube', 0, 'bag', 119, 3, NULL, NULL, NULL, NULL),
(76, 'cube', 0, 'market', 2, 3, NULL, NULL, NULL, NULL),
(77, 'cube', 0, 'bag', 79, 3, NULL, NULL, NULL, NULL),
(78, 'cube', 0, 'bag', 101, 3, NULL, NULL, NULL, NULL),
(79, 'cube', 0, 'pyramid', 2367142, 3, 1, -1, 0, NULL),
(80, 'cube', 0, 'pyramid', 2367144, 3, 0, 3, 0, NULL),
(81, 'cube', 0, 'market', 3, 3, NULL, NULL, NULL, NULL),
(82, 'cube', 0, 'pyramid', 2367144, 3, -1, 3, 0, NULL),
(83, 'cube', 0, 'bag', 93, 3, NULL, NULL, NULL, NULL),
(84, 'cube', 0, 'bag', 88, 3, NULL, NULL, NULL, NULL),
(85, 'cube', 0, 'bag', 76, 3, NULL, NULL, NULL, NULL),
(86, 'cube', 0, 'pyramid', 2367143, 3, -2, 0, 0, NULL),
(87, 'cube', 0, 'pyramid', 2367142, 3, 1, 1, 0, NULL),
(88, 'cube', 0, 'pyramid', 2367143, 3, -1, 0, 0, NULL),
(89, 'cube', 0, 'bag', 82, 3, NULL, NULL, NULL, NULL),
(90, 'cube', 0, 'bag', 75, 3, NULL, NULL, NULL, NULL),
(91, 'cube', 0, 'pyramid', 2367145, 3, 2, 3, 0, NULL),
(92, 'cube', 0, 'pyramid', 2367144, 3, 1, 1, 0, NULL),
(93, 'cube', 0, 'pyramid', 2367145, 3, 0, 1, 0, NULL),
(94, 'cube', 0, 'pyramid', 2367142, 3, 3, 0, 0, NULL),
(95, 'cube', 0, 'bag', 73, 3, NULL, NULL, NULL, NULL),
(96, 'cube', 0, 'pyramid', 2367142, 3, 1, -1, 1, NULL),
(97, 'cube', 0, 'pyramid', 2367142, 4, 0, -1, 0, NULL),
(98, 'cube', 0, 'pyramid', 2367142, 4, 1, 0, 0, NULL),
(99, 'cube', 0, 'pyramid', 2367145, 4, 3, 2, 0, NULL),
(100, 'cube', 0, 'bag', 89, 4, NULL, NULL, NULL, NULL),
(101, 'cube', 0, 'bag', 83, 4, NULL, NULL, NULL, NULL),
(102, 'cube', 0, 'pyramid', 2367144, 4, 1, 0, 0, NULL),
(103, 'cube', 0, 'bag', 111, 4, NULL, NULL, NULL, NULL),
(104, 'cube', 0, 'bag', 108, 4, NULL, NULL, NULL, NULL),
(105, 'cube', 0, 'pyramid', 2367143, 4, 1, 0, 0, NULL),
(106, 'cube', 0, 'bag', 117, 4, NULL, NULL, NULL, NULL),
(107, 'cube', 0, 'pyramid', 2367142, 4, 2, 1, 0, NULL),
(108, 'cube', 0, 'pyramid', 2367142, 4, 0, 0, 1, NULL),
(109, 'cube', 0, 'pyramid', 2367144, 4, -1, 2, 0, NULL),
(110, 'cube', 0, 'pyramid', 2367142, 4, 2, -1, 0, NULL),
(111, 'cube', 0, 'pyramid', 2367143, 4, 0, 1, 0, NULL),
(112, 'cube', 0, 'bag', 113, 4, NULL, NULL, NULL, NULL),
(113, 'cube', 0, 'market', 1, 4, NULL, NULL, NULL, NULL),
(114, 'cube', 0, 'market', 2, 4, NULL, NULL, NULL, NULL),
(115, 'cube', 0, 'pyramid', 2367143, 4, 0, -1, 0, NULL),
(116, 'cube', 0, 'bag', 118, 4, NULL, NULL, NULL, NULL),
(117, 'cube', 0, 'pyramid', 2367145, 4, 3, 3, 0, NULL),
(118, 'cube', 0, 'bag', 114, 4, NULL, NULL, NULL, NULL),
(119, 'cube', 0, 'market', 0, 4, NULL, NULL, NULL, NULL),
(120, 'cube', 0, 'pyramid', 2367143, 4, 0, 2, 0, NULL);

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
