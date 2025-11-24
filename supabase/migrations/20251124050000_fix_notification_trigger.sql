-- Update the notification trigger function to be SECURITY DEFINER
-- This allows it to bypass RLS when inserting notifications for other users

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
