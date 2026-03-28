import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChoresScreen from './screens/ChoresScreen';
import RewardsScreen from './screens/RewardsScreen';
import FeedScreen from './screens/FeedScreen';
import FamilyScreen from './screens/FamilyScreen';
import Layout from './components/Layout';
import InstallPrompt from './components/InstallPrompt';

function AppContent() {
  const { isSetup, isLoading, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-6xl">🏠</div>
        <p className="text-white font-semibold text-lg">Loading ChoreFamily…</p>
      </div>
    );
  }

  if (!isSetup) {
    return <OnboardingScreen />;
  }

  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <InstallPrompt />
      </>
    );
  }

  const screens = {
    home:    <HomeScreen setActiveTab={setActiveTab} />,
    chores:  <ChoresScreen />,
    rewards: <RewardsScreen />,
    feed:    <FeedScreen />,
    family:  <FamilyScreen />,
  };

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {screens[activeTab] || screens.home}
      </Layout>
      <InstallPrompt />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
