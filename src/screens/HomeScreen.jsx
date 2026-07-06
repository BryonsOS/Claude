import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META, isScheduledToday } from '../data/initialData';
import { ProofSheet } from '../components/ProofSheet';

const D = {
  bg:      '#0f0a23',
  card:    '#1a1430',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#9e98bd',
};

const fmt = c => '$' + (c / 100).toFixed(2);
const today = () => new Date().toISOString().split('T')[0];

export default function HomeScreen({ setActiveTab }) {
  const { currentUser } = useApp();
  return currentUser.role === 'parent'
    ? <ParentHome setActiveTab={setActiveTab} />
    : <KidHome setActiveTab={setActiveTab} />;
}

function ParentHome({ setActiveTab }) {
  const { members, chores, rewardClaims, currentUser } = useApp();
  const kids           = members.filter(m => m.role === 'child');
  const pendingApprove = chores.filter(c => c.status === 'completed');
  const pendingRewards = rewardClaims.filter(c => c.status === 'pending');
  const todayChores    = chores.filter(c => c.dueDate === today());
  const doneToday      = kids.flatMap(k => k.history || []).filter(h => h.ts && h.ts.startsWith(today())).length;
  const needsAction    = pendingApprove.length + pendingRewards.length;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 8px' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>FAMILY HUB</p>
        <h1 style={{ color: D.textPri, fontSize: 28, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>Hey, {currentUser.name} 👋</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <StatTile value={todayChores.length} label="TODAY"  color="#6366f1" />
        <StatTile value={doneToday}          label="DONE"   color="#10b981" />
        <StatTile value={needsAction}        label="ACTION" color={needsAction > 0 ? '#f59e0b' : D.textSec} pulse={needsAction > 0} />
      </div>

      {needsAction > 0 && (
        <section style={{ marginBottom: 20 }}>
          <SectionLabel emoji="⚡" text="NEEDS YOUR APPROVAL" color="#f59e0b" />
          <div style={{ background: D.card, borderRadius: 20, border: '1px solid rgba(245,158,11,0.3)', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 4px 20px rgba(245,158,11,0.1)' }}>
            {pendingApprove.map((c, i) => (
              <ApprovalRow key={c.id} chore={c} onTap={() => setActiveTab('chores')} last={i === pendingApprove.length - 1 && pendingRewards.length === 0} />
            ))}
            {pendingRewards.map((cl, i) => (
              <RewardRow key={cl.id} claim={cl} onTap={() => setActiveTab('rewards')} last={i === pendingRewards.length - 1} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 20 }}>
        <SectionLabel emoji="👦" text="YOUR KIDS" color="#6366f1" />
        {kids.length === 0 ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
            <p style={{ color: D.textSec, fontSize: 14 }}>No kids yet — add them in the Family tab.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {kids.map(kid => <KidTile key={kid.id} kid={kid} chores={chores} onTap={() => setActiveTab('chores')} />)}
          </div>
        )}
      </section>

      {kids.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <SectionLabel emoji="📊" text="THIS WEEK" color="#34d399" />
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden' }}>
            {kids.map((kid, i) => {
              const weekAgo = Date.now() - 7 * 86400000;
              const wk      = (kid.history || []).filter(h => h.ts && new Date(h.ts).getTime() >= weekAgo);
              const earned  = wk.reduce((s, h) => s + (h.points || 0), 0);
              return (
                <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < kids.length - 1 ? `1px solid ${D.border}` : 'none' }}>
                  <span style={{ fontSize: 24 }}>{kid.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, margin: '0 0 1px' }}>{kid.name}</p>
                    <p style={{ color: D.textSec, fontSize: 11, margin: 0 }}>{wk.length} chore{wk.length === 1 ? '' : 's'} this week</p>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: 900, fontSize: 16 }}>{fmt(earned)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {todayChores.length > 0 && (
        <section>
          <SectionLabel emoji="📋" text="TODAY'S CHORES" color="#6366f1" />
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden' }}>
            {todayChores.slice(0, 6).map((c, i) => (
              <ChoreRow key={c.id} chore={c} last={i === Math.min(todayChores.length, 6) - 1} />
            ))}
            {todayChores.length > 6 && (
              <button onClick={() => setActiveTab('chores')} style={{ width: '100%', padding: '12px', textAlign: 'center', color: '#6366f1', fontWeight: 700, fontSize: 13, background: 'transparent', border: 'none', borderTop: `1px solid ${D.border}`, cursor: 'pointer' }}>
                See all {todayChores.length} chores →
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ value, label, color, pulse }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: pulse ? `0 0 0 1px ${color}40, 0 4px 16px ${color}20` : 'none' }}>
      <p style={{ color, fontSize: 28, fontWeight: 900, lineHeight: 1, margin: '0 0 4px' }}>{value}</p>
      <p style={{ color: D.textSec, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
    </div>
  );
}

function SectionLabel({ emoji, text, color }) {
  return (
    <p style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, marginTop: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
      {emoji} {text}
    </p>
  );
}

function KidTile({ kid, chores, onTap }) {
  const myChores = chores.filter(c => c.assignedTo === kid.id);
  const done     = (kid.history || []).filter(h => h.ts && h.ts.startsWith(today())).length;
  const review   = myChores.filter(c => c.status === 'completed').length;
  const active   = myChores.filter(c => c.status === 'pending' || c.status === 'completed').length;
  const pct      = (done + active) ? Math.round((done / (done + active)) * 100) : 0;

  return (
    <button onClick={onTap} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: 16, textAlign: 'left', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)', display: 'block', width: '100%' }}>
      <div style={{ fontSize: 36, marginBottom: 8, display: 'block' }}>{kid.emoji}</div>
      <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 2px' }}>{kid.name}</p>
      <p style={{ color: kid.color, fontWeight: 900, fontSize: 13, margin: '0 0 10px' }}>💰 {fmt(kid.points)}</p>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 6, marginBottom: 4 }}>
        <div style={{ background: kid.color, height: 6, borderRadius: 99, width: `${Math.max(pct, 0)}%`, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: D.textSec, fontSize: 11 }}>{done} done today</span>
        {review > 0 && <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>⚡ {review} to review</span>}
      </div>
    </button>
  );
}

function ApprovalRow({ chore, onTap, last }) {
  const { members } = useApp();
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const kid = members.find(m => m.id === chore.assignedTo);
  return (
    <button onClick={onTap} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: last ? 'none' : `1px solid ${D.border}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, margin: '0 0 1px' }}>{chore.title}{chore.proofPhoto ? ' 📸' : ''}</p>
        <p style={{ color: D.textSec, fontSize: 12, margin: 0 }}>{kid?.name} · +{fmt(chore.points)}</p>
      </div>
      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>Review</span>
    </button>
  );
}

function RewardRow({ claim, onTap, last }) {
  const { members, rewards } = useApp();
  const kid    = members.find(m => m.id === claim.claimedBy);
  const reward = rewards.find(r => r.id === claim.rewardId);
  if (!reward) return null;
  return (
    <button onClick={onTap} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: last ? 'none' : `1px solid ${D.border}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: '#2d1b69', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{reward.emoji}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, margin: '0 0 1px' }}>{reward.title}</p>
        <p style={{ color: D.textSec, fontSize: 12, margin: 0 }}>{kid?.name} · {fmt(reward.pointCost)}{reward.bonus > 0 ? ` +${fmt(reward.bonus)} bonus` : ''}</p>
      </div>
      <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>Pay Out</span>
    </button>
  );
}

function ChoreRow({ chore, last }) {
  const { members } = useApp();
  const cat      = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const assignee = members.find(m => m.id === chore.assignedTo);
  const statusMap = {
    pending:   { label: 'To Do',  color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    completed: { label: 'Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    approved:  { label: 'Done ✓', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    rejected:  { label: 'Redo',   color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  };
  const st = statusMap[chore.status] || statusMap.pending;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${D.border}` }}>
      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 13, margin: '0 0 1px' }}>{chore.title}</p>
        <p style={{ color: D.textSec, fontSize: 11, margin: 0 }}>{assignee?.name}</p>
      </div>
      <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>{st.label}</span>
    </div>
  );
}

function KidHome({ setActiveTab }) {
  const { currentUser, chores, rewards, completeChore, claimOpenChore } = useApp();
  const myChores    = chores.filter(c => c.assignedTo === currentUser.id);
  const todayChores = myChores.filter(c => c.dueDate === today());
  const pending     = todayChores.filter(c => c.status === 'pending' && isScheduledToday(c));
  const done        = (currentUser.history || []).filter(h => h.ts && h.ts.startsWith(today())).length;
  const waiting     = myChores.filter(c => c.status === 'completed').length;
  const openChores  = chores.filter(c => !c.assignedTo && c.status === 'pending' && isScheduledToday(c));
  const canAfford   = rewards.filter(r => r.pointCost <= currentUser.points);
  const streak      = calcStreak(currentUser.history || []);
  const color       = currentUser.color;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 8px' }}>
      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 24, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden', boxShadow: `0 0 0 1px ${color}30, 0 8px 32px ${color}18` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{currentUser.emoji}</div>
          <div>
            <p style={{ color: D.textSec, fontSize: 12, fontWeight: 600, margin: '0 0 2px' }}>Let's go,</p>
            <p style={{ color: D.textPri, fontSize: 28, fontWeight: 900, lineHeight: 1, margin: '0 0 4px' }}>{currentUser.name}!</p>
            {streak > 0 && <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, margin: 0 }}>🔥 {streak} day streak</p>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MiniStat label="EARNED"  value={fmt(currentUser.points)} color={color} />
          <MiniStat label="DONE"    value={done} color="#10b981" />
          <MiniStat label="WAITING" value={waiting} color={waiting > 0 ? '#f59e0b' : D.textSec} />
        </div>
      </div>

      {pending.length === 0 && openChores.length === 0 && (done > 0 || waiting > 0) && (
        <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '20px 16px', textAlign: 'center', marginBottom: 16, boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}>
          <p style={{ fontSize: 36, margin: '0 0 6px' }}>🎉</p>
          <p style={{ color: '#6ee7b7', fontWeight: 900, fontSize: 20, margin: '0 0 4px' }}>You crushed it today!</p>
          {waiting > 0 && <p style={{ color: '#a7f3d0', fontSize: 13, margin: 0 }}>{waiting} chore{waiting > 1 ? 's' : ''} waiting for approval</p>}
        </div>
      )}

      {pending.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>TO DO TODAY · {pending.length} left</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(chore => (
              <BigChoreCard key={chore.id} chore={chore} onComplete={(photo) => completeChore(chore.id, photo)} color={color} />
            ))}
          </div>
        </section>
      )}

      {openChores.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <p style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>🌟 UP FOR GRABS · FIRST COME, FIRST SERVE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {openChores.map(chore => (
              <OpenChoreCard key={chore.id} chore={chore} onClaim={(photo) => claimOpenChore(chore.id, photo)} />
            ))}
          </div>
        </section>
      )}

      {waiting > 0 && (
        <section style={{ marginBottom: 16 }}>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>WAITING FOR APPROVAL</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myChores.filter(c => c.status === 'completed').map(chore => {
              const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
              return (
                <div key={chore.id} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <p style={{ flex: 1, color: '#fcd34d', fontWeight: 700, fontSize: 14, margin: 0 }}>{chore.title}</p>
                  <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>⏳ Pending</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {canAfford.length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>💵 READY TO CASH OUT</p>
            <button onClick={() => setActiveTab('rewards')} style={{ color, fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {canAfford.slice(0, 5).map(r => (
              <div key={r.id} style={{ flexShrink: 0, width: 120, background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{r.emoji}</span>
                <p style={{ color: D.textPri, fontWeight: 700, fontSize: 12, margin: '0 0 4px', lineHeight: 1.2 }}>{r.title}</p>
                <p style={{ color, fontWeight: 900, fontSize: 12, margin: 0 }}>{fmt(r.pointCost)}{r.bonus > 0 ? ` +${fmt(r.bonus)}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  const isLong = value && value.toString().length > 5;
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
      <p style={{ color: D.textSec, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px' }}>{label}</p>
      <p style={{ color, fontSize: isLong ? 16 : 22, fontWeight: 900, lineHeight: 1, margin: 0 }}>{value}</p>
    </div>
  );
}

function BigChoreCard({ chore, onComplete, color }) {
  const [showProof, setShowProof] = useState(false);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden', display: 'flex', boxShadow: `0 2px 12px ${color}15` }}>
      <div style={{ width: 5, background: `linear-gradient(180deg, ${color}, ${color}66)`, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 14px 12px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 3px', lineHeight: 1.2 }}>{chore.title}</p>
          <span style={{ background: `${color}20`, color, fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>+{fmt(chore.points)}</span>
        </div>
        <button onClick={() => setShowProof(true)} style={{ padding: '12px 18px', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 14, background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 16px ${color}55`, border: 'none', cursor: 'pointer', flexShrink: 0 }}>✓ Done</button>
      </div>
      {showProof && (
        <ProofSheet chore={chore} color={color} onSubmit={(photo) => { onComplete(photo); setShowProof(false); }} onClose={() => setShowProof(false)} />
      )}
    </div>
  );
}

function OpenChoreCard({ chore, onClaim }) {
  const [showProof, setShowProof] = useState(false);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  return (
    <div style={{ background: D.card, border: '1px solid rgba(251,191,36,0.25)', borderRadius: 20, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 12px rgba(251,191,36,0.08)' }}>
      <div style={{ width: 5, background: 'linear-gradient(180deg, #f59e0b, #fbbf24)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 14px 12px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 3px', lineHeight: 1.2 }}>{chore.title}</p>
          <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>+{fmt(chore.points)}</span>
        </div>
        <button onClick={() => setShowProof(true)} style={{ padding: '12px 16px', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 13, background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 16px rgba(245,158,11,0.45)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>🙋 I Did It!</button>
      </div>
      {showProof && (
        <ProofSheet chore={chore} color="#f59e0b" onSubmit={(photo) => { onClaim(photo); setShowProof(false); }} onClose={() => setShowProof(false)} />
      )}
    </div>
  );
}

function calcStreak(history) {
  if (!history.length) return 0;
  const dates = new Set(history.map(h => h.ts && h.ts.split('T')[0]).filter(Boolean));
  let s = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().split('T')[0])) s++;
    else if (i > 0) break;
  }
  return s;
}
