// ================================
// STEP 3: Create the basic types file
// File: frontend/src/types/index.ts
// ================================
export interface User {
  id: string;
  email: string;
  profile: {
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    timezone?: string;
  };
  preferences: {
    notificationTime: string;
    followUpFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
    emailNotifications: boolean;
  };
  lastActive?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  chatbotType?: 'primary' | 'secondary';
  metadata?: {
    intent?: string;
    confidence?: number;
    processingTime?: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}