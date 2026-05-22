-- Migration: Add note column to restaurant_tables
-- Adds a nullable note column to store internal notes for each table

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('restaurant_tables')
    AND name = 'note'
)
BEGIN
  ALTER TABLE restaurant_tables
  ADD note NVARCHAR(MAX) NULL;
  PRINT 'Column note added to restaurant_tables';
END
ELSE
BEGIN
  PRINT 'Column note already exists in restaurant_tables';
END
GO

-- Optionally initialize existing rows with NULL (no-op)
UPDATE restaurant_tables
SET note = NULL
WHERE note IS NULL;
GO
