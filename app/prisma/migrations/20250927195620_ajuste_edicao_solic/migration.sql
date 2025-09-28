-- CreateMigration
-- Step 1: Add new columns allowing NULL
ALTER TABLE "public"."request_items" 
ADD COLUMN "item_category_id" TEXT,
ADD COLUMN "item_type_id" TEXT;

-- Step 2: Create temporary default records if they don't exist
INSERT INTO "public"."item_types" (id, code, name, description, is_active, "createdAt", "updatedAt")
SELECT 'DEFAULT_TYPE', 'DEFAULT', 'Default Type', 'Default type for data migration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."item_types" WHERE code = 'DEFAULT');

INSERT INTO "public"."item_categories" (id, code, name, description, is_active, "createdAt", "updatedAt")
SELECT 'DEFAULT_CAT', 'DEFAULT', 'Default Category', 'Default category for data migration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."item_categories" WHERE code = 'DEFAULT');

-- Step 3: Update existing records with default values
UPDATE "public"."request_items" 
SET 
  item_type_id = (SELECT id FROM "public"."item_types" WHERE code = 'DEFAULT'),
  item_category_id = (SELECT id FROM "public"."item_categories" WHERE code = 'DEFAULT')
WHERE item_type_id IS NULL;

-- Step 4: Make columns NOT NULL
ALTER TABLE "public"."request_items" 
ALTER COLUMN "item_type_id" SET NOT NULL,
ALTER COLUMN "item_category_id" SET NOT NULL;

-- Step 5: Drop old enum columns
ALTER TABLE "public"."request_items" 
DROP COLUMN "item_type",
DROP COLUMN "item_category";

-- Step 6: Add foreign key constraints
ALTER TABLE "public"."request_items" 
ADD CONSTRAINT "request_items_item_type_id_fkey" 
FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."request_items" 
ADD CONSTRAINT "request_items_item_category_id_fkey" 
FOREIGN KEY ("item_category_id") REFERENCES "public"."item_categories"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
