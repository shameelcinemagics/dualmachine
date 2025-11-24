/*
  Warnings:

  - You are about to alter the column `calories` on the `Planogram` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `carbs` on the `Planogram` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `fat` on the `Planogram` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `protein` on the `Planogram` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `sodium` on the `Planogram` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - Made the column `calories` on table `Planogram` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carbs` on table `Planogram` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fat` on table `Planogram` required. This step will fail if there are existing NULL values in that column.
  - Made the column `protein` on table `Planogram` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sodium` on table `Planogram` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Planogram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendingMachineId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "productName" TEXT,
    "productPrice" DECIMAL NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "calories" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "sodium" REAL NOT NULL,
    "ingredients" TEXT,
    "healthRating" INTEGER
);
INSERT INTO "new_Planogram" ("calories", "carbs", "category", "fat", "healthRating", "id", "imageUrl", "ingredients", "maxCapacity", "productId", "productName", "productPrice", "protein", "quantity", "slotNumber", "sodium", "vendingMachineId") SELECT "calories", "carbs", "category", "fat", "healthRating", "id", "imageUrl", "ingredients", "maxCapacity", "productId", "productName", "productPrice", "protein", "quantity", "slotNumber", "sodium", "vendingMachineId" FROM "Planogram";
DROP TABLE "Planogram";
ALTER TABLE "new_Planogram" RENAME TO "Planogram";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
