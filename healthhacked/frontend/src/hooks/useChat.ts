// ================================
// STEP 6: Create the chat hook
// File: frontend/src/hooks/useChat.ts
// ================================
import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { apiClient } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.sendMessage(message, sessionId || undefined);
      
      if (response.success && response.data) {
        const { response: botResponse, sessionId: newSessionId } = response.data;

        // Update session ID if new
        if (newSessionId && newSessionId !== sessionId) {
          setSessionId(newSessionId);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
  };
}