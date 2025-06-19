// File: frontend/src/pages/Dashboard.tsx
// REPLACE THE EXISTING FILE COMPLETELY

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { healthAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface DashboardData {
  stats: {
    activeHealthConcerns: number;
    activeCarePlans: number;
    totalRecommendations: number;
    completedRecommendations: number;
  };
  activeContexts: any[];
  activeCarePlans: any[];
  recentActivity: any[];
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // Prevent multiple calls on mount

  useEffect(() => {
    // Only load once on mount
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    if (loading) {
      console.log('⏸️ Dashboard already loading, skipping...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Loading dashboard data (once)...');
      const response = await healthAPI.getDashboard();
      console.log('✅ Dashboard data loaded:', response);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (error: any) {
      console.error('❌ Dashboard load error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Use simple fallback data
      setDashboardData({
        stats: {
          activeHealthConcerns: 0,
          activeCarePlans: 0,
          totalRecommendations: 0,
          completedRecommendations: 0
        },
        activeContexts: [],
        activeCarePlans: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData();
  };

  // Show loading only if no data and currently loading
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Always show dashboard with data (even if fallback)
  const data = dashboardData || {
    stats: {
      activeHealthConcerns: 0,
      activeCarePlans: 0,
      totalRecommendations: 0,
      completedRecommendations: 0
    },
    activeContexts: [],
    activeCarePlans: [],
    recentActivity: []
  };

  const completionPercentage = data.stats.totalRecommendations > 0
    ? Math.round((data.stats.completedRecommendations / data.stats.totalRecommendations) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.profile.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Here's your health overview for today
              </p>
            </div>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              size="sm"
              className="flex items-center"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Using cached data. Error: {error}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Concerns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stats.activeHealthConcerns}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Care Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stats.activeCarePlans}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stats.completedRecommendations}/{data.stats.totalRecommendations}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{completionPercentage}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Health Contexts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Health Concerns</h2>
              <Link to="/chat">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </Link>
            </div>

            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active health concerns</p>
              <p className="text-sm text-gray-400 mb-4">
                Start a conversation with our AI to track your health
              </p>
              <Link to="/chat">
                <Button>Start Health Chat</Button>
              </Link>
            </div>
          </Card>

          {/* Active Care Plans */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Care Plans</h2>
              <Link to="/care-plans">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active care plans</p>
              <p className="text-sm text-gray-400 mt-1">
                Care plans are created automatically when you chat with our AI
              </p>
            </div>
          </Card>
        </div>

        {/* Debug Info */}
        <div className="mt-8 text-xs text-gray-400 text-center">
          Dashboard loaded: {new Date().toLocaleTimeString()} | 
          Loading: {loading ? 'Yes' : 'No'} | 
          Error: {error ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}