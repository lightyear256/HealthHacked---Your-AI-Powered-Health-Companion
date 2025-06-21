// ================================
// File: frontend/src/pages/Home.tsx
// ================================
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Star,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail
} from 'lucide-react';

export function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your AI-Powered
              <span className="text-purple-400"> Health </span>
              Companion
            </h1>
            <p className="mt-6 text-lg leading-8 text-purple-200">
              Get personalized health guidance, symptom analysis, and continuous care 
              from our advanced AI assistant. Available 24/7 to support your wellness journey.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isAuthenticated ? (
                <Link to="/chat">
                  <Button size="lg" className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none">
                    <MessageCircle className="h-5 w-5" />
                    <span>Start Chatting</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none">
                      <Heart className="h-5 w-5" />
                      <span>Get Started Free</span>
                    </Button>
                  </Link>
                  <Link to="/demo" className="flex items-center border-none bg-transparent text-white hover:bg-transparent hover:text-purple-400 hover:underline">
                    Watch Demo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Framer Motion */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              Comprehensive Health Support
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-purple-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Advanced AI technology combined with medical expertise to provide 
              you with reliable health guidance.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 max-w-5xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Brain className="h-8 w-8 text-purple-400" />}
                title="AI Symptom Analysis"
                description="Describe your symptoms and get instant analysis with potential causes and recommended actions."
                index={0}
              />
              <FeatureCard
                icon={<MessageCircle className="h-8 w-8 text-blue-400" />}
                title="24/7 Health Chat"
                description="Access health guidance anytime with our intelligent chatbot that learns from your health journey."
                index={1}
              />
              <FeatureCard
                icon={<Calendar className="h-8 w-8 text-indigo-400" />}
                title="Personalized Care Plans"
                description="Receive customized care recommendations and track your progress over time."
                index={2}
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8 text-amber-400" />}
                title="Follow-up Reminders"
                description="Get timely check-ins and reminders to stay on top of your health goals."
                index={3}
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-emerald-400" />}
                title="Emergency Detection"
                description="Automatic detection of emergency situations with immediate guidance for urgent care."
                index={4}
              />
              <FeatureCard
                icon={<Heart className="h-8 w-8 text-pink-400" />}
                title="Continuous Monitoring"
                description="Track your symptoms and health progress with intelligent monitoring and insights."
                index={5}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How HealthHacked Works
            </h2>
            <p className="mt-4 text-lg text-purple-200">
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
      <section className="py-24 bg-gradient-to-br from-slate-900 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-lg text-purple-200">
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
      <section className="bg-gradient-to-br from-slate-900 to-black py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Start Your Health Journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-200">
              Join thousands of users who trust HealthHacked for their health guidance. 
              Get started today and experience personalized AI health support.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button variant="secondary" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/learn-more" className="text-sm font-semibold leading-6 text-white hover:text-purple-400 hover:underline flex items-center">
                    Learn more 
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">HealthHacked</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Your AI-powered health companion providing personalized guidance and support for your wellness journey.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-purple-200 hover:text-purple-400 text-sm">About Us</Link></li>
                <li><Link to="/features" className="text-purple-200 hover:text-purple-400 text-sm">Features</Link></li>
                <li><Link to="/contact" className="text-purple-200 hover:text-purple-400 text-sm">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-purple-200 hover:text-purple-400 text-sm">Help Center</Link></li>
                <li><Link to="/privacy" className="text-purple-200 hover:text-purple-400 text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-purple-200 hover:text-purple-400 text-sm">Terms of Service</Link></li>
                <li><Link to="/faq" className="text-purple-200 hover:text-purple-400 text-sm">FAQ</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
              <p className="text-purple-200 text-sm mb-4">Stay updated with our latest news and health tips</p>
              <div className="flex space-x-4">
                <a href="#" className="text-purple-200 hover:text-purple-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-purple-200 hover:text-purple-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-purple-200 hover:text-purple-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:contact@healthhacked.com" className="text-purple-200 hover:text-purple-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200 text-sm">
              © 2025 HealthHacked. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-purple-200 hover:text-purple-400 text-sm">Privacy</Link>
              <Link to="/terms" className="text-purple-200 hover:text-purple-400 text-sm">Terms</Link>
              <Link to="/cookies" className="text-purple-200 hover:text-purple-400 text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
          }}
        />
        
        {/* Icon container with animation */}
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-6 inline-flex items-center justify-center rounded-lg bg-slate-800/80 p-3"
        >
          {icon}
        </motion.div>
        
        <motion.h3
          className="text-xl font-semibold text-white mb-4"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {title}
        </motion.h3>
        
        <motion.p
          className="text-slate-300 leading-relaxed"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
        >
          {description}
        </motion.p>
        
        {/* Subtle shine effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.05) 50%, transparent 60%)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold mb-6 shadow-lg shadow-purple-500/25">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-purple-200">{description}</p>
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
    <Card className="bg-gradient-to-br from-slate-900 to-black border-slate-700 backdrop-blur-sm p-8">
      <div className="flex mb-6">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
        ))}
      </div>
      <p className="text-purple-200 mb-4 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-sm text-purple-300">{role}</p>
      </div>
    </Card>
  );
}