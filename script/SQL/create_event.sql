CREATE EVENT IF NOT EXISTS delete_past_off_days
ON SCHEDULE EVERY 3 MONTH
DO
  DELETE FROM booking_system.off_day
  WHERE `date` < CURDATE();