import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    emoji: '🏠' },
  { id: 'chores',  label: 'Chores',  emoji: '✅' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'feed',    label: 'Feed',    emoji: '📢' },
  { id: 'family',  label: 'Family',  emoji: '👨‍👩‍👧' },
];

export default function Layout({ activeTab, setActiveTab, children }) {
  const { currentUser, setCurrentUserId, chores, rewardClaims } = useApp();

  const pendingApprovals = chores.filter(c => c.status === 'completed').length;
  const pendingRewards = rewardClaims.filter(c => c.status === 'pending').length;
  const totalBadge = pendingApprovals + pendingRewards;
  const isParent = currentUser.role === 'parent';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f7ff' }}>
      {/* Top Bar */}
      <header
        className="bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)', paddingBottom: '0.75rem' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-gray-800 text-lg">ChoreFamily</span>
        </div>
        <button
          onClick={() => setCurrentUserId(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: currentUser.bg, color: currentUser.color }}
        >
          <span>{currentUser.emoji}</span>
          <span>{currentUser.name}</span>
          <span className="bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs font-bold">
            {currentUser.role === 'child' ? `${currentUser.points} ✨` : 'Parent'}
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const showBadge = isParent && item.id === 'chores' && totalBadge > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex-1 flex flex-col items-center py-3 px-1 relative"
              >
                <div className="relative">
                  <span className={`text-2xl transition-transform block ${isActive ? 'scale-110' : ''}`}>
                    {item.emoji}
                  </span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {totalBadge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium mt-0.5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
