# 🏥 HealthHacked - Your AI-Powered Health Companion

<div align="center">

![HealthHacked Logo](https://img.shields.io/badge/HealthHacked-AI%20Powered-green?style=for-the-badge&logo=heart&logoColor=white)

**Revolutionizing Healthcare with Intelligent AI Assistance**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=flat&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

## 🌟 Overview

HealthHacked is a cutting-edge, AI-powered health assistance platform that provides personalized medical guidance, symptom analysis, and continuous care management. Built with modern technologies and powered by Google's Gemini AI, it offers 24/7 intelligent health support to help users make informed decisions about their wellbeing.

## ✨ Current Features

### 🧠 AI-Powered Core Capabilities
- **Intelligent Symptom Analysis**: Advanced AI evaluation of user-described symptoms with potential causes and recommended actions
- **24/7 Health Chat**: Real-time conversational AI that learns from your health journey and provides contextual guidance
- **Smart Health Context Tracking**: Automatic creation and management of health contexts for ongoing monitoring
- **Emergency Detection**: Intelligent identification of potential emergency situations with immediate guidance

### 📊 Personalized Care Management
- **Automated Care Plan Generation**: AI-generated personalized care plans based on your health conversations
- **Progress Monitoring**: Track your health journey with intelligent insights and trend analysis
- **Follow-up Reminders**: Timely check-ins and reminders to stay on top of your health goals
- **Continuous Health Monitoring**: Real-time tracking of symptoms and health progress

### 👤 User Experience & Security
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Personal Health Dashboard**: Comprehensive overview of your health status and active care plans
- **Real-time Chat History**: Persistent conversation tracking with context awareness
- **Responsive Design**: Beautiful, mobile-first interface built with Tailwind CSS

### 🔧 Technical Excellence
- **RESTful API Architecture**: Clean, scalable backend with Express.js
- **Advanced Error Handling**: Comprehensive error management and logging
- **Database Optimization**: Efficient MongoDB schemas with Mongoose ODM
- **Rate Limiting & Security**: Helmet.js, CORS, and express-rate-limit protection
- **Professional Logging**: Winston-powered logging system for monitoring and debugging

## 🚀 Upcoming Features

### 💊 Pill Profile System
**Advanced Pharmaceutical Intelligence**
- Verified information database for a wide range of medicines
- Detailed composition, usage, and dosage guidelines
- Comprehensive side effects and precautions database
- Drug interaction warnings and alerts
- Reliable reference for making informed medication decisions

### 🏥 NearbyCare Location Services
**Real-time Healthcare Facility Locator**
- GPS-powered location of nearby hospitals and medical facilities
- Pharmacy finder with real-time availability
- Medical professional directory with specialties
- Emergency-ready healthcare facility access
- Enhanced convenience and emergency preparedness

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive, utility-first styling
- **React Router** for seamless navigation
- **Zustand** for efficient state management
- **React Hot Toast** for user notifications
- **Lucide React** for beautiful icons

### Backend
- **Node.js & Express.js** for robust server architecture
- **MongoDB & Mongoose** for flexible data modeling
- **Google Gemini AI** for advanced natural language processing
- **JWT Authentication** with bcryptjs for security
- **Winston Logging** for comprehensive monitoring
- **Redis** for caching and session management (optional)

### DevOps & Security
- **Helmet.js** for security headers
- **CORS** for cross-origin resource sharing
- **Compression** middleware for performance
- **Rate Limiting** for API protection
- **Environment Configuration** with dotenv

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User authentication
GET  /api/auth/me          # Get current user profile
```

### Health Management
```
GET  /api/health/dashboard     # Personal health dashboard
GET  /api/health/contexts      # Health contexts management
GET  /api/health/care-plans    # Active care plans
PUT  /api/health/contexts/:id/status  # Update context status
```

### AI Chat
```
POST /api/chat             # Send message to AI assistant
```

## 🏗️ Project Structure

```
healthhacked/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & AI services
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Utility functions
│   ├── logs/               # Application logs
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   └── utils/         # Helper utilities
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (≥18.0.0)
- MongoDB database
- Google Gemini API key
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hammadmalik17/healthhacked.git
   cd healthhacked
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Configuration**
   ```env
   # Backend .env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

## 🎯 How It Works

### 1. **Symptom Description**
Users describe their health concerns in natural language through the intuitive chat interface.

### 2. **AI Analysis**
Our Gemini-powered AI analyzes symptoms, considers medical knowledge, and provides intelligent insights.

### 3. **Personalized Care Plans**
The system automatically generates tailored care plans with actionable recommendations and follow-up steps.

### 4. **Continuous Monitoring**
Track progress, receive reminders, and get ongoing support throughout your health journey.

## 🌍 Use Cases

- **Primary Care Consultation**: Get initial guidance for common health concerns
- **Symptom Tracking**: Monitor ongoing health conditions with AI insights
- **Medication Management**: Understand your prescriptions and track adherence
- **Preventive Care**: Receive personalized health recommendations
- **Emergency Guidance**: Get immediate direction for urgent health situations
- **Health Education**: Learn about conditions, treatments, and wellness practices

## 🛡️ Privacy & Security

- **HIPAA-Compliant Architecture**: Designed with healthcare privacy standards in mind
- **Encrypted Data Storage**: All sensitive health information is encrypted at rest
- **Secure Authentication**: Industry-standard JWT tokens with bcrypt hashing
- **API Rate Limiting**: Protection against abuse and unauthorized access
- **Audit Logging**: Comprehensive logging for security monitoring and compliance

## 🤝 Contributing

We welcome contributions to HealthHacked! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, feature requests, or bug reports:
- Create an issue on GitHub
- Email: drhammadmalik2020@gmail.com

## 🙏 Acknowledgments

- **Google Gemini AI** for powering our intelligent health conversations
- **MongoDB** for flexible and scalable data storage
- **React Community** for the amazing frontend ecosystem
- **Healthcare Professionals** who provided medical guidance for our AI training

---
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/hammadmalik17/2--AIs-Integrated-HealthHacked/pulls)
[![GitHub stars](https://img.shields.io/github/stars/hammadmalik17/2--AIs-Integrated-HealthHacked?style=social)](https://github.com/hammadmalik17/2--AIs-Integrated-HealthHacked/stargazers)


<div align="center">
  <strong>Built with ❤️ for better healthcare accessibility</strong>
</div>

