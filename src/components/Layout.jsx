import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    emoji: '🏠' },
  { id: 'chores',  label: 'Chores',  emoji: '✅' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'feed',    label: 'Feed',    emoji: '📢' },
  { id: 'family',  label: 'Family',  emoji: '👨‍👩‍👧' },
];

// Design tokens — all screens import from here via inline styles
export const D = {
  bg:        '#0d1117',
  card:      '#161b22',
  cardHover: '#1c2128',
  border:    'rgba(255,255,255,0.08)',
  textPri:   '#f0f6fc',
  textSec:   '#8b949e',
  accent:    '#6366f1',
};

export default function Layout({ activeTab, setActiveTab, children }) {
  const { currentUser, setCurrentUserId, chores, rewardClaims } = useApp();

  const pendingApprovals = chores.filter(c => c.status === 'completed').length;
  const pendingRewards   = rewardClaims.filter(c => c.status === 'pending').length;
  const totalBadge       = pendingApprovals + pendingRewards;
  const isParent         = currentUser.role === 'parent';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: D.bg }}>

      {/* Compact top bar */}
      <header
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
          paddingBottom: '0.5rem',
          background: D.card,
          borderBottom: `1px solid ${D.border}`,
        }}
      >
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 2px 8px rgba(99,102,241,0.5)',
            }}>🏠</div>
            <span style={{ color: D.textPri, fontWeight: 900, fontSize: 17, letterSpacing: '-0.02em' }}>ChoreFamily</span>
          </div>

          <button
            onClick={() => setCurrentUserId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${D.border}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16 }}>{currentUser.emoji}</span>
            <span style={{ color: D.textPri, fontSize: 13, fontWeight: 700 }}>{currentUser.name}</span>
            <span style={{
              background: currentUser.color,
              color: 'white', fontSize: 11, fontWeight: 900,
              padding: '1px 7px', borderRadius: 10,
            }}>
              {isParent ? '👑' : `${currentUser.points}✨`}
            </span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {children}
      </main>

      {/* Bottom nav — dark glass */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: 'rgba(13,17,23,0.92)',
          borderTop: `1px solid ${D.border}`,
        }}
      >
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', padding: '6px 8px', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive  = activeTab === item.id;
            const showBadge = isParent && item.id === 'chores' && totalBadge > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '8px 4px', borderRadius: 16, cursor: 'pointer', position: 'relative',
                  background: isActive ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
                  boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                  transition: 'all 0.15s',
                  border: 'none',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 22, display: 'block', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s' }}>
                    {item.emoji}
                  </span>
                  {showBadge && (
                    <span style={{
                      position: 'absolute', top: -4, right: -8,
                      background: '#ef4444', color: 'white',
                      fontSize: 10, fontWeight: 900, borderRadius: '50%',
                      width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {totalBadge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: isActive ? 'white' : D.textSec }}>
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
