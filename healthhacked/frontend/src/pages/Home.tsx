
import React from "react";
import { Link } from "react-router-dom";
import { motion, useAnimationControls } from 'framer-motion';
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

  // Text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  const magneticVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 0.5,
        },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      },
    },
  };

  return (
    <> 
      {/* Hero Section with Animated Background */}
      <section 
        id="about" 
        className="relative overflow-hidden py-20 sm:py-32 absolute top-0"
        style={{
          background: 'linear-gradient(4deg,rgba(15, 23, 42, 1) 0%, rgba(49, 46, 129, 1) 73%, rgba(107, 33, 168, 1) 100%)',
          minHeight: '100vh'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Enhanced Gradient Orbs with Breathing Effect */}
          <motion.div 
            className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1.1, 1.2, 1],
              opacity: [0.3, 0.6, 0.4, 0.5, 0.3],
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 15, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.3, 1.1, 1.2],
              opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
              x: [0, -25, 20, -15, 0],
              y: [0, 15, -25, 10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 0.9, 1.1, 1],
              opacity: [0.1, 0.4, 0.2, 0.3, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Enhanced Floating Health Icons with Magnetic Effect */}
          {floatingIcons.map((item, index) => {
            const { Icon, delay, x, y, size } = item;
            return (
              <motion.div
                key={index}
                className="absolute text-white/20 cursor-pointer"
                style={{
                  left: x,
                  top: y,
                }}
                animate={{
                  y: [0, -30, 15, -20, 0],
                  rotate: [0, 15, -10, 8, 0],
                  scale: [1, 1.2, 0.9, 1.1, 1],
                }}
                whileHover={{
                  scale: 1.5,
                  rotate: 360,
                  color: "rgba(168, 85, 247, 0.8)",
                  transition: { duration: 0.3 }
                }}
                transition={{
                  duration: 4 + (index % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: parseFloat(delay.replace('s', '')),
                }}
              >
                <Icon 
                  size={size} 
                  className="drop-shadow-lg filter"
                />
              </motion.div>
            );
          })}

          {/* Enhanced Floating Particles with Trails */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  background: `radial-gradient(circle, rgba(168, 85, 247, ${0.3 + Math.random() * 0.7}) 0%, transparent 70%)`,
                }}
                animate={{
                  y: [0, -150 - Math.random() * 100, 0],
                  x: [0, (Math.random() - 0.5) * 100, 0],
                  opacity: [0, 1, 0.5, 1, 0],
                  scale: [0, 1.5, 1, 1.2, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Animated Grid Pattern */}
          <motion.div 
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ["0px 0px", "50px 50px", "0px 0px"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Hero Content with Enhanced Animations */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
           <div className="flex items-center justify-center relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl font-bold tracking-tight text-white sm:text-6xl z-10 drop-shadow-lg mt-20 text-center"
      >
        {"Your AI-Powered".split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            style={{ display: 'inline-block' }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
        <br />
        <motion.span 
          className="text-purple-400" 
          animate={{ 
            textShadow: [
              "0 0 10px rgba(168, 85, 247, 0.5)",
              "0 0 30px rgba(168, 85, 247, 1)",
              "0 0 20px rgba(168, 85, 247, 0.8)",
              "0 0 30px rgba(168, 85, 247, 1)",
              "0 0 10px rgba(168, 85, 247, 0.5)"
            ]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          whileHover={{
            scale: 1.1,
            rotate: [0, -2, 2, 0],
            transition: { duration: 0.5 }
          }}
        >
          {" Health "}
        </motion.span>
        {"Companion".split("").map((char, index) => (
          <motion.span
            key={index + 100}
            variants={letterVariants}
            style={{ display: 'inline-block' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
      
      {/* Floating Robot on the right */}
      <motion.div
        className="absolute z-5 right-0 top-0"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileHover={{
          scale: 1.2,
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
      >
        <motion.img 
          src="https://framerusercontent.com/images/IgecgZtCrDbm170U2W4lLbyak.png" 
          height={120} 
          width={120}
          alt="Robot"
          className="drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
          animate={{
            filter: [
              "drop-shadow(0 10px 20px rgba(168, 85, 247, 0.3))",
              "drop-shadow(0 15px 30px rgba(168, 85, 247, 0.6))",
              "drop-shadow(0 10px 20px rgba(168, 85, 247, 0.3))"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles around robot */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60"
            style={{
              left: `${30 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-purple-200 drop-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
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
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-2xl hover:shadow-purple-500/25"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <MessageCircle className="h-5 w-5" />
                      </motion.div>
                      <span>Start Chatting</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Button
                        size="lg"
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-2xl hover:shadow-purple-500/25"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Heart className="h-5 w-5" />
                        </motion.div>
                        <span>Get Started Free</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div
                    whileHover={{ 
                      scale: 1.05, 
                      x: 10,
                      textShadow: "0 0 10px rgba(168, 85, 247, 0.8)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link
                      to="/demo"
                      className="flex items-center border-none bg-transparent text-white hover:bg-transparent hover:text-purple-400 hover:underline"
                    >
                      Watch Demo
                      <motion.div
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Bottom Fade */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Features Section - Enhanced with More Animations */}
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
              whileHover={{ 
                scale: 1.05,
                backgroundImage: "linear-gradient(45deg, #ffffff, #a855f7, #3b82f6, #ffffff)",
                transition: { duration: 0.3 }
              }}
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
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How HealthHacked Works
            </h2>
            <p className="mt-4 text-lg text-purple-200">
              Simple steps to get personalized health guidance
            </p>
          </motion.div>

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
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-lg text-purple-200">
              See what our users say about their HealthHacked experience
            </p>
          </motion.div>

          {/* Enhanced Carousel Container */}
          <div className="relative">
            <motion.div
              className="flex gap-8"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              }}
              style={{ width: "200%" }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-96"
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
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

            {/* Enhanced Gradient overlays */}
            <div className="absolute -left-10 top-0 w-40 h-72 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
            <div className="absolute -right-10 top-0 w-40 h-72 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <motion.h3 
                className="text-xl font-bold text-white mb-4"
                whileHover={{ 
                  scale: 1.05,
                  color: "#a855f7",
                  transition: { duration: 0.2 }
                }}
              >
                HealthHacked
              </motion.h3>
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
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to="/#about"
                      className="text-purple-200 hover:text-purple-400 text-sm"
                      onClick={(e) => {
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
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to="/#features"
                      className="text-purple-200 hover:text-purple-400 text-sm"
                      onClick={(e) => {
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
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to="mailto:healthhacked1@gmail.com"
                      className="text-purple-200 hover:text-purple-400 text-sm"
                    >
                      Contact
                    </Link>
                  </motion.div>
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
                <motion.a
                  href="mailto:healthhacked1@gmail.com"
                  className="text-purple-200 hover:text-purple-400 transition-colors"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 15,
                    color: "#a855f7"
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200 text-sm">
              © 2025 HealthHacked. All rights reserved.
            </p>
            
          </div>
        </div>
      </footer>
      <BubbleCursor />
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
  const controls = useAnimationControls();

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.08,
        y: -15,
        rotateY: 5,
        transition: { 
          duration: 0.4, 
          ease: "easeOut",
          type: "spring",
          stiffness: 300
        },
      }}
      onHoverStart={() => {
        controls.start({
          rotate: [0, -2, 2, -1, 1, 0],
          transition: { duration: 0.6, ease: "easeInOut" }
        });
      }}
      className="relative group perspective-1000"
    >
      <motion.div 
        animate={controls}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-8 backdrop-blur-md border border-slate-700/50 hover:border-purple-400/70 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25"
      >
        {/* Enhanced glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at center, rgba(147, 51, 234, 0.2) 0%, rgba(79, 70, 229, 0.1) 50%, transparent 80%)",
          }}
        />

        {/* Floating particles effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Icon container with enhanced animation */}
        <motion.div
          whileHover={{ 
            rotate: [0, -10, 10, -5, 5, 0], 
            scale: 1.2,
            y: -5,
          }}
          transition={{ 
            rotate: { duration: 0.6 },
            scale: { type: "spring", stiffness: 400, damping: 15 },
            y: { type: "spring", stiffness: 400, damping: 15 }
          }}
          className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-700/90 p-4 shadow-lg relative overflow-hidden"
        >
          {/* Icon background pulse */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10">
            {icon}
          </div>
        </motion.div>

        <motion.h3
          className="text-xl font-bold text-white mb-4 relative"
          whileHover={{ 
            x: 8,
            color: "#c084fc",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 20,
            color: { duration: 0.3 }
          }}
        >
          {title}
          {/* Text underline animation */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.h3>

        <motion.p
          className="text-slate-300 leading-relaxed relative"
          whileHover={{ 
            x: 8,
            color: "#e2e8f0",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            delay: 0.05,
            color: { duration: 0.3 }
          }}
        >
          {description}
        </motion.p>

        {/* Enhanced shine effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, rgba(147, 51, 234, 0.1) 70%, transparent 90%)",
          }}
          initial={{ x: "-100%", rotate: -15 }}
          whileHover={{ x: "100%", rotate: -15 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Border animation */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(45deg, #8b5cf6, #3b82f6, #8b5cf6) border-box",
            mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
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
    <motion.div 
      className="text-center relative"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      {/* Step number with enhanced animations */}
      <motion.div 
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white text-2xl font-bold mb-6 shadow-2xl shadow-purple-500/40 relative overflow-hidden"
        whileHover={{ 
          scale: 1.15,
          rotate: [0, -5, 5, 0],
          boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.6)"
        }}
        transition={{ 
          scale: { type: "spring", stiffness: 400, damping: 15 },
          rotate: { duration: 0.5 },
          boxShadow: { duration: 0.3 }
        }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <span className="relative z-10">{step}</span>
      </motion.div>

      <motion.h3 
        className="text-xl font-semibold text-white mb-4"
        whileHover={{ 
          scale: 1.05,
          color: "#c084fc",
        }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-purple-200"
        whileHover={{ 
          color: "#e2e8f0",
          y: -2,
        }}
        transition={{ duration: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400/30 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.7, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        rotateY: 2,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="h-full"
    >
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border-slate-700/50 backdrop-blur-md p-8 h-full rounded-2xl relative overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at top right, rgba(147, 51, 234, 0.1), transparent 70%)",
          }}
        />

        {/* Stars with stagger animation */}
        <motion.div 
          className="flex mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[...Array(rating)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0, rotate: -180 },
                visible: { 
                  opacity: 1, 
                  scale: 1, 
                  rotate: 0,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }
                }
              }}
              whileHover={{ 
                scale: 1.3, 
                rotate: 360,
                color: "#fbbf24"
              }}
              transition={{ 
                scale: { duration: 0.2 },
                rotate: { duration: 0.6 },
                color: { duration: 0.3 }
              }}
            >
              <Star className="h-5 w-5 text-amber-400 fill-current cursor-pointer" />
            </motion.div>
          ))}
        </motion.div>

        {/* Quote with typewriter effect simulation */}
        <motion.p 
          className="text-purple-200 mb-6 italic leading-relaxed relative"
          whileHover={{ 
            color: "#e2e8f0",
            x: 5 
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.5 }}
          >
            "
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: quote.length * 0.02, delay: 0.6 }}
          >
            {quote}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.8 }}
          >
            "
          </motion.span>
          
          {/* Quote decoration */}
          <motion.div
            className="absolute -top-4 -left-2 text-4xl text-purple-400/30 font-serif"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            "
          </motion.div>
        </motion.p>

        <motion.div 
          className="mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.p 
            className="font-semibold text-white mb-1"
            whileHover={{ 
              color: "#c084fc",
              x: 3
            }}
            transition={{ duration: 0.3 }}
          >
            {author}
          </motion.p>
          <motion.p 
            className="text-sm text-purple-300"
            whileHover={{ 
              color: "#e2e8f0",
              x: 3
            }}
            transition={{ duration: 0.3 }}
          >
            {role}
          </motion.p>
        </motion.div>

        {/* Subtle border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            borderImage: "linear-gradient(45deg, #8b5cf6, transparent, #3b82f6, transparent) 1",
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
}