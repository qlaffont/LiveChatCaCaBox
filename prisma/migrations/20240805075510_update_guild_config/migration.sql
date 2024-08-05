-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "busyUntil" DATETIME,
    "defaultMediaTime" INTEGER,
    "maxMediaTime" INTEGER,
    "displayMediaFull" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Guild" ("busyUntil", "id") SELECT "busyUntil", "id" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
