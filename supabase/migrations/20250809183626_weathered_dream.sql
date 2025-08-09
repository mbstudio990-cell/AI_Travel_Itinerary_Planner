/*
  # Add notes column to day_itineraries table

  1. Changes
    - Add `notes` column to `day_itineraries` table
    - Column type: TEXT (nullable)
    - Allows users to store notes for each day of their itinerary

  2. Security
    - No RLS changes needed as existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_itineraries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE day_itineraries ADD COLUMN notes text;
  END IF;
END $$;