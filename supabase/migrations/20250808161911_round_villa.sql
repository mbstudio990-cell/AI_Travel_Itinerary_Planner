/*
  # Create Travel Data Tables

  1. New Tables
    - `travel_requests`
      - `id` (uuid, primary key)
      - `destinations` (text array)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (text)
      - `interests` (text array)
      - `currency` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `itineraries`
      - `id` (uuid, primary key)
      - `travel_request_id` (uuid, references travel_requests)
      - `destination` (text)
      - `total_budget` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `day_itineraries`
      - `id` (uuid, primary key)
      - `itinerary_id` (uuid, references itineraries)
      - `day` (integer)
      - `date` (text)
      - `total_estimated_cost` (text)
      - `created_at` (timestamp)
    
    - `activities`
      - `id` (uuid, primary key)
      - `day_itinerary_id` (uuid, references day_itineraries)
      - `time` (text)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `cost_estimate` (text)
      - `tips` (text)
      - `category` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create travel_requests table
CREATE TABLE IF NOT EXISTS travel_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinations text[] NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget text NOT NULL CHECK (budget IN ('Budget', 'Mid-range', 'Luxury')),
  interests text[] NOT NULL DEFAULT '{}',
  currency text NOT NULL DEFAULT 'USD',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id uuid REFERENCES travel_requests(id) ON DELETE CASCADE,
  destination text NOT NULL,
  total_budget text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create day_itineraries table
CREATE TABLE IF NOT EXISTS day_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES itineraries(id) ON DELETE CASCADE,
  day integer NOT NULL,
  date text NOT NULL,
  total_estimated_cost text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_itinerary_id uuid REFERENCES day_itineraries(id) ON DELETE CASCADE,
  time text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  cost_estimate text NOT NULL,
  tips text NOT NULL,
  category text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for travel_requests
CREATE POLICY "Users can create their own travel requests"
  ON travel_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own travel requests"
  ON travel_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel requests"
  ON travel_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel requests"
  ON travel_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for itineraries
CREATE POLICY "Users can create their own itineraries"
  ON itineraries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own itineraries"
  ON itineraries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON itineraries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON itineraries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for day_itineraries
CREATE POLICY "Users can manage day itineraries for their itineraries"
  ON day_itineraries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries 
      WHERE itineraries.id = day_itineraries.itinerary_id 
      AND itineraries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries 
      WHERE itineraries.id = day_itineraries.itinerary_id 
      AND itineraries.user_id = auth.uid()
    )
  );

-- Create policies for activities
CREATE POLICY "Users can manage activities for their day itineraries"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM day_itineraries 
      JOIN itineraries ON itineraries.id = day_itineraries.itinerary_id
      WHERE day_itineraries.id = activities.day_itinerary_id 
      AND itineraries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM day_itineraries 
      JOIN itineraries ON itineraries.id = day_itineraries.itinerary_id
      WHERE day_itineraries.id = activities.day_itinerary_id 
      AND itineraries.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_travel_requests_user_id ON travel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_created_at ON travel_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_travel_request_id ON itineraries(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_day_itineraries_itinerary_id ON day_itineraries(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_itinerary_id ON activities(day_itinerary_id);
CREATE INDEX IF NOT EXISTS idx_activities_order ON activities(day_itinerary_id, order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_travel_requests_updated_at 
  BEFORE UPDATE ON travel_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at 
  BEFORE UPDATE ON itineraries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();