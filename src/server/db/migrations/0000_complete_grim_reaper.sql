CREATE TABLE `refresh_token` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
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
	`email` varchar(256),
	`password` varchar(256) NOT NULL,
	`role` enum('admin','user') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`optional_field` varchar(256),
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;