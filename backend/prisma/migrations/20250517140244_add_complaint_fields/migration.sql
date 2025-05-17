-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';
