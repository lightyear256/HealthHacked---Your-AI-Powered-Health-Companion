import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SleepDashboard } from '../components/sleep/SleepDashboard';
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

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const slideVariants = {
  left: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  right: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  up: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }
};

export function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

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

  const handleDeleteHealthContext = async (contextId: string, contextName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${contextName}"? This will also remove any associated care plans.`)) {
      return;
    }

    try {
      setDeletingItem(contextId);
      const response = await healthAPI.deleteHealthContext(contextId);

      if (response.success) {
        toast.success('Health concern deleted successfully');
        loadDashboardData(); // Refresh dashboard
      } else {
        throw new Error(response.message || 'Failed to delete health concern');
      }
    } catch (error: any) {
      console.error('❌ Delete health context error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete health concern';
      toast.error(errorMessage);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteCarePlan = async (carePlanId: string, planTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the care plan "${planTitle}"?`)) {
      return;
    }

    try {
      setDeletingItem(carePlanId);
      const response = await healthAPI.deleteCarePlan(carePlanId);

      if (response.success) {
        toast.success('Care plan deleted successfully');
        loadDashboardData(); // Refresh dashboard
      } else {
        throw new Error(response.message || 'Failed to delete care plan');
      }
    } catch (error: any) {
      console.error('❌ Delete care plan error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete care plan';
      toast.error(errorMessage);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData();
  };

  // Show loading state
  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="mt-4 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading your health dashboard...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleManualRefresh} className="flex items-center mx-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 to-black"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div className="mb-8 mt-20" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-3xl font-bold text-white"
                variants={slideVariants.left}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Welcome back, {user?.profile.name}!
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600"
                variants={slideVariants.left}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Here's your health overview for today
              </motion.p>
            </div>
            <motion.div
              variants={slideVariants.right}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                className="flex items-center"
                disabled={loading}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : {}}
                  transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
                Refresh
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-yellow-800">
                  ⚠️ Some data may be outdated: {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: Heart, label: "Active Concerns", value: data.stats.activeHealthConcerns, color: "red" },
            { icon: Calendar, label: "Care Plans", value: data.stats.activeCarePlans, color: "blue" },
            { icon: CheckCircle2, label: "Completed", value: `${data.stats.completedRecommendations}/${data.stats.totalRecommendations}`, color: "green" },
            { icon: TrendingUp, label: "Progress", value: `${completionPercentage}%`, color: "purple" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              className="cursor-pointer"
            >
              <Card className={`p-6 text-white hover:shadow-lg hover:shadow-${stat.color}-500/20 transition-shadow duration-300`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                    </motion.div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">{stat.label}</p>
                    <motion.p
                      className="text-2xl font-bold"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Active Health Contexts */}
          <motion.div variants={slideVariants.left} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.5 }}>
            <Card className="p-6 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Active Health Concerns</h2>
                <Link to="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm">
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                      </motion.div>
                      Chat with AI
                    </Button>
                  </motion.div>
                </Link>
              </div>

              <AnimatePresence>
                {data.activeContexts && data.activeContexts.length > 0 ? (
                  <motion.div className="space-y-4">
                    {data.activeContexts.map((context, index) => (
                      <motion.div
                        key={context._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(75, 85, 99, 0.5)"
                        }}
                        className="border-slate-600 rounded-lg p-4 text-white hover:border-purple-500/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{context.primaryConcern}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Severity: <span className={`font-medium ${getSeverityColor(context.severity)}`}>
                                {context.severity}/10
                              </span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Started {formatDistanceToNow(new Date(context.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(context.status)}`}
                              animate={{
                                scale: [1, 1.05, 1],
                                opacity: [1, 0.8, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {context.status}
                            </motion.span>
                            <button
                              onClick={() => handleDeleteHealthContext(context._id, context.primaryConcern)}
                              disabled={deletingItem === context._id}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
                              title="Delete health concern"
                            >
                              {deletingItem === context._id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        {context.symptoms && context.symptoms.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">Symptoms:</p>
                            <motion.div
                              className="flex flex-wrap gap-1 mt-1"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              {context.symptoms.map((symptom, idx) => (
                                <motion.span
                                  key={idx}
                                  variants={itemVariants}
                                  whileHover={{ scale: 1.1 }}
                                  className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors duration-200"
                                >
                                  {symptom}
                                </motion.span>
                              ))}
                            </motion.div>
                          </div>
                        )}
                        <Link to={`/chat?context=${context._id}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button variant="primary" size="sm" className="mt-3 w-full">
                              Continue Conversation →
                            </Button>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-500">No active health concerns</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Start a conversation with our AI to track your health
                    </p>
                    <Link to="/chat">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button>Start Health Chat</Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Active Care Plans */}
          <motion.div variants={slideVariants.right} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.6 }}>
            <Card className="p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Active Care Plans</h2>
                <Link to="/care-plans">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm">View All</Button>
                  </motion.div>
                </Link>
              </div>

              <AnimatePresence>
                {data.activeCarePlans && data.activeCarePlans.length > 0 ? (
                  <motion.div className="space-y-4">
                    {data.activeCarePlans.map((plan, index) => {
                      const completedCount = plan.recommendations?.filter(r => r.completed).length || 0;
                      const totalCount = plan.recommendations?.length || 0;
                      const planProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                      return (
                        <motion.div
                          key={plan._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(75, 85, 99, 0.5)"
                          }}
                          className="rounded-lg p-4 text-white hover:bg-gray-800 transition-colors relative"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{plan.title}</h3>
                              {plan.contextId && (
                                <p className="text-sm text-gray-500 mt-1">
                                  For: {plan.contextId.primaryConcern}
                                </p>
                              )}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Progress</span>
                                  <motion.span
                                    className="font-medium text-white"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {planProgress}%
                                  </motion.span>
                                </div>
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    className="[background:linear-gradient(269deg,rgba(122,41,204,1)_0%,rgba(105,96,204,1)_50%,rgba(204,204,255,1)_100%)] h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${planProgress}%` }}
                                    transition={{
                                      duration: 1,
                                      ease: "easeOut",
                                      delay: 0.5
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  {completedCount} of {totalCount} tasks completed
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCarePlan(plan._id, plan.title)}
                              disabled={deletingItem === plan._id}
                              className="ml-3 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
                              title="Delete care plan"
                            >
                              {deletingItem === plan._id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <Link to={`/care-plans/${plan._id}`}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button variant="primary" size="sm" className="mt-3 w-full">
                                View Care Plan →
                              </Button>
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-500">No active care plans</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Care plans are created automatically when you chat with our AI
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
        <motion.div variants={slideVariants.left} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.8 }}>
          <SleepDashboard />
        </motion.div>
        {/* Recent Activity */}
        <AnimatePresence>
          {data.recentActivity && data.recentActivity.length > 0 && (
            <motion.div
              variants={slideVariants.up}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="mt-8 p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data.recentActivity.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity._id}
                      variants={itemVariants}
                      whileHover={{
                        backgroundColor: "rgba(75, 85, 99, 0.25)",
                        x: 5
                      }}
                      className="flex items-center justify-between py-2 border-b last:border-0 transition-all duration-200 rounded px-2"
                    >
                      <div className="flex items-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        >
                          <Clock className="h-4 w-4 text-gray-400 mr-3" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.primaryConcern}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <motion.span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activity.status}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>

  );
}