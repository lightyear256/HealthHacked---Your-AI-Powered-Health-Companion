import React from 'react';
import aditya from '../assets/aditya.jpg'
import ayushmaan from '../assets/ayushmaan.jpg'
import hammad from '../assets/hammad.jpg'
import { Footer } from '@/components/Footer';
import { BubbleCursor } from '@/components/ui/BubbleCursor';
import ProfileCard from '@/components/ui/ProfileCard';
import { motion } from 'framer-motion';

export const Creators: React.FC = () => {
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

  return (
    <>
      <div className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
            background: 'linear-gradient(4deg,rgba(15, 23, 42, 1) 0%, rgba(49, 46, 129, 1) 73%, rgba(107, 33, 168, 1) 100%)',
            minHeight: '100vh'
          }}  >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white z-10 drop-shadow-lg mt-8 sm:mt-12 lg:mt-16 text-center"
                  >
                    {"Meet Our Highly Talented".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        variants={letterVariants}
                        style={{ display: 'inline-block' }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                    <br />
                    
                    {"Team ".split("").map((char, index) => (
                      <motion.span
                        key={index + 100}
                        variants={letterVariants}
                        style={{ display: 'inline-block' }}
                        className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
          </div>

          {/* Team Grid */}
           <div className="flex flex-col md:flex-row gap-x-10 gap-y-10 justify-center items-center ">
            
            <div className="flex justify-center">
              <ProfileCard 
                name="Hammad Malik"
                title="AI & Backend"
                handle="hammad"
                status="B.Tech 2nd Year"
                avatarUrl={hammad}
                showUserInfo={true}
                enableTilt={true}
                linkedinUrl="https://www.linkedin.com/in/hammad-malik-/"
                githubUrl="https://github.com/hammadmalik17"
              />
            </div>
            
            <div className="flex justify-center">
              <ProfileCard 
                name="K L N Sai Aditya"
                title="Frontend & Design"
                handle="saiaditya10"
                status="B.Tech 2nd Year"
                avatarUrl={aditya}
                showUserInfo={true}
                enableTilt={true}
                linkedinUrl="https://www.linkedin.com/in/sai-aditya-10x/"
                githubUrl="https://github.com/Aditya-0510"
              />
            </div>
            
            <div className="flex justify-center sm:col-span-2 lg:col-span-1">
              <ProfileCard 
                name="Ayushmaan Kumar"
                title="Frontend & Animations"
                handle="ayushmaan"
               status="B.Tech 2nd Year"
                avatarUrl={ayushmaan}
                showUserInfo={true}
                enableTilt={true}
                linkedinUrl="https://www.linkedin.com/in/ayushmaan-kumar/"
                githubUrl="https://github.com/lightyear256"
              />
            </div>
            
          </div>
        </div>

        <style>{`
          @keyframes shine {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          .animate-shine {
            animation: shine 1.5s ease-in-out;
          }
        `}</style>
      </div>
      <Footer />
      <BubbleCursor />
    </>
  );
};