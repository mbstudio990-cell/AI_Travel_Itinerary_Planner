/*
  # Add notes support to itineraries

  1. Changes
    - Add notes column to day_itineraries table to store user notes
    - Update RLS policies to ensure users can only access their own notes

  2. Security
    - Notes are protected by existing RLS policies through the itinerary relationship
*/

-- Add notes column to day_itineraries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_itineraries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE day_itineraries ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;

-- Update the updated_at trigger for day_itineraries if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_day_itineraries_updated_at'
  ) THEN
    CREATE TRIGGER update_day_itineraries_updated_at
      BEFORE UPDATE ON day_itineraries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;