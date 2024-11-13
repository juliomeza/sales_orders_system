/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
