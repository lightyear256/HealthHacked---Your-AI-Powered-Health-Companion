import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Error() {
    const navigate=useNavigate();
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 to-black items-center text-purple-500 relative overflow-hidden">
      {/* Medical Animation Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {/* Heartbeat Lines */}
          <g className="animate-pulse">
            <path
              d="M50 300 L150 300 L160 280 L170 320 L180 250 L190 350 L200 300 L350 300"
              stroke="#8b5cf6"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M450 200 L550 200 L560 180 L570 220 L580 150 L590 250 L600 200 L750 200"
              stroke="#a855f7"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <path
              d="M50 400 L150 400 L160 380 L170 420 L180 350 L190 450 L200 400 L350 400"
              stroke="#7c3aed"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </g>
          
          {/* Medical Cross Symbols */}
          <g className="animate-spin" style={{ transformOrigin: '150px 150px', animationDuration: '30s' }}>
            <rect x="140" y="120" width="20" height="60" fill="#8b5cf6" opacity="0.6" />
            <rect x="120" y="140" width="60" height="20" fill="#8b5cf6" opacity="0.6" />
          </g>
          
          <g className="animate-spin" style={{ transformOrigin: '650px 450px', animationDuration: '25s', animationDirection: 'reverse' }}>
            <rect x="640" y="420" width="20" height="60" fill="#a855f7" opacity="0.6" />
            <rect x="620" y="440" width="60" height="20" fill="#a855f7" opacity="0.6" />
          </g>
          
          {/* Pill/Capsule Shapes */}
          <g className="animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}>
            <ellipse cx="700" cy="100" rx="30" ry="15" fill="#8b5cf6" opacity="0.4" />
            <ellipse cx="700" cy="100" rx="15" ry="15" fill="#a855f7" opacity="0.6" />
          </g>
          
          <g className="animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <ellipse cx="100" cy="500" rx="25" ry="12" fill="#7c3aed" opacity="0.4" />
            <ellipse cx="100" cy="500" rx="12" ry="12" fill="#8b5cf6" opacity="0.6" />
          </g>
          
          {/* Stethoscope-like Curves */}
          <g className="animate-pulse" style={{ animationDuration: '4s' }}>
            <path
              d="M400 50 Q450 100 500 50 Q550 0 600 50"
              stroke="#8b5cf6"
              strokeWidth="4"
              fill="none"
              opacity="0.5"
            />
            <circle cx="400" cy="50" r="8" fill="#8b5cf6" opacity="0.7" />
            <circle cx="600" cy="50" r="8" fill="#8b5cf6" opacity="0.7" />
          </g>
          
          {/* Pulse Dots */}
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx={100 + i * 80}
              cy={300}
              r="4"
              fill="#7c3aed"
              opacity="0.6"
              className="animate-ping"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          
          {/* Syringe Shape */}
          <g className="animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
            <rect x="650" y="300" width="80" height="8" fill="#8b5cf6" opacity="0.5" rx="4" />
            <rect x="640" y="296" width="15" height="16" fill="#a855f7" opacity="0.6" rx="2" />
            <rect x="735" y="302" width="20" height="4" fill="#7c3aed" opacity="0.7" />
          </g>
        </svg>
      </div>
      
      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse opacity-20"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-4 h-4 bg-purple-500 rounded-full relative">
              <div className="absolute inset-0 w-4 h-1 bg-purple-500 top-1.5"></div>
              <div className="absolute inset-0 w-1 h-4 bg-purple-500 left-1.5"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* 404 Number and Robot Container */}
        <div className="relative flex items-center justify-center">
          {/* 404 Number */}
          <div className="text-[240px] text-white font-medium">
            4<span className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
    0
  </span>4
          </div>
          
          {/* Animated Robot */}
          <div className="absolute -right-32 top-16 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="transform hover:scale-110 transition-transform duration-300 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}>
              <img 
                src="https://framerusercontent.com/images/IgecgZtCrDbm170U2W4lLbyak.png" 
                height={100} 
                width={100}
                alt="Robot"
                className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
              />
            </div>
          </div>
        </div>
        
        {/* Subtitle */}
        <div className="text-4xl">Page not Found</div>
        
        {/* Button */}
        <button className="bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500
 text-white pt-3 pb-3 pl-5 pr-5 mt-10 rounded-md text-xl cursor-pointer font-medium hover:bg-purple-700 transition-colors duration-300" onClick={()=>{navigate("/")}}>
          Return to Home
        </button>
      </div>
    </div>
  );
}