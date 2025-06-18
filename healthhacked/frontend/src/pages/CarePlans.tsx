import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { healthAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowLeft,
  RefreshCw,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Recommendation {
  _id: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  notes?: string;
}

interface CarePlan {
  _id: string;
  title: string;
  description: string;
  status: string;
  recommendations: Recommendation[];
  contextId: {
    _id: string;
    primaryConcern: string;
    symptoms: string[];
    status: string;
  };
  createdAt: string;
  updatedAt: string;
  progress?: {
    completedRecommendations: number;
    totalRecommendations: number;
    completionPercentage: number;
  };
}

export function CarePlans() {
  const { id } = useParams();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRecommendation, setUpdatingRecommendation] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCarePlan(id);
    } else {
      loadCarePlans();
    }
  }, [id]);

  const loadCarePlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Loading care plans...');
      const response = await healthAPI.getCarePlans();
      console.log('✅ Care plans loaded:', response);
      
      if (response.success) {
        setCarePlans(response.data.carePlans);
      } else {
        throw new Error(response.message || 'Failed to load care plans');
      }
    } catch (error: any) {
      console.error('❌ Care plans load error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load care plans';
      setError(errorMessage);
      
      // Fallback to empty array
      setCarePlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCarePlan = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Loading care plan:', planId);
      const response = await healthAPI.getCarePlan(planId);
      console.log('✅ Care plan loaded:', response);
      
      if (response.success) {
        setSelectedPlan(response.data.carePlan);
      } else {
        throw new Error(response.message || 'Failed to load care plan');
      }
    } catch (error: any) {
      console.error('❌ Care plan load error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load care plan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const completeRecommendation = async (carePlanId: string, recommendationId: string, notes: string = '') => {
    try {
      setUpdatingRecommendation(recommendationId);
      
      console.log('✅ Completing recommendation:', recommendationId);
      const response = await healthAPI.completeRecommendation(carePlanId, recommendationId, notes);
      console.log('✅ Recommendation completed:', response);
      
      if (response.success) {
        // Update the local state
        if (selectedPlan) {
          const updatedRecommendations = selectedPlan.recommendations.map(rec =>
            rec._id === recommendationId
              ? { ...rec, completed: true, completedAt: new Date().toISOString(), notes }
              : rec
          );
          
          setSelectedPlan({
            ...selectedPlan,
            recommendations: updatedRecommendations
          });
        } else {
          // Refresh the care plans list
          loadCarePlans();
        }
        
        toast.success('Recommendation completed! Great progress! 🎉');
      } else {
        throw new Error(response.message || 'Failed to complete recommendation');
      }
    } catch (error: any) {
      console.error('❌ Complete recommendation error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update recommendation';
      toast.error(errorMessage);
    } finally {
      setUpdatingRecommendation(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority === 1) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (priority === 2) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading care plans...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedPlan && carePlans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load care plans</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => id ? loadCarePlan(id) : loadCarePlans()} className="flex items-center mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Single Care Plan View
  if (selectedPlan) {
    const completedCount = selectedPlan.recommendations.filter(r => r.completed).length;
    const totalCount = selectedPlan.recommendations.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/care-plans" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Care Plans
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedPlan.title}</h1>
                <p className="mt-2 text-gray-600">{selectedPlan.description}</p>
                <p className="mt-1 text-sm text-gray-500">
                  For: <span className="font-medium">{selectedPlan.contextId.primaryConcern}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(selectedPlan.status)}`}>
                  {selectedPlan.status}
                </span>
                <Button 
                  onClick={() => loadCarePlan(selectedPlan._id)} 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Some data may be outdated: {error}
                </p>
              </div>
            )}
          </div>

          {/* Progress Overview */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="text-2xl font-bold">{completionPercentage}%</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-sm text-gray-500">Total Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</p>
                <p className="text-sm text-gray-500">Remaining</p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
            
            <div className="space-y-4">
              {selectedPlan.recommendations.map((recommendation) => (
                <div 
                  key={recommendation._id} 
                  className={`border rounded-lg p-4 transition-all ${
                    recommendation.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {recommendation.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <button
                          onClick={() => completeRecommendation(selectedPlan._id, recommendation._id)}
                          disabled={updatingRecommendation === recommendation._id}
                          className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          {updatingRecommendation === recommendation._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                          ) : null}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${recommendation.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                            {recommendation.title}
                          </h3>
                          <p className={`text-sm mt-1 ${recommendation.completed ? 'text-green-600' : 'text-gray-600'}`}>
                            {recommendation.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {getPriorityIcon(recommendation.priority)}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            recommendation.type === 'immediate' ? 'bg-red-100 text-red-800' :
                            recommendation.type === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {recommendation.type}
                          </span>
                        </div>
                      </div>
                      
                      {recommendation.dueDate && (
                        <p className={`text-xs mt-2 ${
                          recommendation.completed ? 'text-green-600' :
                          isOverdue(recommendation.dueDate) ? 'text-red-600 font-medium' :
                          'text-gray-500'
                        }`}>
                          {recommendation.completed ? (
                            `Completed: ${new Date(recommendation.completedAt!).toLocaleDateString()}`
                          ) : (
                            `Due: ${new Date(recommendation.dueDate).toLocaleDateString()}${
                              isOverdue(recommendation.dueDate) ? ' (Overdue)' : ''
                            }`
                          )}
                        </p>
                      )}
                      
                      {recommendation.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          Note: {recommendation.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Care Plans List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Care Plans</h1>
              <p className="mt-2 text-gray-600">
                Manage your personalized health care plans and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={loadCarePlans} 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link to="/chat">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Some data may be outdated: {error}
              </p>
            </div>
          )}
        </div>

        {carePlans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {carePlans.map((plan) => {
              const completedCount = plan.recommendations?.filter(r => r.completed).length || 0;
              const totalCount = plan.recommendations?.length || 0;
              const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <Card key={plan._id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                      <p className="text-sm text-gray-500">
                        For: <span className="font-medium">{plan.contextId.primaryConcern}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-green-600">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {completedCount} of {totalCount} recommendations completed
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link to={`/care-plans/${plan._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/chat?context=${plan.contextId._id}`}>
                      <Button variant="outline">
                        Continue Chat
                      </Button>
                    </Link>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Care Plans Yet</h3>
            <p className="text-gray-600 mb-6">
              Start a conversation with our AI health assistant to create personalized care plans
            </p>
            <Link to="/chat">
              <Button className="flex items-center mx-auto">
                <Plus className="h-4 w-4 mr-2" />
                Start Health Chat
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}