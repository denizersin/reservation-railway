CREATE TABLE `guest` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`country_id` int,
	`name` varchar(256) NOT NULL,
	`surname` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`phone` varchar(256) NOT NULL,
	`phone_code` varchar(256) NOT NULL,
	`stable_phone` varchar(256),
	`gender` enum('male','female','other'),
	`birth_date` date,
	`anniversary_date` date,
	`description` varchar(256),
	`assistant_name` varchar(256),
	`assistant_phone` varchar(256),
	`assistant_email` varchar(256),
	`is_contact_assistant` boolean NOT NULL DEFAULT false,
	`company_id` int,
	`position` varchar(256),
	`department` varchar(256),
	`is_vip` boolean NOT NULL DEFAULT false,
	`vip_level` enum('Big Spender','Good Spender','Low Spender','Regular Customer','Potential Customer','Black List','Lost Customer'),
	`is_send_sms_and_email` boolean NOT NULL DEFAULT true,
	`is_send_confirmation_notifs` boolean NOT NULL DEFAULT true,
	`is_claim_provision` boolean NOT NULL DEFAULT true,
	`is_send_review_notifs` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guest_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guest_tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_id` int NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `guest_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guest_company` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`company_name` varchar(256) NOT NULL,
	`phone` varchar(256),
	`email` varchar(256),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guest_company_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`phone` varchar(256),
	`email` varchar(256),
	`birth_date` date,
	`special_id` varchar(256),
	CONSTRAINT `personel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`revoked_at` timestamp DEFAULT NULL,
	`ip_address` varchar(45) DEFAULT NULL,
	`user_agent` varchar(255) DEFAULT NULL,
	CONSTRAINT `refresh_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_refresh_token_and_user_id` UNIQUE(`token`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` enum('admin','owner','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_personal_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`sound_for_notifications` boolean NOT NULL DEFAULT false,
	`reservation_listing_type` enum('smartList','newestOnTop') NOT NULL DEFAULT 'smartList',
	`guest_selection_side` enum('left','right') NOT NULL DEFAULT 'left',
	`corporate_information_selectable` boolean NOT NULL DEFAULT false,
	`open_reservation_window_on_call` boolean NOT NULL DEFAULT false,
	`open_reservation_window_full_screen` boolean NOT NULL DEFAULT true,
	`reservation_screen_follow_main_calendar` boolean NOT NULL DEFAULT true,
	`hide_daily_summary_section` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_personal_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_personal_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(255) NOT NULL,
	`owner_id` int NOT NULL,
	CONSTRAINT `restaurant_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_language` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	CONSTRAINT `restaurant_language_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_restaurant_language` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_translation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_code` enum('en','tr','de') NOT NULL DEFAULT 'tr',
	`description` varchar(500) NOT NULL,
	CONSTRAINT `restaurant_translation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_general_setting` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`is_auto_check_out` boolean NOT NULL,
	`new_reservation_state_id` int NOT NULL DEFAULT 2,
	`default_language_id` int NOT NULL,
	`default_country_id` int NOT NULL,
	`table_view` enum('standartTable','floorPlan') NOT NULL DEFAULT 'standartTable',
	`prepayment_price_per_guest` int NOT NULL,
	CONSTRAINT `restaurant_general_setting_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `country` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`code` varchar(10) NOT NULL,
	`phone_code` varchar(10) NOT NULL,
	CONSTRAINT `country_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language_code` enum('en','tr','de') NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_rtl` boolean NOT NULL,
	CONSTRAINT `language_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('breakfast','lunch','dinner','bar') NOT NULL,
	CONSTRAINT `meal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_existance_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('not exist','waiting table','in restaurant','checked out') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_existance_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_prepayment_type` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('prepayment','none') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_prepayment_type_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	CONSTRAINT `restaurant_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_tag_translation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tag_id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`code` varchar(10) NOT NULL,
	`language_id` int NOT NULL,
	CONSTRAINT `restaurant_tag_translation_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_tag_translation` UNIQUE(`tag_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `meal_hours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meal_id` int NOT NULL,
	`restaurant_id` int NOT NULL,
	`hour` time NOT NULL,
	`is_open` boolean NOT NULL,
	CONSTRAINT `meal_hours_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meal_hours` UNIQUE(`meal_id`,`hour`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_meal_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meal_id` int NOT NULL,
	`restaurant_id` int NOT NULL,
	`day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`is_open` boolean NOT NULL,
	CONSTRAINT `restaurant_meal_days_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meal_day` UNIQUE(`meal_id`,`restaurant_id`,`day`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meal_id` int NOT NULL,
	`restaurant_id` int NOT NULL,
	CONSTRAINT `restaurant_meals_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meal_and_restaurant` UNIQUE(`meal_id`,`restaurant_id`)
);
--> statement-breakpoint
CREATE TABLE `prepayment_message` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`prepayment_message` text,
	`prepayment_cancellation_message` text,
	`prepayment_reminder_message` text,
	`prepayment_refund_message` text,
	`prepayment_received_message` text,
	`account_payment_request_message` text,
	`account_payment_success_message` text,
	CONSTRAINT `prepayment_message_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_prepayment_message` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `provision_message` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`provision_message` text,
	`provision_reminder_message` text,
	`provision_received_message` text,
	`provision_cancellation_message` text,
	`provision_refund_message` text,
	`provision_charge_message` text,
	`charge_refund_message` text,
	CONSTRAINT `provision_message_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_provision_message` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_message` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`new_reservation_message` text,
	`date_time_change_message` text,
	`guest_count_change_message` text,
	`reservation_cancellation_message` text,
	`reservation_cancellation_with_reason_message` text,
	`reservation_confirmation_request_message` text,
	`reservation_confirmed_message` text,
	`reservation_reminder_message` text,
	`reservation_feedback_request_message` text,
	`cake_received_message` text,
	`flower_received_message` text,
	CONSTRAINT `reservation_message_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_reservation_message` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_texts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`reservation_requirements` text,
	`dress_code` text,
	`agreements` text,
	CONSTRAINT `restaurant_texts_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_restaurant_texts` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist_message` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_id` int NOT NULL,
	`added_to_waitlist_message` text,
	`added_to_waitlist_walkin_message` text,
	`called_from_waitlist_message` text,
	CONSTRAINT `waitlist_message_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_waitlist_message` UNIQUE(`restaurant_id`,`language_id`)
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`order` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_waiting_room` boolean DEFAULT false,
	`layout_width` int NOT NULL DEFAULT 1200,
	`layout_row_height` int NOT NULL DEFAULT 120,
	CONSTRAINT `room_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room_translation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` varchar(256),
	`language_id` int NOT NULL,
	CONSTRAINT `room_translation_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_room_translation` UNIQUE(`language_id`,`room_id`)
);
--> statement-breakpoint
CREATE TABLE `table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int NOT NULL,
	`no` varchar(256) NOT NULL,
	`order` int NOT NULL,
	`min_capacity` int NOT NULL,
	`max_capacity` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`shape` enum('square','rectangle','round') NOT NULL DEFAULT 'rectangle',
	`is_active` boolean NOT NULL DEFAULT true,
	`x` int DEFAULT 0,
	`y` int DEFAULT 0,
	`h` int DEFAULT 1,
	`w` int DEFAULT 1,
	CONSTRAINT `table_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_table` UNIQUE(`room_id`,`no`)
);
--> statement-breakpoint
CREATE TABLE `permanent_limitation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`room_id` int,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	CONSTRAINT `permanent_limitation_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_permanent_limitation` UNIQUE(`restaurant_id`,`room_id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_limitation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),
	`meal_id` int NOT NULL,
	`room_id` int,
	`hour` time NOT NULL,
	`min_hour` time NOT NULL,
	`max_hour` time NOT NULL,
	`max_table_count` int NOT NULL,
	`max_guest_count` int NOT NULL,
	`is_daily` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_limitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`room_id` int NOT NULL,
	`guest_id` int NOT NULL,
	`restaurant_meal_id` int NOT NULL,
	`reservation_status_id` int NOT NULL,
	`reservation_existence_status_id` int NOT NULL DEFAULT 1,
	`assigned_personal_id` int,
	`current_prepayment_id` int,
	`bill_payment_id` int,
	`linked_reservation_id` int,
	`waiting_session_id` int NOT NULL,
	`invoice_id` int,
	`created_owner_id` int,
	`is_created_by_owner` boolean NOT NULL DEFAULT false,
	`is_checked_in` boolean NOT NULL DEFAULT false,
	`confirmed_by` varchar(255),
	`confirmed_at` timestamp,
	`checkedin_at` timestamp,
	`entered_main_table_at` timestamp,
	`checkedout_at` timestamp,
	`canceled_by` varchar(255),
	`canceled_at` timestamp,
	`prepayment_type_id` int NOT NULL,
	`holded_at` timestamp,
	`hold_expired_at` timestamp,
	`reservation_date` timestamp NOT NULL,
	`guest_note` text,
	`reservation_time` time NOT NULL,
	`guest_count` int NOT NULL,
	`is_send_sms` boolean NOT NULL,
	`is_send_email` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`table_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_tables_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_reservation_table_unique` UNIQUE(`reservation_id`,`table_id`)
);
--> statement-breakpoint
CREATE TABLE `waiting_session_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`waiting_session_id` int NOT NULL,
	`table_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `waiting_session_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waiting_table_session` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int,
	`is_in_waiting` boolean NOT NULL DEFAULT false,
	`entered_at` timestamp,
	`exited_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `waiting_table_session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_bill_payment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_bill_payment_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_reservation_id` UNIQUE(`reservation_id`)
);
--> statement-breakpoint
CREATE TABLE `prepayment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`amount` int NOT NULL,
	`is_default_amount` boolean NOT NULL DEFAULT false,
	`status` enum('pending','success','cancelled','failed') NOT NULL DEFAULT 'pending',
	`paid_at` timestamp,
	`created_by` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `prepayment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_notification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`type` enum('SMS','EMAIL') NOT NULL,
	`notification_message_type` enum('NewReservation','DateTime Change','Guest Count Change','Reservation Cancellation','Reservation Confirmation Request','Reservation Confirmed','Reservation Completed','Reservation Reminder','Reservation Feedback','Notified For Prepayment','Asked For Prepayment','Reservation Created','Reservation Date Change','Reservation Time Change','Reservation Guest Count Change') NOT NULL,
	`message` text NOT NULL,
	`sent_at` timestamp,
	`status` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`message` text NOT NULL,
	`process_owner` varchar(50) NOT NULL,
	`log_time` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_note` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`note` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_note_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tag_id` int NOT NULL,
	`reservation_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reservation_tag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('draft','reservation','prepayment','confirmation','cancel','confirmed','completed','holding') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_status_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`status_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_status_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `confirmation_request` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(255) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `confirmation_request_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_holding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`holded_table_id` int NOT NULL,
	`holded_at` timestamp NOT NULL DEFAULT (now()),
	`holding_date` timestamp NOT NULL,
	`guest_count` int NOT NULL,
	`room_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`restaurant_id` int NOT NULL,
	`meal_id` int NOT NULL,
	CONSTRAINT `reservation_holding_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_table_id` UNIQUE(`holded_table_id`,`holding_date`)
);
--> statement-breakpoint
CREATE TABLE `meal_day` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meal_id` int NOT NULL,
	`day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_day_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meal_day` UNIQUE(`meal_id`,`day`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`invoice_type` varchar(20) NOT NULL,
	`invoice_first_name` varchar(256),
	`invoice_last_name` varchar(256),
	`invoice_phone_code` varchar(10),
	`invoice_phone` varchar(20),
	`city` varchar(100),
	`district` varchar(100),
	`neighbourhood` varchar(100),
	`address` varchar(500),
	`company_name` varchar(256),
	`tax_identification_number` varchar(50),
	`tax_office` varchar(256),
	`is_e_invoice_taxpayer` boolean DEFAULT false,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_tables` ADD CONSTRAINT `reservation_tables_reservation_id_reservation_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiting_session_tables` ADD CONSTRAINT `waiting_session_tables_table_id_table_id_fk` FOREIGN KEY (`table_id`) REFERENCES `table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiting_table_session` ADD CONSTRAINT `waiting_table_session_reservation_id_reservation_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prepayment` ADD CONSTRAINT `prepayment_reservation_id_reservation_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confirmation_request` ADD CONSTRAINT `confirmation_request_reservation_id_reservation_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_guest_lookup` ON `guest` (`restaurant_id`,`email`,`phone`);--> statement-breakpoint
CREATE INDEX `idx_meal_hours_lookup` ON `meal_hours` (`restaurant_id`,`meal_id`,`is_open`,`hour`);--> statement-breakpoint
CREATE INDEX `idx_room_status` ON `room` (`restaurant_id`,`is_active`,`is_waiting_room`);--> statement-breakpoint
CREATE INDEX `idx_table_status` ON `table` (`room_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_limitation_lookup` ON `reservation_limitation` (`hour`,`room_id`,`is_active`,`restaurant_id`,`meal_id`);--> statement-breakpoint
CREATE INDEX `idx_reservation_lookup` ON `reservation` (`reservation_date`,`reservation_status_id`,`restaurant_id`,`restaurant_meal_id`);--> statement-breakpoint
CREATE INDEX `idx_reservation_table_lookup` ON `reservation_tables` (`table_id`,`reservation_id`);