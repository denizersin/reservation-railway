ALTER TABLE `room` ADD `layout_width` int DEFAULT 1200 NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ADD `layout_row_height` int DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE `table` ADD `x` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `table` ADD `y` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `table` ADD `w` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `table` ADD `min_w` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `table` ADD `max_w` int DEFAULT 1;