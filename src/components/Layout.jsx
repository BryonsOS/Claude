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
  const pendingRewards   = rewardClaims.filter(c => c.status === 'pending').length;
  const totalBadge = pendingApprovals + pendingRewards;
  const isParent = currentUser.role === 'parent';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f0ff' }}>

      {/* Top Bar */}
      <header
        className="sticky top-0 z-20"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.625rem)',
          paddingBottom: '0.625rem',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        }}
      >
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-md"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              🏠
            </div>
            <span className="font-black text-white text-lg tracking-tight">ChoreFamily</span>
          </div>

          {/* User pill */}
          <button
            onClick={() => setCurrentUserId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <span className="text-base">{currentUser.emoji}</span>
            <span className="text-white text-sm font-bold">{currentUser.name}</span>
            <span
              className="text-xs font-black rounded-full px-2 py-0.5 ml-0.5"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#4f46e5' }}
            >
              {isParent ? '👑' : `${currentUser.points}✨`}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation — glass morphism pill nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: 'rgba(255,255,255,0.88)',
          borderTop: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 -4px 24px rgba(79,70,229,0.12)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center px-2 py-2 gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const showBadge = isParent && item.id === 'chores' && totalBadge > 0;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex-1 flex flex-col items-center py-2.5 rounded-2xl relative transition-all active:scale-90"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
                      }
                    : {}
                }
              >
                <div className="relative">
                  <span
                    className="text-2xl block transition-transform"
                    style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    {item.emoji}
                  </span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {totalBadge}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-bold mt-0.5"
                  style={{ color: isActive ? 'white' : '#9ca3af' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
