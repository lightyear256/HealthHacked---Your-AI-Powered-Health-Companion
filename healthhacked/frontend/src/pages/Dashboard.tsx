import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Loading dashboard data...');
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
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={handleManualRefresh} className="flex items-center mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Use actual data or fallback
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

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'text-red-600';
    if (severity >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800',
      monitoring: 'bg-blue-100 text-blue-800',
      escalated: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.active;
  };

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
                ⚠️ Some data may be outdated: {error}
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

            {data.activeContexts && data.activeContexts.length > 0 ? (
              <div className="space-y-4">
                {data.activeContexts.map((context) => (
                  <div key={context._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{context.primaryConcern}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Severity: <span className={`font-medium ${getSeverityColor(context.severity)}`}>
                            {context.severity}/10
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Started {formatDistanceToNow(new Date(context.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(context.status)}`}>
                        {context.status}
                      </span>
                    </div>
                    {context.symptoms && context.symptoms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Symptoms:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {context.symptoms.map((symptom, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Link to={`/chat?context=${context._id}`}>
                      <Button variant="ghost" size="sm" className="mt-3 w-full">
                        Continue Conversation →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </Card>

          {/* Active Care Plans */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Care Plans</h2>
              <Link to="/care-plans">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            {data.activeCarePlans && data.activeCarePlans.length > 0 ? (
              <div className="space-y-4">
                {data.activeCarePlans.map((plan) => {
                  const completedCount = plan.recommendations?.filter(r => r.completed).length || 0;
                  const totalCount = plan.recommendations?.length || 0;
                  const planProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  return (
                    <div key={plan._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          {plan.contextId && (
                            <p className="text-sm text-gray-500 mt-1">
                              For: {plan.contextId.primaryConcern}
                            </p>
                          )}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium text-gray-900">{planProgress}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${planProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {completedCount} of {totalCount} tasks completed
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link to={`/care-plans/${plan._id}`}>
                        <Button variant="ghost" size="sm" className="mt-3 w-full">
                          View Care Plan →
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active care plans</p>
                <p className="text-sm text-gray-400 mt-1">
                  Care plans are created automatically when you chat with our AI
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        {data.recentActivity && data.recentActivity.length > 0 && (
          <Card className="mt-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {data.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.primaryConcern}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}