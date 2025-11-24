-- CreateTable
CREATE TABLE "Planogram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendingMachineId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productPrice" DECIMAL NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "calories" INTEGER,
    "fat" TEXT,
    "carbs" TEXT,
    "protein" TEXT,
    "sodium" TEXT,
    "ingredients" TEXT,
    "healthRating" INTEGER
);
