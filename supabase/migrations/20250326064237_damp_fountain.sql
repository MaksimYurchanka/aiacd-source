/*
  # Initial Schema for AI-AutoCoding-DAO

  1. New Tables
    - `profiles` - User profiles extending auth.users
    - `tasks` - Task tracking and metadata
    - `token_usage` - Token consumption metrics
    - `templates` - Task templates by tool
    - `implementations` - Code implementations
    - `quality_metrics` - Implementation quality scores

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure sensitive data access
*/

-- Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  type text NOT NULL,
  complexity text NOT NULL,
  features jsonb DEFAULT '[]',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create token_usage table
CREATE TABLE IF NOT EXISTS token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  time_spent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  type text NOT NULL,
  template text NOT NULL,
  defaults jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tool_name, type)
);

-- Create implementations table
CREATE TABLE IF NOT EXISTS implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  code text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create quality_metrics table
CREATE TABLE IF NOT EXISTS quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid REFERENCES implementations(id) ON DELETE CASCADE,
  overall_score numeric NOT NULL,
  detailed_scores jsonb NOT NULL,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Token usage policies
CREATE POLICY "Users can read own token usage"
  ON token_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = token_usage.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create token usage records"
  ON token_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = token_usage.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Templates policies
CREATE POLICY "Everyone can read templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Implementations policies
CREATE POLICY "Users can read own implementations"
  ON implementations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = implementations.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create implementations"
  ON implementations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = implementations.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Quality metrics policies
CREATE POLICY "Users can read own quality metrics"
  ON quality_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM implementations
      JOIN tasks ON tasks.id = implementations.task_id
      WHERE implementations.id = quality_metrics.implementation_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quality metrics"
  ON quality_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM implementations
      JOIN tasks ON tasks.id = implementations.task_id
      WHERE implementations.id = quality_metrics.implementation_id
      AND tasks.user_id = auth.uid()
    )
  );