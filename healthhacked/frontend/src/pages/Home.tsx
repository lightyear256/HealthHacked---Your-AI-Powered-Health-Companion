import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Heart,
  MessageCircle,
  Calendar,
  Shield,
  Clock,
  Brain,
  ChevronRight,
  Star,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Activity,
  Stethoscope,
  Pill,
  Plus,
  Eye,
  Zap,
} from "lucide-react";

import { BubbleCursor } from "@/components/ui/BubbleCursor";

import {
  getDuplicatedTestimonials,
  type Testimonial,
} from "../data/testimonial";
import { Header } from "@/components/Header";



export function Home() {
  const { isAuthenticated } = useAuthStore();
  const duplicatedTestimonials = getDuplicatedTestimonials();

  // Floating health icons configuration
  const floatingIcons = [
    { Icon: Heart, delay: '0s', x: '10%', y: '20%', size: 24 },
    { Icon: Activity, delay: '1s', x: '80%', y: '15%', size: 20 },
    { Icon: Shield, delay: '2s', x: '15%', y: '70%', size: 22 },
    { Icon: Stethoscope, delay: '0.5s', x: '85%', y: '60%', size: 26 },
    { Icon: Pill, delay: '1.5s', x: '5%', y: '45%', size: 18 },
    { Icon: Plus, delay: '2.5s', x: '90%', y: '35%', size: 20 },
    { Icon: Brain, delay: '3s', x: '25%', y: '25%', size: 22 },
    { Icon: Eye, delay: '0.8s', x: '75%', y: '75%', size: 24 },
    { Icon: Zap, delay: '1.8s', x: '30%', y: '80%', size: 20 },
    { Icon: Activity, delay: '2.2s', x: '60%', y: '10%', size: 18 },
  ];

  return (
    <> 
    {/* <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black"> */}
      
      {/* Hero Section with Animated Background */}
      <section 
        id="about" 
        className="relative overflow-hidden py-20 sm:py-32 absolute top-0"
        style={{
          background: 'linear-gradient(4deg,rgba(15, 23, 42, 1) 0%, rgba(49, 46, 129, 1) 73%, rgba(107, 33, 168, 1) 100%)',
          minHeight: '100vh'
        }}
      >
         {/* <Header /> */}
       
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Large Gradient Orbs */}
          <motion.div 
            className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Floating Health Icons */}
          {floatingIcons.map((item, index) => {
            const { Icon, delay, x, y, size } = item;
            return (
              <motion.div
                key={index}
                className="absolute text-white/20"
                style={{
                  left: x,
                  top: y,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3 + (index % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: parseFloat(delay.replace('s', '')),
                }}
              >
                <Icon 
                  size={size} 
                  className="drop-shadow-lg"
                />
              </motion.div>
            );
          })}

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg mt-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Your AI-Powered
              <motion.span 
                className="text-purple-400" 
                animate={{ 
                  textShadow: [
                    "0 0 10px rgba(168, 85, 247, 0.5)",
                    "0 0 20px rgba(168, 85, 247, 0.8)",
                    "0 0 10px rgba(168, 85, 247, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >  Health </motion.span>
              Companion
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-purple-200 drop-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Get personalized health guidance, symptom analysis, and continuous
              care from our advanced AI assistant. Available 24/7 to support
              your wellness journey.
            </motion.p>
            <motion.div 
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {isAuthenticated ? (
                <Link to="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-2xl hover:shadow-purple-500/25"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Start Chatting</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-2xl hover:shadow-purple-500/25"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Heart className="h-5 w-5" />
                        </motion.div>
                        <span>Get Started Free</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to="/demo"
                      className="flex items-center border-none bg-transparent text-white hover:bg-transparent hover:text-purple-400 hover:underline"
                    >
                      Watch Demo
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
      </section>

      {/* Features Section - Enhanced with Framer Motion */}
      <section
        id="features"
        className="py-24 bg-gradient-to-br from-slate-900 to-black"
      >
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
              transition={{ duration: 0.8, delay: 0.05 }}
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
            transition={{ duration: 0.8, delay: 0.2 }}
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

      {/* Testimonials Carousel Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-black overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-lg text-purple-200">
              See what our users say about their HealthHacked experience
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <motion.div
              className="flex gap-8"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              }}
              style={{ width: "200%" }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-96"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <TestimonialCard
                    quote={testimonial.quote}
                    author={testimonial.author}
                    role={testimonial.role}
                    rating={testimonial.rating}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0  h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0  h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">
                HealthHacked
              </h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Your AI-powered health companion providing personalized guidance
                and support for your wellness journey.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/#about"
                    className="text-purple-200 hover:text-purple-400 text-sm"
                    onClick={(e) => {
                      // If we're already on the home page, scroll to features
                      if (window.location.pathname === "/") {
                        e.preventDefault();
                        document.getElementById("about")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#features"
                    className="text-purple-200 hover:text-purple-400 text-sm"
                    onClick={(e) => {
                      // If we're already on the home page, scroll to features
                      if (window.location.pathname === "/") {
                        e.preventDefault();
                        document.getElementById("features")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="mailto:healthhacked1@gmail.com"
                    className="text-purple-200 hover:text-purple-400 text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
              <p className="text-purple-200 text-sm mb-4">
                Stay updated with our latest news and health tips
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:healthhacked1@gmail.com"
                  className="text-purple-200 hover:text-purple-400 transition-colors"
                >
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
              <Link
                to="/privacy"
                className="text-purple-200 hover:text-purple-400 text-sm"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-purple-200 hover:text-purple-400 text-sm"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-purple-200 hover:text-purple-400 text-sm"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <BubbleCursor />
    {/* </div> */}
    </>
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
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at center, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
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
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.05,
          }}
        >
          {description}
        </motion.p>

        {/* Subtle shine effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.05) 50%, transparent 60%)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
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

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: TestimonialCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm p-8 h-full">
      <div className="flex mb-6">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
        ))}
      </div>
      <p className="text-purple-200 mb-6 italic leading-relaxed">"{quote}"</p>
      <div className="mt-auto">
        <p className="font-semibold text-white">{author}</p>
        <p className="text-sm text-purple-300">{role}</p>
      </div>
    </Card>
  );
}