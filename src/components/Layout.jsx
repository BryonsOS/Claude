import { useState } from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    emoji: '🏠' },
  { id: 'chores',  label: 'Chores',  emoji: '✅' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'feed',    label: 'Feed',    emoji: '📢' },
  { id: 'family',  label: 'Family',  emoji: '👨‍👩‍👧' },
];

export const D = {
  bg:        '#0d1117',
  card:      '#161b22',
  cardHover: '#1c2128',
  border:    'rgba(255,255,255,0.08)',
  textPri:   '#f0f6fc',
  textSec:   '#8b949e',
  accent:    '#6366f1',
};

async function refreshApp() {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } finally {
    window.location.reload(true);
  }
}

export default function Layout({ activeTab, setActiveTab, children }) {
  const { currentUser, setCurrentUserId, chores, rewardClaims, syncError, toast } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const pendingApprovals = chores.filter(c => c.status === 'completed').length;
  const pendingRewards   = rewardClaims.filter(c => c.status === 'pending').length;
  const totalBadge       = pendingApprovals + pendingRewards;
  const isParent         = currentUser.role === 'parent';

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await refreshApp();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: D.bg }}>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleRefresh}
              title="Check for updates"
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${D.border}`,
                cursor: refreshing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                opacity: refreshing ? 0.5 : 1,
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              🔄
            </button>

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
                {isParent ? '👑' : '$' + (currentUser.points / 100).toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {syncError && (
        <div style={{
          background: 'rgba(220,38,38,0.12)',
          borderBottom: '1px solid rgba(220,38,38,0.3)',
          padding: '8px 16px',
          textAlign: 'center',
          color: '#f87171',
          fontSize: 12,
          fontWeight: 700,
        }}>
          ⚠️ {syncError}
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 68px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: toast.type === 'error' ? 'rgba(220,38,38,0.97)' : 'rgba(22,27,34,0.97)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(220,38,38,0.6)' : 'rgba(52,211,153,0.35)'}`,
          borderRadius: 20,
          padding: '10px 20px',
          color: '#f0f6fc',
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
          animation: 'slideDown 0.2s ease',
          pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {children}
      </main>

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
