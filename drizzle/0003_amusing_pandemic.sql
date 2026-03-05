ALTER TABLE `clients` MODIFY COLUMN `status` enum('em_qualificacao','em_negociacao','proposta_enviada','cliente_fechado','cliente_desistiu') NOT NULL DEFAULT 'em_qualificacao';--> statement-breakpoint
ALTER TABLE `appointments` ADD `googleEventId` varchar(255);--> statement-breakpoint
ALTER TABLE `appointments` ADD `googleCalendarAccessToken` text;