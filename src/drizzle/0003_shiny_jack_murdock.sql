PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_outputs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`voice_id` integer,
	`input_text` text,
	`audio_url` text,
	`duration` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`voice_id`) REFERENCES `voices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_outputs`("id", "user_id", "type", "voice_id", "input_text", "audio_url", "duration", "created_at") SELECT "id", "user_id", "type", "voice_id", "input_text", "audio_url", "duration", "created_at" FROM `outputs`;--> statement-breakpoint
DROP TABLE `outputs`;--> statement-breakpoint
ALTER TABLE `__new_outputs` RENAME TO `outputs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;