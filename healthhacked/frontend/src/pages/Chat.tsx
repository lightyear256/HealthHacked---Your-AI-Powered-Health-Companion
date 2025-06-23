import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { chatAPI, healthAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Send, 
  MessageCircle, 
  Bot,
  User,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: {
    contextId?: string;
    sessionId?: string;
    severity?: number;
    potentialCauses?: string[];
    immediateSteps?: string[];
    seekHelpIf?: string[];
    intent?: string;
    confidence?: number;
  };
}

export function Chat() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const contextId = searchParams.get('context');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [contextId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    if (contextId) {
      // Load existing health context
      try {
        const response = await healthAPI.getHealthContext(contextId);
        if (response.success) {
          const context = response.data.context;
          const welcomeMessage: Message = {
            id: '1',
            content: `Hello ${user?.profile.name}! I see you want to continue our conversation about your ${context.primaryConcern}. 

Last time we spoke, you mentioned a severity level of ${context.severity}/10. How are you feeling now? Please share any updates about your symptoms or condition.`,
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load health context:', error);
      }
    } else {
      // New conversation
      const welcomeMessage: Message = {
        id: '1',
        content: `Hello ${user?.profile.name}! I'm your AI health assistant. I can help you with:

• Analyzing symptoms and health concerns
• Creating personalized care plans
• Providing health guidance and recommendations
• Tracking your health progress

What can I help you with today?`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      console.log('💬 Sending message to AI:', messageToSend);
      
      const response = await chatAPI.sendMessage(messageToSend);
      console.log('🤖 AI response received:', response);

      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'ai',
          timestamp: new Date(),
          context: {
            contextId: response.data.contextId,
            sessionId: response.data.sessionId,
            severity: response.data.severity,
            potentialCauses: response.data.potentialCauses,
            immediateSteps: response.data.immediateSteps,
            seekHelpIf: response.data.seekHelpIf,
            intent: response.data.intent,
            confidence: response.data.confidence
          }
        };

        // Simulate typing delay for better UX
        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          
          // Show additional context if it's a medical response
          if (response.data.contextId && (response.data.potentialCauses || response.data.immediateSteps)) {
            showMedicalContext(response.data);
          }
          
          // Show success notification if new health context created
          if (response.data.contextId && !contextId) {
            toast.success('Health context created! This conversation is now being tracked.', {
              duration: 5000
            });
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message';
      setError(errorMessage);
      
      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having technical difficulties right now. For any urgent health concerns, please consult with a healthcare professional immediately.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorAiMessage]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const showMedicalContext = (data: any) => {
    if (data.potentialCauses || data.immediateSteps || data.seekHelpIf) {
      let contextContent = '';
      
      if (data.potentialCauses?.length > 0) {
        contextContent += `**Potential causes to consider:**\n${data.potentialCauses.map((cause: string) => `• ${cause}`).join('\n')}\n\n`;
      }
      
      if (data.immediateSteps?.length > 0) {
        contextContent += `**Immediate steps you can take:**\n${data.immediateSteps.map((step: string) => `• ${step}`).join('\n')}\n\n`;
      }
      
      if (data.seekHelpIf?.length > 0) {
        contextContent += `**🚨 Seek immediate medical attention if you experience:**\n${data.seekHelpIf.map((condition: string) => `• ${condition}`).join('\n')}\n\n`;
      }
      
      if (data.followUpQuestion) {
        contextContent += `**Follow-up question:** ${data.followUpQuestion}`;
      }

      const contextMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: contextContent,
        sender: 'ai',
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages(prev => [...prev, contextMessage]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={index} className="font-semibold mt-3 mb-1 text-gray-200">{line.slice(2, -2)}</div>;
        }
        if (line.startsWith('• ')) {
          return <div key={index} className="ml-4 mb-1 text-gray-300">{line}</div>;
        }
        if (line.startsWith('🚨')) {
          return <div key={index} className="text-red-400 font-medium mt-2 mb-1 p-2 bg-red-900/30 rounded border-l-4 border-red-400">{line}</div>;
        }
        if (line.trim() === '') {
          return <div key={index} className="mb-2"></div>;
        }
        return <div key={index} className="mb-1">{line}</div>;
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
    <style jsx>{`
      .scrollbar-custom::-webkit-scrollbar {
        width: 8px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-track {
        background-color: #475569; /* slate-600 */
        border-radius: 4px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb {
        background-color: #000000; /* black */
        border-radius: 4px;
        border: 1px solid #475569;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background-color: #000000; /* black */
      }
      
      .scrollbar-custom::-webkit-scrollbar-corner {
        background-color: #000000;
      }
      
      /* Firefox scrollbar styling */
      .scrollbar-custom {
        scrollbar-width: thin;
        scrollbar-color: #475569 #000000;
      }
    `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 mt-20">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <MessageCircle className="h-8 w-8 mr-3 text-purple-600" />
            AI Health Assistant
          </h1>
          <p className="mt-2 text-white">
            {contextId ? 'Continuing your health conversation' : 'Start a conversation about your health'}
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-600 rounded-md">
              <p className="text-sm text-red-400">
                ⚠️ Connection issue: {error}
              </p>
            </div>
          )}
        </div>

        {/* Chat Container - Now properly centered and responsive */}
        <div className="flex justify-center">
          <Card className="h-[700px] w-[1560px] max-w-7xl flex flex-col bg-slate-800 border-slate-700">
            {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                      }`}>
                        {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-slate-700 text-white'
                        : 'bg-purple-700 border border-slate-600 text-white'
                    }`}>
                      <div className="text-sm">
                        {message.sender === 'user' ? (
                          <div className="whitespace-pre-line">{message.content}</div>
                        ) : (
                          formatMessageContent(message.content)
                        )}
                      </div>
                      <div className={`text-xs mt-2 flex items-center justify-between ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.context?.contextId && (
                          <div className="flex items-center ml-2">
                            <CheckCircle className="h-3 w-3 text-white" />
                            <span className="text-xs ml-1 text-white">Tracked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex mr-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-600 p-4">
              <div className="flex justify-end items-center relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health question or concern..."
                  className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                  style={{
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    lineHeight: '1.5',
                    
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`absolute mr-2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    !inputMessage.trim() || isLoading
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("I've been having headaches for the past few days")}
                    disabled={isLoading}
                    className="border-slate-600 text-black hover:bg-purple-600 hover:text-white"
                  >
                    Headache concerns
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("I have lower back pain that's been bothering me")}
                    disabled={isLoading}
                    className="border-slate-600 text-black hover:bg-purple-600 hover:text-white"
                  >
                    Back pain
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("I want to check on my current care plan progress")}
                    disabled={isLoading}
                    className="border-slate-600 text-black hover:bg-purple-600 hover:text-white"
                  >
                    Care plan update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("I have new symptoms I'm concerned about")}
                    disabled={isLoading}
                    className="border-slate-600 text-black hover:bg-purple-600 hover:text-white"
                  >
                    New symptoms
                  </Button>
                </div>
              )}

              {/* Connection Status */}
              <div className="mt-2 text-xs text-gray-400 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                {error ? 'Connection issues detected' : 'Connected to HealthHacked AI'}
              </div>
            </div>
          </Card>
        </div>

        {/* Health Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important Health Disclaimer</p>
              <p>
                This AI assistant provides general health information and guidance. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for serious health concerns or emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}