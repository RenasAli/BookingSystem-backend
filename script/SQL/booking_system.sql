-- -----------------------------------------------------
-- Schema booking_system
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `booking_system` DEFAULT CHARACTER SET utf8mb3;
USE `booking_system`;

-- -----------------------------------------------------
-- Table `booking_system`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `role` ENUM('admin', 'company_admin', 'company_staff') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`email`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`address`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`address` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `zip_code` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`company`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`company` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `address_id` BIGINT NOT NULL,
  `cvr` VARCHAR(50) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30),
  `email` VARCHAR(255),
  `logo` VARCHAR(255),
  `confirmation_method` ENUM('confirmation_code', 'depositum') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `booking_system`.`user` (`id`),
  CONSTRAINT `fk_address_id`
    FOREIGN KEY (`address_id`)
    REFERENCES `booking_system`.`address` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`staff`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`staff` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT NOT NULL,
  `name` VARCHAR(255),
  `email` VARCHAR(255),
  `phone` VARCHAR(30),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_company_id`
    FOREIGN KEY (`company_id`)
    REFERENCES `booking_system`.`company` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`service` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DOUBLE PRECISION NOT NULL,
  `duration_minutes` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_service_company_id`
    FOREIGN KEY (`company_id`)
    REFERENCES `booking_system`.`company` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`weekday`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`weekday` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(15) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`company_workday`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`company_workday` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT NOT NULL,
  `weekday_id` BIGINT NOT NULL,
  `is_open` BOOLEAN NOT NULL,
  `open_time` TIME,
  `close_time` TIME,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_company_workday_id`
    FOREIGN KEY (`company_id`)
    REFERENCES `booking_system`.`company` (`id`),
  CONSTRAINT `fk_weekday_id`
    FOREIGN KEY (`weekday_id`)
    REFERENCES `booking_system`.`weekday` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`staff_workday`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`staff_workday` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT NOT NULL,
  `staff_id` BIGINT NOT NULL,
  `weekday_id` BIGINT NOT NULL,
  `is_active` BOOLEAN NOT NULL,
  `start_time` TIME,
  `end_time` TIME,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_staff_company_id`
    FOREIGN KEY (`company_id`)
    REFERENCES `booking_system`.`company` (`id`),
  CONSTRAINT `fk_staff_id`
    FOREIGN KEY (`staff_id`)
    REFERENCES `booking_system`.`staff` (`id`),
  CONSTRAINT `fk_staff_weekday_id`
    FOREIGN KEY (`weekday_id`)
    REFERENCES `booking_system`.`weekday` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`off_day`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`off_day` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `staff_id` BIGINT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME,
  `end_time` TIME,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_off_day_staff_id`
    FOREIGN KEY (`staff_id`)
    REFERENCES `booking_system`.`staff` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;

-- -----------------------------------------------------
-- Table `booking_system`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_system`.`booking` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT NOT NULL,
  `staff_id` BIGINT NOT NULL,
  `service_id` BIGINT ,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_booking_company_id`
    FOREIGN KEY (`company_id`)
    REFERENCES `booking_system`.`company` (`id`),
  CONSTRAINT `fk_booking_staff_id`
    FOREIGN KEY (`staff_id`)
    REFERENCES `booking_system`.`staff` (`id`),
  CONSTRAINT `fk_booking_service_id`
    FOREIGN KEY (`service_id`)
    REFERENCES `booking_system`.`service` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb3;
