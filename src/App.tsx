import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { VoiceProvider, useVoice } from './context/VoiceContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/layout/Header.js';
import { VoiceSubtitles } from './components/layout/VoiceSubtitles.js';
import { LanguageSelection } from './components/auth/LanguageSelection.js';
import { AuthChoice } from './components/auth/AuthChoice.js';
import { LoginForm } from './components/auth/LoginForm.js';
import { RegisterForm } from './components/auth/RegisterForm.js';
import { FarmerDashboard } from './components/dashboard/FarmerDashboard.js';

type AppView = 'language' | 'choice' | 'login' | 'register' | 'dashboard';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { currentLanguage } = useLanguage();

  // If user selected language previously, start at choice screen, else language picker
  const [view, setView] = useState<AppView>(() => {
    try {
      const savedLang = localStorage.getItem('krishivaani_lang');
      return savedLang ? 'choice' : 'language';
    } catch {
      return 'language';
    }
  });

  // Authentication Route Protection
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setView('dashboard');
      } else if (view === 'dashboard') {
        // Redirect unauthenticated user to login
        setView('login');
      }
    }
  }, [user, isLoading, view]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-emerald-950 dark:text-emerald-400 font-serif text-lg">कृषिवाणी प्रारंभ हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-600 selection:text-white pb-20 transition-colors duration-200">
      {/* Persistent Header with 12-language switcher & profile */}
      <Header onLanguageChangeRequest={() => setView('language')} />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {user ? (
          <FarmerDashboard />
        ) : view === 'language' ? (
          <LanguageSelection onLanguageChosen={() => setView('choice')} />
        ) : view === 'choice' ? (
          <AuthChoice
            onSelectLogin={() => setView('login')}
            onSelectRegister={() => setView('register')}
            onChangeLanguage={() => setView('language')}
          />
        ) : view === 'login' ? (
          <LoginForm
            onSuccess={() => setView('dashboard')}
            onNavigateRegister={() => setView('register')}
            onBack={() => setView('choice')}
          />
        ) : view === 'register' ? (
          <RegisterForm
            onSuccess={() => setView('dashboard')}
            onNavigateLogin={() => setView('login')}
            onBack={() => setView('choice')}
          />
        ) : (
          <LoginForm
            onSuccess={() => setView('dashboard')}
            onNavigateRegister={() => setView('register')}
            onBack={() => setView('choice')}
          />
        )}
      </main>

      {/* Floating Subtitle Toast for Spoken Audio (accessibility 3-sec timer) */}
      <VoiceSubtitles />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <VoiceProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </VoiceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
