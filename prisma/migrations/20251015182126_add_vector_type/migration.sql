-- Drop existing table if it exists
DROP TABLE IF EXISTS `BusinessEmbedding`;

-- Recreate the table with correct vector dimensions
CREATE TABLE `BusinessEmbedding` (
    `id` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NOT NULL,
    `vector` VECTOR(1024),

    UNIQUE INDEX `BusinessEmbedding_recordId_key`(`recordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraint
ALTER TABLE `BusinessEmbedding` ADD CONSTRAINT `BusinessEmbedding_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `BusinessRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;