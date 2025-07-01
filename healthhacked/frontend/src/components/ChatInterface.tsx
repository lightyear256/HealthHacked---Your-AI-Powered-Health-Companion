
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Send, Bot, User, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to HealthHacked
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              I'm here to help you with your health concerns. You can describe any symptoms 
              or ask health-related questions to get started.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Bot className="h-5 w-5" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or ask a health question..."
              className="w-full resize-none rounded-md border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={2}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {input.length}/1000 characters
              </span>
              <span className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: any;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isEmergency = message.content.includes('🚨') || message.content.toLowerCase().includes('emergency');

  return (
    <div className={clsx(
      'flex',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={clsx(
        'flex max-w-xs lg:max-w-md xl:max-w-lg space-x-2',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary-600' : 'bg-gray-600'
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <Card className={clsx(
          'px-4 py-3',
          isUser ? 'bg-primary-600 text-white' : 'bg-gray-50',
          isEmergency && !isUser && 'border-red-500 bg-red-50'
        )}>
          {isEmergency && !isUser && (
            <div className="flex items-center space-x-2 mb-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Emergency Alert</span>
            </div>
          )}
          
          <div className={clsx(
            'text-sm whitespace-pre-wrap',
            isUser ? 'text-white' : 'text-gray-900',
            isEmergency && !isUser && 'text-red-800'
          )}>
            {message.content}
          </div>
          
          <div className={clsx(
            'text-xs mt-2',
            isUser ? 'text-primary-200' : 'text-gray-500'
          )}>
            {new Date(message.timestamp).toLocaleTimeString()}
            {message.metadata?.confidence && (
              <span className="ml-2">
                (Confidence: {Math.round(message.metadata.confidence * 100)}%)
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}