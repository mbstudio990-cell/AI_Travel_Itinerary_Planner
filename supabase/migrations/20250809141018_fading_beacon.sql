/*
  # Add updated_at column to day_itineraries table

  1. Schema Changes
    - Add `updated_at` column to `day_itineraries` table
    - Set default value to current timestamp
    - Add trigger to automatically update the timestamp on row changes

  2. Security
    - No changes to existing RLS policies
*/

-- Add updated_at column to day_itineraries table
ALTER TABLE day_itineraries 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create or replace the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at on row changes
DROP TRIGGER IF EXISTS update_day_itineraries_updated_at ON day_itineraries;
CREATE TRIGGER update_day_itineraries_updated_at
    BEFORE UPDATE ON day_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();