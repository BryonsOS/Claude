import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChoresScreen from './screens/ChoresScreen';
import RewardsScreen from './screens/RewardsScreen';
import FeedScreen from './screens/FeedScreen';
import Layout from './components/Layout';

function AppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  if (!currentUser) {
    return <LoginScreen />;
  }

  const screens = {
    home: <HomeScreen setActiveTab={setActiveTab} />,
    chores: <ChoresScreen />,
    rewards: <RewardsScreen />,
    feed: <FeedScreen />,
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {screens[activeTab] || screens.home}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
