import React from 'react';
import aditya from '../assets/aditya.jpg'
import ayushmaan from '../assets/ayushmaan.jpg'
import hammad from '../assets/hammad.jpg'
import { Footer } from '@/components/Footer';
import { BubbleCursor } from '@/components/ui/BubbleCursor';
import ProfileCard from '@/components/ui/ProfileCard';

export const Creators: React.FC = () => {

  return (
    <>
      <div className="relative overflow-hidden py-20 sm:py-20 absolute top-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
            background: 'linear-gradient(4deg,rgba(15, 23, 42, 1) 0%, rgba(49, 46, 129, 1) 73%, rgba(107, 33, 168, 1) 100%)',
            minHeight: '100vh'
          }}  >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Meet Our Highly Talented
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                World-Class Team
              </span>
            </h1>
          </div>

          {/* Team Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-48 max-w-7xl mx-auto">
            
            <ProfileCard 
              name="Hammad Malik"
              title="AI & Backend"
              handle="hammad"
              status="Online"
              avatarUrl={hammad}
              showUserInfo={true}
              enableTilt={true}
              linkedinUrl="https://www.linkedin.com/in/hammad-malik-/"
              githubUrl="https://github.com/hammadmalik17"
            />
            
            <ProfileCard 
              name="K L N Sai Aditya"
              title="Frontend Developer"
              handle="saiaditya10"
              status="Online"
              avatarUrl={aditya}
              showUserInfo={true}
              enableTilt={true}
              linkedinUrl="https://www.linkedin.com/in/sai-aditya-10x/"
              githubUrl="https://github.com/Aditya-0510"
            />
            
            <ProfileCard 
              name="Ayushmaan Kumar"
              title="Frontend & Animations"
              handle="ayushmaan"
              status="Online"
              avatarUrl={ayushmaan}
              showUserInfo={true}
              enableTilt={true}
              linkedinUrl="https://www.linkedin.com/in/ayushmaan-kumar/"
              githubUrl="https://github.com/lightyear256"
            />
            
          </div>
        </div>

        <style jsx>{`
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