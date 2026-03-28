import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'chores', label: 'Chores', emoji: '✅' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'feed', label: 'Feed', emoji: '📢' },
];

export default function Layout({ activeTab, setActiveTab, children }) {
  const { currentUser, setCurrentUserId } = useApp();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f7ff' }}>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-gray-800 text-lg">ChoreFamily</span>
        </div>
        <button
          onClick={() => setCurrentUserId(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style={{ backgroundColor: currentUser.bgColor, color: currentUser.color }}
        >
          <span>{currentUser.emoji}</span>
          <span>{currentUser.name}</span>
          {currentUser.role === 'child' && (
            <span className="bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs font-bold">
              {currentUser.points} ✨
            </span>
          )}
          {currentUser.role === 'parent' && (
            <span className="bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs font-bold">
              Parent
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center py-3 px-1 transition-all"
            >
              <span className={`text-xl mb-0.5 transition-transform ${activeTab === item.id ? 'scale-110' : ''}`}>
                {item.emoji}
              </span>
              <span className={`text-xs font-medium transition-colors ${
                activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
