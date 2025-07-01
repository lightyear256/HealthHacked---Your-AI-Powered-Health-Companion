import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Moon, Sun, Activity, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns';
import { healthAPI } from '../../services/api';
import toast from 'react-hot-toast';
// Sleep Calendar Component
const SleepCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [sleepData, setSleepData] = useState({});
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Mock API calls - replace with actual API calls
 const fetchCalendarData = async (year, month) => {
  setLoading(true);
  try {
    const response = await healthAPI.getSleepCalendar(year, month);
    if (response.success) {
      setSleepData(response.data.entries);
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    toast.error('Failed to load sleep data');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    fetchCalendarData(year, month);
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDebtColor = (debt) => {
    if (debt === 0) return 'bg-green-500';
    if (debt < 1) return 'bg-yellow-500';
    if (debt < 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getQualityColor = (quality) => {
    if (quality >= 8) return 'border-green-400';
    if (quality >= 6) return 'border-yellow-400';
    return 'border-red-400';
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    setEditingEntry(sleepData[dateKey] || null);
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (entryData) => {
  try {
    const sleepEntryData = {
      date: selectedDate.toISOString().split('T')[0],
      bedtime: `${format(selectedDate, 'yyyy-MM-dd')} ${entryData.bedtime}:00`,
      wakeTime: `${format(selectedDate, 'yyyy-MM-dd')} ${entryData.wakeTime}:00`,
      sleepQuality: entryData.sleepQuality,
      notes: entryData.notes
    };
    
    const response = await healthAPI.createSleepEntry(sleepEntryData);
    if (response.success) {
      toast.success('Sleep entry saved!');
      // Refresh calendar data
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      fetchCalendarData(year, month);
    }
  } catch (error) {
    console.error('Error saving sleep entry:', error);
    toast.error('Failed to save sleep entry');
  }
  setShowEntryModal(false);
  setEditingEntry(null);
};

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-28  rounded-md bg-gradient-to-br from-slate-800/50 to-slate-900/50  rounded-lg backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300  p-6 bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Moon className="h-8 w-8 text-purple-400" />
            Sleep Calendar
          </h1>
          <button 
            onClick={() => handleDayClick(new Date())}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Today's Sleep
          </button>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={() => navigateMonth('next')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayData = sleepData[dateKey];
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isDayToday = isToday(date);

            return (
              <div
                key={dateKey}
                onClick={() => handleDayClick(date)}
                className={`
                  relative h-20 p-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isCurrentMonth ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800'}
                  ${isDayToday ? 'ring-2 ring-purple-400' : ''}
                  ${dayData ? 'border-2' : 'border border-gray-600'}
                  ${dayData ? getQualityColor(dayData.sleepQuality) : ''}
                `}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                  {format(date, 'd')}
                </div>

                {/* Sleep Data Indicators */}
                {dayData && (
                  <div className="mt-1 space-y-1">
                    {/* Sleep Duration Bar */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-400" />
                      <div className="text-xs text-blue-400 font-medium">
                        {dayData.sleepDuration}h
                      </div>
                    </div>

                    {/* Sleep Quality Dots */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        dayData.sleepQuality >= 8 ? 'bg-green-400' :
                        dayData.sleepQuality >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <div className="text-xs text-gray-300">
                        {dayData.sleepQuality}/10
                      </div>
                    </div>

                    {/* Sleep Debt Indicator */}
                    {dayData.sleepDebt > 0 && (
                      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${getDebtColor(dayData.sleepDebt)}`} />
                    )}
                  </div>
                )}

                {/* Today Indicator */}
                {isDayToday && (
                  <div className="absolute bottom-1 right-1">
                    <Sun className="h-3 w-3 text-yellow-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleep Entry Modal */}
      {showEntryModal && (
        <SleepEntryModal
          date={selectedDate}
          existingEntry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setShowEntryModal(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Sleep Quality</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-400 rounded"></div>
                <span className="text-sm text-gray-300">Excellent (8-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                <span className="text-sm text-gray-300">Good (6-7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-400 rounded"></div>
                <span className="text-sm text-gray-300">Poor (1-5)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Sleep Debt</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">No debt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Light debt (&lt;1h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Moderate debt (1-2h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-300">High debt (&gt;2h)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Indicators</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Sleep duration</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sleep Entry Modal Component
const SleepEntryModal = ({ date, existingEntry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    bedtime: existingEntry?.bedtime || '22:00',
    wakeTime: existingEntry?.wakeTime || '07:00',
    sleepQuality: existingEntry?.sleepQuality || 7,
    notes: existingEntry?.notes || ''
  });

  const calculateDuration = () => {
    if (!formData.bedtime || !formData.wakeTime) return 0;
    
    const bedtimeHours = parseTime(formData.bedtime);
    let wakeTimeHours = parseTime(formData.wakeTime);
    
    // Handle next-day wake times
    if (wakeTimeHours <= bedtimeHours) {
      wakeTimeHours += 24;
    }
    
    return wakeTimeHours - bedtimeHours;
  };

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const duration = calculateDuration();
    const targetSleep = 8; // Default target, could be user-configurable
    const sleepDebt = Math.max(0, targetSleep - duration);
    
    const entryData = {
      ...formData,
      sleepDuration: parseFloat(duration.toFixed(1)),
      sleepDebt: parseFloat(sleepDebt.toFixed(1)),
      sleepEfficiency: Math.min(100, (duration / targetSleep) * 100)
    };
    
    onSave(entryData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Sleep Entry for {format(date, 'MMM d, yyyy')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bedtime Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bedtime
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.bedtime}
                onChange={(e) => setFormData({...formData, bedtime: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <Moon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Wake Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wake Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => setFormData({...formData, wakeTime: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <Sun className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Sleep Duration Display */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Sleep Duration:</span>
              <span className="text-xl font-semibold text-white">
                {calculateDuration().toFixed(1)} hours
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  calculateDuration() >= 7 ? 'bg-green-500' :
                  calculateDuration() >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (calculateDuration() / 10) * 100)}%` }}
              />
            </div>
          </div>

          {/* Sleep Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sleep Quality: {formData.sleepQuality}/10
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleepQuality}
                onChange={(e) => setFormData({...formData, sleepQuality: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Sleep Quality Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2 rounded ${formData.sleepQuality <= 4 ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-400'}`}>
              <div className="text-xs">Poor</div>
              <div className="text-sm font-medium">1-4</div>
            </div>
            <div className={`p-2 rounded ${formData.sleepQuality >= 5 && formData.sleepQuality <= 7 ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700 text-gray-400'}`}>
              <div className="text-xs">Good</div>
              <div className="text-sm font-medium">5-7</div>
            </div>
            <div className={`p-2 rounded ${formData.sleepQuality >= 8 ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-400'}`}>
              <div className="text-xs">Excellent</div>
              <div className="text-sm font-medium">8-10</div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="How did you feel? Any factors affecting your sleep?"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">
              {formData.notes.length}/500 characters
            </div>
          </div>

          {/* Sleep Debt Warning */}
          {calculateDuration() < 7 && (
            <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Sleep Debt Alert: {(8 - calculateDuration()).toFixed(1)} hours of debt
                </span>
              </div>
              <p className="text-xs text-orange-300 mt-1">
                Consider going to bed earlier tomorrow to recover.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SleepCalendar;