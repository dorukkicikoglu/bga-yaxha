-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Apr 27, 2025 at 08:49 PM
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

UPDATE `global` SET `global_value` = '1' WHERE `global`.`global_id` = 20;
DROP TABLE IF EXISTS cubes;

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
(5, 'cube', 0, 'pyramid', 2367142, 0, 2, -1, 1, NULL),
(6, 'cube', 0, 'pyramid', 2367145, 0, 1, 0, 1, NULL),
(7, 'cube', 0, 'pyramid', 2367145, 0, 2, 2, 1, NULL),
(8, 'cube', 0, 'market', 0, 0, NULL, NULL, NULL, NULL),
(9, 'cube', 0, 'pyramid', 2367145, 0, 3, 1, 0, NULL),
(10, 'cube', 0, 'market', 1, 0, NULL, NULL, NULL, NULL),
(11, 'cube', 0, 'pyramid', 2367145, 0, 1, 2, 1, NULL),
(12, 'cube', 0, 'pyramid', 2367143, 0, 0, 0, 0, NULL),
(13, 'cube', 0, 'pyramid', 2367143, 0, -2, 1, 0, NULL),
(14, 'cube', 0, 'pyramid', 2367145, 0, 2, 2, 0, NULL),
(15, 'cube', 0, 'pyramid', 2367144, 0, 2, 2, 0, NULL),
(16, 'cube', 0, 'pyramid', 2367143, 0, -1, 1, 0, NULL),
(17, 'cube', 0, 'pyramid', 2367144, 0, -1, 0, 0, NULL),
(18, 'cube', 0, 'pyramid', 2367143, 0, -1, 2, 0, NULL),
(19, 'cube', 0, 'pyramid', 2367143, 0, -1, -1, 0, NULL),
(20, 'cube', 0, 'pyramid', 2367143, 0, -1, -1, 1, NULL),
(21, 'cube', 0, 'pyramid', 2367142, 0, 1, 1, 1, NULL),
(22, 'cube', 0, 'pyramid', 2367145, 0, 3, 0, 0, NULL),
(23, 'cube', 0, 'pyramid', 2367145, 0, 1, 1, 2, NULL),
(24, 'cube', 0, 'pyramid', 2367142, 0, 3, 2, 0, NULL),
(25, 'cube', 0, 'pyramid', 2367144, 1, 0, 0, 0, NULL),
(26, 'cube', 0, 'pyramid', 2367145, 1, 0, 1, 2, NULL),
(27, 'cube', 0, 'pyramid', 2367145, 1, 0, 0, 0, NULL),
(28, 'cube', 0, 'pyramid', 2367142, 1, 1, 0, 2, NULL),
(29, 'cube', 0, 'pyramid', 2367142, 1, 1, 2, 0, NULL),
(30, 'cube', 0, 'pyramid', 2367145, 1, 1, 3, 0, NULL),
(31, 'cube', 0, 'pyramid', 2367144, 1, 0, 0, 1, NULL),
(32, 'cube', 0, 'market', 2, 1, NULL, NULL, NULL, NULL),
(33, 'cube', 0, 'pyramid', 2367142, 1, 0, 0, 0, NULL),
(34, 'cube', 0, 'pyramid', 2367144, 1, -1, 0, 1, NULL),
(35, 'cube', 0, 'pyramid', 2367144, 1, 0, 1, 1, NULL),
(36, 'cube', 0, 'pyramid', 2367144, 1, 0, 1, 2, NULL),
(37, 'cube', 0, 'pyramid', 2367143, 1, 1, -1, 0, NULL),
(38, 'cube', 0, 'pyramid', 2367144, 1, 1, 2, 0, NULL),
(39, 'cube', 0, 'pyramid', 2367142, 1, 2, 1, 1, NULL),
(40, 'cube', 0, 'pyramid', 2367142, 1, 1, 0, 1, NULL),
(41, 'cube', 0, 'pyramid', 2367143, 1, -2, 2, 0, NULL),
(42, 'cube', 0, 'pyramid', 2367143, 1, 0, 0, 1, NULL),
(43, 'cube', 0, 'market', 0, 1, NULL, NULL, NULL, NULL),
(44, 'cube', 0, 'pyramid', 2367143, 1, -1, 0, 1, NULL),
(45, 'cube', 0, 'pyramid', 2367144, 1, -1, 2, 1, NULL),
(46, 'cube', 0, 'pyramid', 2367143, 1, 0, 1, 1, NULL),
(47, 'cube', 0, 'pyramid', 2367145, 1, 0, 0, 1, NULL),
(48, 'cube', 0, 'pyramid', 2367144, 1, 0, 1, 0, NULL),
(49, 'cube', 0, 'pyramid', 2367144, 2, 2, 3, 0, NULL),
(50, 'cube', 0, 'pyramid', 2367144, 2, -1, 1, 0, NULL),
(51, 'cube', 0, 'pyramid', 2367142, 2, 0, 2, 0, NULL),
(52, 'cube', 0, 'pyramid', 2367145, 2, 1, 0, 0, NULL),
(53, 'cube', 0, 'pyramid', 2367143, 2, -2, -1, 0, NULL),
(54, 'cube', 0, 'pyramid', 2367145, 2, 0, 2, 0, NULL),
(55, 'cube', 0, 'pyramid', 2367143, 2, -2, -1, 1, NULL),
(56, 'cube', 0, 'pyramid', 2367145, 2, 2, 1, 0, NULL),
(57, 'cube', 0, 'pyramid', 2367143, 2, 1, 1, 0, NULL),
(58, 'cube', 0, 'pyramid', 2367145, 2, 1, 2, 0, NULL),
(59, 'cube', 0, 'pyramid', 2367142, 2, 0, 1, 0, NULL),
(60, 'cube', 0, 'pyramid', 2367142, 2, 2, 0, 1, NULL),
(61, 'cube', 0, 'pyramid', 2367145, 2, 2, 0, 0, NULL),
(62, 'cube', 0, 'pyramid', 2367144, 2, 1, 1, 1, NULL),
(63, 'cube', 0, 'pyramid', 2367144, 2, 2, 1, 0, NULL),
(64, 'cube', 0, 'pyramid', 2367144, 2, 2, 0, 0, NULL),
(65, 'cube', 0, 'pyramid', 2367144, 2, 0, 2, 0, NULL),
(66, 'cube', 0, 'pyramid', 2367142, 2, 0, -1, 1, NULL),
(67, 'cube', 0, 'pyramid', 2367143, 2, -1, 1, 1, NULL),
(68, 'cube', 0, 'pyramid', 2367145, 2, 0, 0, 2, NULL),
(69, 'cube', 0, 'market', 2, 2, NULL, NULL, NULL, NULL),
(70, 'cube', 0, 'pyramid', 2367145, 2, 0, 1, 1, NULL),
(71, 'cube', 0, 'pyramid', 2367144, 2, -1, 1, 1, NULL),
(72, 'cube', 0, 'pyramid', 2367144, 2, 1, 0, 1, NULL),
(73, 'cube', 0, 'pyramid', 2367142, 3, 1, -1, 2, NULL),
(74, 'cube', 0, 'pyramid', 2367145, 3, 1, 1, 0, NULL),
(75, 'cube', 0, 'market', 3, 3, NULL, NULL, NULL, NULL),
(76, 'cube', 0, 'pyramid', 2367142, 3, 0, -1, 2, NULL),
(77, 'cube', 0, 'pyramid', 2367143, 3, -1, -1, 2, NULL),
(78, 'cube', 0, 'pyramid', 2367143, 3, -2, -1, 2, NULL),
(79, 'cube', 0, 'pyramid', 2367142, 3, 1, -1, 0, NULL),
(80, 'cube', 0, 'pyramid', 2367144, 3, 0, 3, 0, NULL),
(81, 'cube', 0, 'pyramid', 2367145, 3, 0, 3, 0, NULL),
(82, 'cube', 0, 'pyramid', 2367144, 3, -1, 3, 0, NULL),
(83, 'cube', 0, 'pyramid', 2367145, 3, 2, 1, 1, NULL),
(84, 'cube', 0, 'pyramid', 2367143, 3, -2, 0, 1, NULL),
(85, 'cube', 0, 'pyramid', 2367145, 3, 1, 1, 1, NULL),
(86, 'cube', 0, 'pyramid', 2367143, 3, -2, 0, 0, NULL),
(87, 'cube', 0, 'pyramid', 2367142, 3, 1, 1, 0, NULL),
(88, 'cube', 0, 'pyramid', 2367143, 3, -1, 0, 0, NULL),
(89, 'cube', 0, 'pyramid', 2367144, 3, 1, 2, 1, NULL),
(90, 'cube', 0, 'pyramid', 2367145, 3, 0, 2, 1, NULL),
(91, 'cube', 0, 'pyramid', 2367145, 3, 2, 3, 0, NULL),
(92, 'cube', 0, 'pyramid', 2367144, 3, 1, 1, 0, NULL),
(93, 'cube', 0, 'pyramid', 2367145, 3, 0, 1, 0, NULL),
(94, 'cube', 0, 'pyramid', 2367142, 3, 3, 0, 0, NULL),
(95, 'cube', 0, 'pyramid', 2367142, 3, 2, 2, 0, NULL),
(96, 'cube', 0, 'pyramid', 2367142, 3, 1, -1, 1, NULL),
(97, 'cube', 0, 'pyramid', 2367142, 4, 0, -1, 0, NULL),
(98, 'cube', 0, 'pyramid', 2367142, 4, 1, 0, 0, NULL),
(99, 'cube', 0, 'pyramid', 2367145, 4, 3, 2, 0, NULL),
(100, 'cube', 0, 'pyramid', 2367143, 4, -2, 1, 1, NULL),
(101, 'cube', 0, 'pyramid', 2367144, 4, -1, 1, 2, NULL),
(102, 'cube', 0, 'pyramid', 2367144, 4, 1, 0, 0, NULL),
(103, 'cube', 0, 'market', 1, 4, NULL, NULL, NULL, NULL),
(104, 'cube', 0, 'market', 0, 4, NULL, NULL, NULL, NULL),
(105, 'cube', 0, 'pyramid', 2367143, 4, 1, 0, 0, NULL),
(106, 'cube', 0, 'market', 3, 4, NULL, NULL, NULL, NULL),
(107, 'cube', 0, 'pyramid', 2367142, 4, 2, 1, 0, NULL),
(108, 'cube', 0, 'pyramid', 2367142, 4, 0, 0, 1, NULL),
(109, 'cube', 0, 'pyramid', 2367144, 4, -1, 2, 0, NULL),
(110, 'cube', 0, 'pyramid', 2367142, 4, 2, -1, 0, NULL),
(111, 'cube', 0, 'pyramid', 2367143, 4, 0, 1, 0, NULL),
(112, 'cube', 0, 'market', 1, 4, NULL, NULL, NULL, NULL),
(113, 'cube', 0, 'pyramid', 2367143, 4, 0, -1, 1, NULL),
(114, 'cube', 0, 'pyramid', 2367142, 4, 3, -1, 0, NULL),
(115, 'cube', 0, 'pyramid', 2367143, 4, 0, -1, 0, NULL),
(116, 'cube', 0, 'market', 3, 4, NULL, NULL, NULL, NULL),
(117, 'cube', 0, 'pyramid', 2367145, 4, 3, 3, 0, NULL),
(118, 'cube', 0, 'market', 2, 4, NULL, NULL, NULL, NULL),
(119, 'cube', 0, 'pyramid', 2367144, 4, 0, 2, 1, NULL),
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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
