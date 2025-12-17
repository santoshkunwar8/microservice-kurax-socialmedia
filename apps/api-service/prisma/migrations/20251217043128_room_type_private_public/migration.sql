/*
  Warnings:

  - The values [DIRECT,GROUP,CHANNEL] on the enum `RoomType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomType_new" AS ENUM ('PUBLIC', 'PRIVATE');
ALTER TABLE "rooms" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "rooms" ALTER COLUMN "type" TYPE "RoomType_new" USING ("type"::text::"RoomType_new");
ALTER TYPE "RoomType" RENAME TO "RoomType_old";
ALTER TYPE "RoomType_new" RENAME TO "RoomType";
DROP TYPE "RoomType_old";
ALTER TABLE "rooms" ALTER COLUMN "type" SET DEFAULT 'PUBLIC';
COMMIT;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "passcode" TEXT,
ALTER COLUMN "type" SET DEFAULT 'PUBLIC';
