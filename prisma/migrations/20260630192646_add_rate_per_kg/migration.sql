-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ratePerKg" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_DeliveryService" ("id", "name") SELECT "id", "name" FROM "DeliveryService";
DROP TABLE "DeliveryService";
ALTER TABLE "new_DeliveryService" RENAME TO "DeliveryService";
CREATE UNIQUE INDEX "DeliveryService_name_key" ON "DeliveryService"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
