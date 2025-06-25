import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Moon, Sun, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { sleepApi } from '../../services/sleepApi';

interface SleepSetupWizardProps {
  onComplete: () => void;
}

export const SleepSetupWizard: React.FC<SleepSetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    chronotype: 'intermediate' as 'morning' | 'evening' | 'intermediate',
    weekdayBedtime: '22:30',
    weekdayWakeTime: '06:30',
    weekendBedtime: '23:30',
    weekendWakeTime: '08:00',
    targetSleepHours: 8
  });

  const steps = [
    {
      title: 'What\'s your chronotype?',
      description: 'Are you naturally a morning person or night owl?',
      component: ChronotypeStep
    },
    {
      title: 'Weekday schedule',
      description: 'When do you usually sleep on weekdays?',
      component: WeekdayScheduleStep
    },
    {
      title: 'Weekend schedule',
      description: 'How about weekends?',
      component:  WeekendScheduleStep
    },
    {
      title: 'Sleep target',
      description: 'How many hours of sleep do you aim for?',
      component: SleepTargetStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await sleepApi.createProfile(formData);
      onComplete();
    } catch (error) {
      console.error('Error creating sleep profile:', error);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const StepComponent = steps[currentStep].component;

  return (
    <Card className="max-w-2xl mx-auto p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-400 mb-8">
            {steps[currentStep].description}
          </p>

          <StepComponent 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          className="flex items-center"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

// Step Components
const ChronotypeStep: React.FC<{
  formData: any;
  updateFormData: (updates: any) => void;
}> = ({ formData, updateFormData }) => {
  const chronotypes = [
    {
      value: 'morning',
      icon: Sun,
      title: 'Morning Person',
      description: 'I naturally wake up early and feel most alert in the morning',
      time: 'Peak: 6AM - 12PM'
    },
    {
      value: 'intermediate',
      icon: Clock,
      title: 'Intermediate',
      description: 'I\'m flexible with my schedule and adapt well to different times',
      time: 'Peak: 10AM - 6PM'
    },
    {
      value: 'evening',
      icon: Moon,
      title: 'Night Owl',
      description: 'I prefer staying up late and feel most alert in the evening',
      time: 'Peak: 2PM - 10PM'
    }
  ];

  return (
    <div className="space-y-4">
      {chronotypes.map((type) => {
        const Icon = type.icon;
        const isSelected = formData.chronotype === type.value;
        
        return (
          <motion.div
            key={type.value}
            className={`p-6 border rounded-xl cursor-pointer transition-all ${
              isSelected 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => updateFormData({ chronotype: type.value })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <Icon className={`h-8 w-8 mt-1 ${
                isSelected ? 'text-purple-400' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {type.title}
                </h3>
                <p className="text-gray-300 mb-2">
                  {type.description}
                </p>
                <p className="text-sm text-gray-400">
                  {type.time}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const WeekdayScheduleStep: React.FC<{
  formData: any;
  updateFormData: (updates: any) => void;
}> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Weekday Bedtime
        </label>
        <input
          type="time"
          value={formData.weekdayBedtime}
          onChange={(e) => updateFormData({ weekdayBedtime: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Weekday Wake Time
        </label>
        <input
          type="time"
          value={formData.weekdayWakeTime}
          onChange={(e) => updateFormData({ weekdayWakeTime: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          💡 Tip: Consistency is key for good sleep health. Try to maintain regular sleep times even on weekdays.
        </p>
      </div>
    </div>
  );
};

const WeekendScheduleStep: React.FC<{
  formData: any;
  updateFormData: (updates: any) => void;
}> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Weekend Bedtime
        </label>
        <input
          type="time"
          value={formData.weekendBedtime}
          onChange={(e) => updateFormData({ weekendBedtime: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Weekend Wake Time
        </label>
        <input
          type="time"
          value={formData.weekendWakeTime}
          onChange={(e) => updateFormData({ weekendWakeTime: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          💡 Tip: Try not to shift your weekend schedule by more than 1-2 hours from weekdays to maintain your circadian rhythm.
        </p>
      </div>
    </div>
  );
};

const SleepTargetStep: React.FC<{
  formData: any;
  updateFormData: (updates: any) => void;
}> = ({ formData, updateFormData }) => {
  const sleepTargets = [7, 7.5, 8, 8.5, 9];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Target Sleep Hours per Night
        </label>
        <div className="grid grid-cols-5 gap-3">
          {sleepTargets.map((hours) => (
            <motion.button
              key={hours}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.targetSleepHours === hours
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
              onClick={() => updateFormData({ targetSleepHours: hours })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl font-bold">{hours}</div>
              <div className="text-xs">hours</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          💡 Most adults need 7-9 hours of sleep per night. Choose what feels right for you based on how you feel with different amounts of sleep.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Your Sleep Schedule Preview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Weekdays:</span>
            <div className="text-white font-medium">
              {formData.weekdayBedtime} - {formData.weekdayWakeTime}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Weekends:</span>
            <div className="text-white font-medium">
              {formData.weekendBedtime} - {formData.weekendWakeTime}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Target:</span>
            <div className="text-white font-medium">
              {formData.targetSleepHours} hours/night
            </div>
          </div>
          <div>
            <span className="text-gray-400">Chronotype:</span>
            <div className="text-white font-medium capitalize">
              {formData.chronotype}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};