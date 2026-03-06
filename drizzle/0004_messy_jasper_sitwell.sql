CREATE TABLE `gptmakerMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`conversationId` varchar(255) NOT NULL,
	`userMessage` text NOT NULL,
	`agentResponse` text,
	`status` enum('pending','sent','received','error') NOT NULL DEFAULT 'pending',
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gptmakerMessages_id` PRIMARY KEY(`id`)
);
