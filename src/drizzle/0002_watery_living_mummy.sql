CREATE TABLE `outputs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`voice_id` integer,
	`input_text` text,
	`audio_url` text,
	`duration` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`voice_id`) REFERENCES `voices`(`id`) ON UPDATE no action ON DELETE no action
);
