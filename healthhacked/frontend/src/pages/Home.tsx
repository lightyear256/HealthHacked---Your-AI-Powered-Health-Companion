// ================================
// File: frontend/src/pages/Home.tsx
// ================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Clock, 
  Brain,
  ChevronRight,
  Star
} from 'lucide-react';

export function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your AI-Powered
              <span className="text-health-600"> Health </span>
              Companion
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get personalized health guidance, symptom analysis, and continuous care 
              from our advanced AI assistant. Available 24/7 to support your wellness journey.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isAuthenticated ? (
                <Link to="/chat">
                  <Button size="lg" className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Start Chatting</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Get Started Free</span>
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline" size="lg">
                      Watch Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Health Support
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Advanced AI technology combined with medical expertise to provide 
              you with reliable health guidance.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Brain className="h-8 w-8 text-primary-600" />}
                title="AI Symptom Analysis"
                description="Describe your symptoms and get instant analysis with potential causes and recommended actions."
              />
              <FeatureCard
                icon={<MessageCircle className="h-8 w-8 text-health-600" />}
                title="24/7 Health Chat"
                description="Access health guidance anytime with our intelligent chatbot that learns from your health journey."
              />
              <FeatureCard
                icon={<Calendar className="h-8 w-8 text-blue-600" />}
                title="Personalized Care Plans"
                description="Receive customized care recommendations and track your progress over time."
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8 text-orange-600" />}
                title="Follow-up Reminders"
                description="Get timely check-ins and reminders to stay on top of your health goals."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-green-600" />}
                title="Emergency Detection"
                description="Automatic detection of emergency situations with immediate guidance for urgent care."
              />
              <FeatureCard
                icon={<Heart className="h-8 w-8 text-red-600" />}
                title="Continuous Monitoring"
                description="Track your symptoms and health progress with intelligent monitoring and insights."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How HealthHacked Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to get personalized health guidance
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <StepCard
                step="1"
                title="Describe Your Symptoms"
                description="Tell our AI assistant about what you're experiencing in natural language."
              />
              <StepCard
                step="2"
                title="Get Instant Analysis"
                description="Receive personalized insights, potential causes, and recommended next steps."
              />
              <StepCard
                step="3"
                title="Follow Your Care Plan"
                description="Track your progress with personalized recommendations and follow-up check-ins."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our users say about their HealthHacked experience
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <TestimonialCard
                quote="HealthHacked helped me understand my symptoms and guided me to seek the right care. The follow-up reminders keep me on track."
                author="Sarah M."
                role="Working Professional"
                rating={5}
              />
              <TestimonialCard
                quote="The AI is incredibly smart and compassionate. It felt like talking to a knowledgeable friend who truly cares about my health."
                author="Michael R."
                role="Student"
                rating={5}
              />
              <TestimonialCard
                quote="I love how it remembers my health journey and provides personalized recommendations. It's like having a health assistant 24/7."
                author="Jennifer L."
                role="Parent"
                rating={5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Start Your Health Journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-200">
              Join thousands of users who trust HealthHacked for their health guidance. 
              Get started today and experience personalized AI health support.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button variant="secondary" size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/learn-more" className="text-sm font-semibold leading-6 text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
}

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold mb-6">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

function TestimonialCard({ quote, author, role, rating }: TestimonialCardProps) {
  return (
    <Card>
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-600 mb-4 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </Card>
  );
}
