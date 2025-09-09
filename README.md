# 🎬 CinemaAI - Intelligent Movie Recommendation System

[![Build Status](https://github.com/gradan-hash/Movie-Recommendation-System/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/gradan-hash/Movie-Recommendation-System/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-66.85%25-green.svg)](https://github.com/gradan-hash/Movie-Recommendation-System)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

> **Movie recommendation platform powered by AI, built with Vue 3, TypeScript, and modern web technologies.**

🚀 **[Live Demo](https://gradan-hash.github.io/Movie-Recommendation-System/)** | 📖 **[API Documentation](#api-integration)**

## ✨ Key Features

### 🤖 AI-Powered Intelligence

- **Smart Recommendations**: Google Gemini AI analyzes your preferences for personalized suggestions
- **Confidence Scoring**: AI-generated confidence ratings for each recommendation
- **Learning System**: Improves recommendations based on your viewing history and likes

### 🎯 Core Functionality

- **Comprehensive Movie Database**: 500,000+ movies and TV shows via TMDB API
- **Advanced Search**: Multi-parameter search with real-time suggestions
- **Detailed Information**: Cast, crew, ratings, reviews, trailers, and similar titles
- **User Profiles**: Personal watchlists, favorites, and viewing history

### 🔐 Authentication & Personalization

- **Firebase Authentication**: Secure email/password authentication
- **Protected Routes**: Role-based access control
- **Persistent Sessions**: Seamless experience across devices
- **Profile Management**: Customizable user profiles and preferences

## 🏗️ Technical Architecture

### Frontend Stack

- **Vue 3** - Modern composition API with `<script setup>`
- **TypeScript** - Full type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom design system
- **Pinia** - Intuitive state management
- **Vue Router** - SPA routing with guards and lazy loading

### Backend Integration

- **TMDB API** - Comprehensive movie database
- **Firebase** - Authentication and real-time features
- **Google Gemini AI** - Advanced recommendation engine
- **RESTful Services** - Clean API abstraction layer

### Development & DevOps

- **Vite** - Lightning-fast build tool with HMR
- **Vitest** - Modern testing framework (90 tests, 100% pass rate)
- **GitHub Actions** - Automated CI/CD pipeline
- **ESLint + Oxlint** - Comprehensive code quality enforcement
- **GitHub Pages** - Automated deployment

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/gradan-hash/Movie-Recommendation-System.git
cd Movie-Recommendation-System

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Add your API keys to .env file

# Start development server
npm run dev
```

### Environment Variables

```env
# TMDB API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_API_Read_Access_Token=your_tmdb_access_token

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Recommendations
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_APP_TITLE=CinemaAI - Movie Recommendation System
```

## 🧪 Testing & Quality

### Running Tests

```bash
# Unit tests
npm run test:unit

# Test with coverage
npm run test:unit:coverage

# Linting
npm run lint

# Type checking
npm run type-check
```

### Quality Metrics

- **Test Coverage**: 66.85%
- **Test Suite**: 90 tests across components, services, and composables
- **TypeScript**: Strict mode with comprehensive type definitions
- **Code Quality**: ESLint + Oxlint with zero violations

## 🏗️ Build & Deployment

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Build with type checking
npm run build-only
```

### CI/CD Pipeline

- **Quality Gates**: Automated linting, testing, and build verification
- **Coverage Thresholds**: Enforced minimum coverage requirements
- **Automated Deployment**: GitHub Pages deployment on main branch
- **Environment Management**: Secure secret management via GitHub Secrets

## 🎯 Advanced Features

### Performance Optimizations

- **Custom Performance Monitoring**: Real-time FPS and memory tracking
- **Image Lazy Loading**: Intersection Observer API implementation
- **Virtual Scrolling**: Optimized rendering for large datasets
- **Caching Strategies**: Multi-level caching (API, AI responses, images)
- **Code Splitting**: Dynamic imports for optimal bundle size

### AI Recommendation Engine

- **Machine Learning**: Gemini AI analyzes viewing patterns and preferences
- **Contextual Understanding**: Considers genre preferences, ratings, and viewing history
- **Fallback System**: TMDB-based recommendations when AI service unavailable
- **Performance Optimized**: 30-minute caching to balance freshness and efficiency

### User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Web App**: PWA-ready with offline capabilities
- **Accessibility**: WCAG 2.1 compliance with ARIA labels and keyboard navigation
- **Animation System**: GPU-accelerated transitions and micro-interactions

## 📂 Project Structure

```
src/
├── api/               # API integration layer
│   ├── auth.ts       # Firebase authentication
│   └── tmdb.ts       # TMDB API client
├── components/        # Reusable UI components
├── composables/       # Business logic composition functions
├── router/           # Vue Router configuration
├── services/         # Business logic services
│   ├── ai-recommendations.ts  # Gemini AI integration
│   ├── loader.ts     # Global loading management
│   └── tmdb.ts       # Movie service abstraction
├── stores/           # Pinia state management
├── types/            # TypeScript definitions
└── views/            # Page components
```

## 🔗 API Integration

### TMDB API

- **Movies & TV Shows**: Comprehensive content database
- **Search**: Multi-parameter search with autocomplete
- **Details**: Cast, crew, reviews, trailers, similar content
- **Trending**: Real-time trending content

### Firebase Services

- **Authentication**: Email/password with profile management
- **Real-time Database**: User preferences and watchlists
- **Security**: Proper security rules and validation

### AI Integration

- **Google Gemini**: Advanced natural language processing
- **Personalization**: Context-aware recommendations
- **Performance**: Optimized API usage with intelligent caching

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **[TMDB](https://www.themoviedb.org/)** - Movie database and API
- **[Firebase](https://firebase.google.com/)** - Authentication and backend services
- **[Google AI](https://ai.google.dev/)** - Gemini AI for intelligent recommendations
- **[Vue.js Community](https://vuejs.org/)** - Amazing framework and ecosystem

---

**Built with ❤️ for movie enthusiasts worldwide** | **© 2025 CinemaAI**
