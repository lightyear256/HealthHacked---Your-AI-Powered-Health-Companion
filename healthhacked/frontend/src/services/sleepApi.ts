import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SleepProfile {
  _id: string;
  userId: string;
  chronotype: 'morning' | 'evening' | 'intermediate';
  weekdayBedtime: string;
  weekdayWakeTime: string;
  weekendBedtime: string;
  weekendWakeTime: string;
  targetSleepHours: number;
  sleepEfficiency: number;
}

export interface SleepEntry {
  _id: string;
  userId: string;
  date: Date;
  bedtime: Date;
  wakeTime: Date;
  sleepQuality: number;
  stanfordSleepinessScore: number;
  productivitySelfReport?: number;
  notes?: string;
  mood: string;
  caffeine: {
    consumed: boolean;
    amount?: number;
    lastIntake?: Date;
  };
  exercise: boolean;
  stress: number;
}

export interface ProductivityCurve {
  hour: number;
  productivity: number;
  zone: string;
  circadianFactor: number;
  homeostaticFactor: number;
}

export interface SleepRecommendation {
  type: string;
  timeSlot: { start: number; end: number };
  priority: number;
  description: string;
}

export interface SleepDashboardData {
  currentProductivity: {
    hour: number;
    productivity: number;
    zone: string;
  };
  sleepDebt: number;
  productivity: {
    curve: ProductivityCurve[];
    recommendations: SleepRecommendation[];
    confidence: number;
  };
  insights: any;
  recentEntries: SleepEntry[];
  stats: {
    entriesLogged: number;
    avgSleepDebt: number;
    consistency: number;
  };
}

class SleepApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getDashboard(): Promise<{ data: SleepDashboardData }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/dashboard`, this.getAuthHeaders());
    return response.data;
  }

  async getProfile(): Promise<{ data: { profile: SleepProfile | null } }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/profile`, this.getAuthHeaders());
    return response.data;
  }

  async createProfile(profileData: Partial<SleepProfile>): Promise<{ data: { profile: SleepProfile } }> {
    const response = await axios.post(`${API_BASE_URL}/sleep/profile`, profileData, this.getAuthHeaders());
    return response.data;
  }

  async logSleepEntry(entryData: Partial<SleepEntry>): Promise<{ data: { entry: SleepEntry } }> {
    const response = await axios.post(`${API_BASE_URL}/sleep/entry`, entryData, this.getAuthHeaders());
    return response.data;
  }

  async getSleepEntries(params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: { entries: SleepEntry[]; count: number } }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/entries`, {
      ...this.getAuthHeaders(),
      params
    });
    return response.data;
  }

  async getProductivityCurve(date?: string): Promise<{ data: any }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/productivity-curve`, {
      ...this.getAuthHeaders(),
      params: date ? { date } : {}
    });
    return response.data;
  }

  async getSleepDebt(days: number = 7): Promise<{ data: any }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/debt`, {
      ...this.getAuthHeaders(),
      params: { days }
    });
    return response.data;
  }

  async getSleepInsights(days: number = 30): Promise<{ data: any }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/insights`, {
      ...this.getAuthHeaders(),
      params: { days }
    });
    return response.data;
  }

  async deleteSleepEntry(entryId: string): Promise<{ data: any }> {
    const response = await axios.delete(`${API_BASE_URL}/sleep/entry/${entryId}`, this.getAuthHeaders());
    return response.data;
  }

  async getRecommendations(): Promise<{ data: any[] }> {
    const response = await axios.get(`${API_BASE_URL}/sleep/recommendations`, this.getAuthHeaders());
    return response.data;
  }
}

export const sleepApi = new SleepApiService();