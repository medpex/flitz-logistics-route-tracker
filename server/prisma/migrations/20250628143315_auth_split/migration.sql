/*
  Warnings:

  - You are about to drop the column `email` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";
