-- ConnectTrack Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor to set up your database

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Calculated fields
  total_score INTEGER,
  stage TEXT, -- Seeking, Beginning, Growing, Multiplying

  -- Category scores
  god_score INTEGER,
  others_score INTEGER,
  disciples_score INTEGER,
  sin_score INTEGER,

  -- Question 10 override flag
  is_seeker_override BOOLEAN DEFAULT FALSE
);

-- Responses table (one row per question answered)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_score INTEGER NOT NULL,
  category TEXT NOT NULL
);

-- Attributes table (selected checkboxes)
CREATE TABLE attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  attribute_type TEXT NOT NULL, -- 'experience' or 'skill'
  attribute_value TEXT NOT NULL
);

-- Recommendations table (AI-generated results)
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  stage_summary TEXT,
  recommendations_json JSONB
);

-- Create indexes for common queries
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_stage ON assessments(stage);
CREATE INDEX idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX idx_attributes_assessment_id ON attributes(assessment_id);
CREATE INDEX idx_recommendations_assessment_id ON recommendations(assessment_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (for API routes)
-- These allow the service role key to access all data
CREATE POLICY "Service role can do everything on assessments"
  ON assessments FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on responses"
  ON responses FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on attributes"
  ON attributes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on recommendations"
  ON recommendations FOR ALL
  USING (true)
  WITH CHECK (true);
