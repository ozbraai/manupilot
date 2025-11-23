-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Participants
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Context (nullable - conversation may be general or scoped)
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  rfq_id UUID REFERENCES rfq_submissions(id) ON DELETE SET NULL,
  quote_id UUID, -- Future feature
  
  -- Subject
  subject TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Ensure customer and partner are different users
  CHECK (customer_id <> partner_id)
);

-- Indexes for conversations
CREATE INDEX idx_conversations_customer ON conversations(customer_id, updated_at DESC);
CREATE INDEX idx_conversations_partner ON conversations(partner_id, updated_at DESC);
CREATE INDEX idx_conversations_project ON conversations(project_id);
CREATE INDEX idx_conversations_rfq ON conversations(rfq_id);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  
  -- Sender
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Read tracking
  read_by_customer BOOLEAN DEFAULT FALSE,
  read_by_partner BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validation
  CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000)
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Type & Content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  
  -- Context
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Link
  link TEXT,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

-- RLS Policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = partner_id);

-- RLS Policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.partner_id = auth.uid())
    )
  );

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update conversation timestamp when message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to create notification when message is sent
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  conversation_subject TEXT;
BEGIN
  -- Determine recipient (the user who didn't send the message)
  SELECT 
    CASE 
      WHEN customer_id = NEW.sender_id THEN partner_id
      ELSE customer_id
    END,
    subject
  INTO recipient_id, conversation_subject
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    conversation_id,
    link
  ) VALUES (
    recipient_id,
    'new_message',
    'New message',
    LEFT(NEW.content, 100),
    NEW.conversation_id,
    '/messages?conversation=' || NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();
