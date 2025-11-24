-- Update RLS policies for conversations to include partner_record_id check

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = customer_id 
    OR auth.uid() = partner_id
    OR EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = conversations.partner_record_id
      AND partners.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id 
    OR auth.uid() = partner_id
    OR EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = conversations.partner_record_id
      AND partners.user_id = auth.uid()
    )
  );

-- Update RLS policies for messages to include partner_record_id check

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.customer_id = auth.uid() 
        OR conversations.partner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM partners
          WHERE partners.id = conversations.partner_record_id
          AND partners.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (
        conversations.customer_id = auth.uid() 
        OR conversations.partner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM partners
          WHERE partners.id = conversations.partner_record_id
          AND partners.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their read status" ON messages;
CREATE POLICY "Users can update their read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.customer_id = auth.uid() 
        OR conversations.partner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM partners
          WHERE partners.id = conversations.partner_record_id
          AND partners.user_id = auth.uid()
        )
      )
    )
  );
