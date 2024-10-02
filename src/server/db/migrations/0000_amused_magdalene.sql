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
	`language_code` varchar(10) NOT NULL,
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
CREATE TABLE `reservation_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('draft','reservation','provision','confirmation','cancel','wait approve') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_status_id` PRIMARY KEY(`id`)
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
CREATE TABLE `restaurant_general_setting` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`is_auto_check_out` boolean NOT NULL,
	`new_reservation_state_id` int NOT NULL,
	`default_language_id` int NOT NULL,
	`default_country_id` int NOT NULL,
	`table_view` enum('standartTable','floorPlan') NOT NULL DEFAULT 'standartTable',
	CONSTRAINT `restaurant_general_setting_id` PRIMARY KEY(`id`)
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
	`language_code` enum('en','tr') NOT NULL DEFAULT 'tr',
	`description` varchar(500) NOT NULL,
	CONSTRAINT `restaurant_translation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` varchar(256) NOT NULL,
	`is_waiting_room` boolean NOT NULL DEFAULT false,
	CONSTRAINT `room_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` int NOT NULL,
	`no` varchar(256) NOT NULL,
	`order` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`capacity` int NOT NULL,
	`min_capacity` int NOT NULL,
	`max_capacity` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`shape` enum('square','rectangle','round') NOT NULL DEFAULT 'rectangle',
	CONSTRAINT `table_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_room_table` UNIQUE(`room_id`,`name`)
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
	`name` varchar(256),
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
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;