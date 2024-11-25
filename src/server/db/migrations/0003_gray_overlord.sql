CREATE TABLE `waitlist_notification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`waitlist_id` int NOT NULL,
	`type` enum('SMS','EMAIL') NOT NULL,
	`notification_message_type` enum('Created Reservation From Waitlist','Cancel Waitlist','Added To Waitlist') NOT NULL,
	`message` text NOT NULL,
	`sent_at` timestamp,
	`status` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
	CONSTRAINT `waitlist_notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `waitlist_message` ADD `cancel_waitlist_message` text;