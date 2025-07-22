-- Step 1: Add new columns as nullable
ALTER TABLE "bookings" ADD COLUMN "entrepreneurId" TEXT;
ALTER TABLE "notification_settings" ADD COLUMN "entrepreneurId" TEXT;
ALTER TABLE "payments" ADD COLUMN "entrepreneurId" TEXT;
ALTER TABLE "platform_settings" ADD COLUMN "entrepreneurId" TEXT;

-- Step 2: Migrate existing data
-- First, ensure every user has an entrepreneur profile
INSERT INTO "entrepreneur_profiles" (id, "userId", "businessName", slug, timezone, currency, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text, 
  id, 
  name, 
  LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')), 
  'Eastern Time',
  'USD',
  NOW(),
  NOW()
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "entrepreneur_profiles" ep WHERE ep."userId" = u.id
)
AND u.role = 'ENTREPRENEUR';

-- Update bookings with entrepreneur profile ids
UPDATE "bookings" b
SET "entrepreneurId" = ep.id
FROM "users" u
JOIN "entrepreneur_profiles" ep ON ep."userId" = u.id
WHERE b."providerId" = u.id;

-- Update notification settings with entrepreneur profile ids
UPDATE "notification_settings" ns
SET "entrepreneurId" = ep.id
FROM "users" u
JOIN "entrepreneur_profiles" ep ON ep."userId" = u.id
WHERE ns."userId" = u.id;

-- Update payments with entrepreneur profile ids from their bookings
UPDATE "payments" p
SET "entrepreneurId" = b."entrepreneurId"
FROM "bookings" b
WHERE p."bookingId" = b.id;

-- Update platform settings with entrepreneur profile ids
UPDATE "platform_settings" ps
SET "entrepreneurId" = ep.id
FROM (
  SELECT DISTINCT ep.id 
  FROM "entrepreneur_profiles" ep 
  LIMIT 1
) ep;

-- Step 3: Verify data migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "bookings" WHERE "entrepreneurId" IS NULL
    UNION ALL
    SELECT 1 FROM "notification_settings" WHERE "entrepreneurId" IS NULL
    UNION ALL
    SELECT 1 FROM "payments" WHERE "entrepreneurId" IS NULL
    UNION ALL
    SELECT 1 FROM "platform_settings" WHERE "entrepreneurId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Data migration incomplete: Some records have null entrepreneurId';
  END IF;
END $$;

-- Step 4: Make columns required and add constraints
ALTER TABLE "bookings" 
  ALTER COLUMN "entrepreneurId" SET NOT NULL;

ALTER TABLE "notification_settings" 
  ALTER COLUMN "entrepreneurId" SET NOT NULL;

ALTER TABLE "payments" 
  ALTER COLUMN "entrepreneurId" SET NOT NULL;

ALTER TABLE "platform_settings" 
  ALTER COLUMN "entrepreneurId" SET NOT NULL;

-- Step 5: Add unique constraints
ALTER TABLE "notification_settings" 
  ADD CONSTRAINT "notification_settings_entrepreneurId_key" UNIQUE ("entrepreneurId");

ALTER TABLE "platform_settings" 
  ADD CONSTRAINT "platform_settings_entrepreneurId_key" UNIQUE ("entrepreneurId");

-- Step 6: Add foreign key constraints
ALTER TABLE "bookings" 
  ADD CONSTRAINT "bookings_entrepreneurId_fkey" 
  FOREIGN KEY ("entrepreneurId") 
  REFERENCES "entrepreneur_profiles"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" 
  ADD CONSTRAINT "payments_entrepreneurId_fkey" 
  FOREIGN KEY ("entrepreneurId") 
  REFERENCES "entrepreneur_profiles"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "platform_settings" 
  ADD CONSTRAINT "platform_settings_entrepreneurId_fkey" 
  FOREIGN KEY ("entrepreneurId") 
  REFERENCES "entrepreneur_profiles"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_settings" 
  ADD CONSTRAINT "notification_settings_entrepreneurId_fkey" 
  FOREIGN KEY ("entrepreneurId") 
  REFERENCES "entrepreneur_profiles"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Drop old columns and constraints
ALTER TABLE "notification_settings" DROP CONSTRAINT IF EXISTS "notification_settings_userId_fkey";
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_providerId_fkey";

ALTER TABLE "notification_settings" DROP COLUMN "userId";
ALTER TABLE "bookings" DROP COLUMN "providerId";
