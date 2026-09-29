CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);

CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`created` text NOT NULL
);

CREATE TABLE `event_keys` (
	`fingerprint` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL
);
