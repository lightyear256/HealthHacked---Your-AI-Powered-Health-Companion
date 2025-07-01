import React from "react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Mail } from "lucide-react";
import { BubbleCursor } from "@/components/ui/BubbleCursor";


export function Footer(){
  return (
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
  )
}