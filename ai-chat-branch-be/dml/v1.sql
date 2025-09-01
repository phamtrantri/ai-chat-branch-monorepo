-- Add the message_id column with correct foreign key constraint
ALTER TABLE conversations ADD message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE;
-- Create index for better performance
CREATE INDEX idx_conversations_message_id ON conversations(message_id);