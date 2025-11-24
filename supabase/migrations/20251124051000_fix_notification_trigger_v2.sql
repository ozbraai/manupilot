-- Update the notification trigger function to handle cases where partner_id is NULL
-- and to avoid crashing if no recipient is found.

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  conversation_subject TEXT;
  conv_customer_id UUID;
  conv_partner_id UUID;
  conv_partner_record_id UUID;
BEGIN
  -- Get conversation details
  SELECT 
    customer_id, partner_id, partner_record_id, subject
  INTO 
    conv_customer_id, conv_partner_id, conv_partner_record_id, conversation_subject
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Determine recipient
  IF conv_customer_id = NEW.sender_id THEN
    -- Sender is customer, notify partner
    recipient_id := conv_partner_id;
    
    -- If partner_id is null (e.g. conversation via partner record), look it up
    IF recipient_id IS NULL AND conv_partner_record_id IS NOT NULL THEN
      SELECT user_id INTO recipient_id FROM partners WHERE id = conv_partner_record_id;
    END IF;
  ELSE
    -- Sender is partner, notify customer
    recipient_id := conv_customer_id;
  END IF;

  -- Only create notification if we found a valid recipient
  IF recipient_id IS NOT NULL THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
