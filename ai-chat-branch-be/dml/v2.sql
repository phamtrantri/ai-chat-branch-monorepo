-- Drop the column if it exists and recreate with JSON type
ALTER TABLE messages ADD model_settings JSON;
ALTER TABLE messages ADD agentic_mode VARCHAR(50);