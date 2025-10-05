CREATE TABLE `voices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`rating` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`user_id` text,
	`fal_voice_id` text,
	`sample_audio_url` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
