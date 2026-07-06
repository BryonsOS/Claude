import { useApp } from '../context/AppContext';
import { MemberAvatar } from '../components/MemberAvatar';
import { CATEGORY_META } from '../data/initialData';

const D = {
  card:    '#1a1430',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#9e98bd',
};

const EVENT_STYLE = {
  chore_completed:    { emoji: '✅', color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  chore_approved:     { emoji: '🌟', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)'  },
  chore_rejected:     { emoji: '↩️', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  chore_created:      { emoji: '📋', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
  reward_claimed:     { emoji: '🎁', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  reward_approved:    { emoji: '🎉', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  balance_adjustment: { emoji: '💸', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  chore_requested:    { emoji: '📝', color: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
};

export default function FeedScreen() {
  const { activityFeed, members } = useApp();
  const weekAgo = Date.now() - 7 * 86400000;
  const kids    = members.filter(m => m.role === 'child')
    .map(k => {
      const wk = (k.history || []).filter(h => h.ts && new Date(h.ts).getTime() >= weekAgo);
      return { ...k, weekEarned: wk.reduce((s, h) => s + (h.points || 0), 0), weekCount: wk.length };
    })
    .sort((a, b) => b.weekEarned - a.weekEarned);
  const topPts  = kids[0]?.weekEarned || 1;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 8px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 2px' }}>ACTIVITY</p>
          <h1 style={{ color: D.textPri, fontSize: 26, fontWeight: 900, margin: 0 }}>Family Feed</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '6px 12px', borderRadius: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px #34d399' }} />
          <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700 }}>Live</span>
        </div>
      </div>

      {/* Leaderboard */}
      {kids.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))', borderBottom: `1px solid rgba(251,191,36,0.2)`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top Earners This Week</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {kids.map((kid, i) => (
                <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, width: 24, flexShrink: 0 }}>{['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: kid.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{kid.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>{kid.name} <span style={{ color: D.textSec, fontWeight: 400, fontSize: 11 }}>· {kid.weekCount} chore{kid.weekCount === 1 ? '' : 's'}</span></span>
                      <span style={{ color: kid.color, fontWeight: 900, fontSize: 13 }}>💰 {'$' + (kid.weekEarned / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 6 }}>
                      <div style={{ background: kid.color, height: 6, borderRadius: 99, width: `${Math.max((kid.weekEarned / Math.max(topPts,1)) * 100, 3)}%`, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activity */}
      <section>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>RECENT ACTIVITY</p>
        {activityFeed.length === 0 ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 44, marginBottom: 10 }}>📢</p>
            <p style={{ color: D.textPri, fontWeight: 700, fontSize: 16 }}>No activity yet.</p>
            <p style={{ color: D.textSec, fontSize: 13 }}>Assign some chores to get the feed going!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activityFeed.map(entry => <ActivityEntry key={entry.id} entry={entry} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ActivityEntry({ entry }) {
  const { members, chores, rewards } = useApp();
  const actor  = members.find(m => m.id === entry.memberId);
  const target = members.find(m => m.id === entry.targetId);
  const chore  = chores.find(c => c.id === entry.choreId);
  const reward = rewards.find(r => r.id === entry.rewardId);
  const cat    = chore ? (CATEGORY_META[chore.category] || CATEGORY_META.cleaning) : null;
  if (!actor) return null;

  const style  = EVENT_STYLE[entry.type];
  if (!style) return null;

  const usd = c => '$' + (Math.abs(c) / 100).toFixed(2);

  const messages = {
    chore_completed:    <>{N(actor)} marked <Q>{chore?.title}</Q> as complete {cat?.emoji}</>,
    chore_approved:     <>{N(actor)} approved {N(target)}'s <Q>{chore?.title || entry.choreTitle}</Q> <span style={{ color: '#34d399', fontWeight: 900 }}>+{usd(entry.amount ?? chore?.points ?? 0)}</span></>,
    chore_rejected:     <>{N(actor)} sent back <Q>{chore?.title}</Q> for a redo</>,
    chore_created:      <>{N(actor)} assigned <Q>{chore?.title}</Q> to {N(target)}</>,
    reward_claimed:     <>{N(actor)} claimed <Q>{reward?.title}</Q> {reward?.emoji}</>,
    reward_approved:    <>{N(actor)} approved {N(target)}'s <Q>{reward?.title}</Q> reward {reward?.emoji}</>,
    chore_requested:    <>{N(actor)} requested credit for <Q>{chore?.title}</Q> — waiting for review 📝</>,
    balance_adjustment: (
      <>
        {N(actor)} {entry.amount < 0 ? 'deducted' : 'added'}{' '}
        <span style={{ color: entry.amount < 0 ? '#f87171' : '#34d399', fontWeight: 900 }}>
          {entry.amount < 0 ? '−' : '+'}{usd(entry.amount)}
        </span>
        {' '}{entry.amount < 0 ? 'from' : 'to'} {N(target)}'s balance
        {entry.note ? <> — <em style={{ fontStyle: 'italic', color: D.textSec }}>"{entry.note}"</em></> : null}
      </>
    ),
  };

  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <MemberAvatar memberId={entry.memberId} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: D.textPri, fontSize: 14, fontWeight: 500, lineHeight: 1.4, margin: '0 0 4px' }}>{messages[entry.type]}</p>
        <p style={{ color: D.textSec, fontSize: 11, margin: 0 }}>{timeAgo(entry.ts)}</p>
      </div>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{style.emoji}</span>
    </div>
  );
}

function N(member) {
  if (!member) return null;
  return <strong style={{ color: member.color }}>{member.name}</strong>;
}

function Q({ children }) {
  return <em style={{ fontStyle: 'normal', fontWeight: 700, color: '#f0f6fc' }}>"{children}"</em>;
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
