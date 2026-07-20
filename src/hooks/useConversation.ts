import { useCallback, useEffect, useState } from 'react';
import { getMessages } from '../db/repositories/conversation';
import type { ConversationMessage } from '../types/models';

export function useConversation() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getMessages();
    setMessages(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { messages, setMessages, loading, refresh };
}
