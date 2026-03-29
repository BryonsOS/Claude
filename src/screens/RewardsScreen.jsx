import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MemberAvatar, MemberName } from '../components/MemberAvatar';

const D = {
  card:    '#161b22',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#8b949e',
};

export default function RewardsScreen() {
  const { currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 2px' }}>REWARDS</p>
          <h1 style={{ color: D.textPri, fontSize: 26, fontWeight: 900, margin: 0 }}>
            {currentUser.role === 'parent' ? 'Manage Rewards' : 'Reward Shop'}
          </h1>
        </div>
        {currentUser.role === 'parent' && (
          <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 18px', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #db2777)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>+ Add</button>
        )}
      </div>

      {currentUser.role === 'parent' ? <ParentRewards /> : <KidRewards />}
      {showAddModal && <AddRewardModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function ParentRewards() {
  const { rewards, rewardClaims, approveRewardClaim, rejectRewardClaim, members } = useApp();
  const pending = rewardClaims.filter(c => c.status === 'pending');
  const history = rewardClaims.filter(c => c.status !== 'pending');

  return (
    <div style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {pending.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 900, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
            <p style={{ color: D.textPri, fontWeight: 900, fontSize: 16, margin: 0 }}>Awaiting Approval</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(claim => {
              const reward  = rewards.find(r => r.id === claim.rewardId);
              const claimer = members.find(m => m.id === claim.claimedBy);
              if (!reward || !claimer) return null;
              return (
                <div key={claim.id} style={{ background: D.card, border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 4px 16px rgba(245,158,11,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 10px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{reward.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 3px' }}>{reward.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MemberAvatar memberId={claim.claimedBy} size="sm" />
                        <MemberName memberId={claim.claimedBy} style={{ color: D.textSec, fontSize: 12 }} />
                        <span style={{ color: D.textSec, fontSize: 12 }}>· {timeAgo(claim.claimedAt)}</span>
                      </div>
                    </div>
                    <span style={{ color: '#a78bfa', fontWeight: 900, fontSize: 14 }}>✨ {reward.pointCost}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, padding: '0 14px 14px' }}>
                    <button onClick={() => approveRewardClaim(claim.id)} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>Approve 🎉</button>
                    <button onClick={() => rejectRewardClaim(claim.id)} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: '#f87171', fontSize: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <p style={{ color: D.textPri, fontWeight: 900, fontSize: 16, margin: '0 0 12px' }}>Available Rewards</p>
        {rewards.length === 0 ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: '36px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>🎁</p>
            <p style={{ color: D.textPri, fontWeight: 700 }}>No rewards yet.</p>
            <p style={{ color: D.textSec, fontSize: 13 }}>Tap + Add to create rewards kids can earn.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {rewards.map(r => (
              <div key={r.id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 18, padding: 16 }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{r.emoji}</span>
                <p style={{ color: D.textPri, fontWeight: 900, fontSize: 14, margin: '0 0 4px', lineHeight: 1.2 }}>{r.title}</p>
                <p style={{ color: D.textSec, fontSize: 11, margin: '0 0 8px', lineHeight: 1.4 }}>{r.description}</p>
                <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: 12, fontWeight: 900, padding: '3px 10px', borderRadius: 20 }}>✨ {r.pointCost} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section>
          <p style={{ color: D.textPri, fontWeight: 900, fontSize: 16, margin: '0 0 12px' }}>History</p>
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden' }}>
            {history.map((claim, i) => {
              const reward = rewards.find(r => r.id === claim.rewardId);
              if (!reward) return null;
              return (
                <div key={claim.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < history.length - 1 ? `1px solid ${D.border}` : 'none' }}>
                  <span style={{ fontSize: 24 }}>{reward.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: D.textPri, fontWeight: 700, fontSize: 13, margin: '0 0 1px' }}>{reward.title}</p>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <MemberName memberId={claim.claimedBy} style={{ color: D.textSec, fontSize: 11 }} />
                      <span style={{ color: D.textSec, fontSize: 11 }}>· {timeAgo(claim.claimedAt)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 900, padding: '3px 9px', borderRadius: 20, background: claim.status === 'approved' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: claim.status === 'approved' ? '#34d399' : '#f87171' }}>
                    {claim.status === 'approved' ? '✓ Done' : '✗ Declined'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function KidRewards() {
  const { currentUser, rewards, rewardClaims, claimReward } = useApp();
  const myPoints   = currentUser.points;
  const color      = currentUser.color;
  const myClaims   = rewardClaims.filter(c => c.claimedBy === currentUser.id);
  const claimedIds = new Set(myClaims.filter(c => c.status === 'pending' || c.status === 'approved').map(c => c.rewardId));
  const affordable = rewards.filter(r => r.pointCost <= myPoints && !claimedIds.has(r.id));
  const saving     = rewards.filter(r => r.pointCost > myPoints && !claimedIds.has(r.id));

  return (
    <div style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Points hero tile */}
      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 24, padding: 20, boxShadow: `0 0 0 1px ${color}25, 0 8px 32px ${color}12` }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}55)`, borderRadius: 2 }} />
        </div>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>YOUR BALANCE</p>
        <p style={{ color, fontSize: 48, fontWeight: 900, lineHeight: 1, margin: '0 0 4px' }}>✨ {myPoints}</p>
        <p style={{ color: D.textSec, fontSize: 12, margin: 0 }}>habit points ready to spend</p>
      </div>

      {/* Pending claims */}
      {myClaims.filter(c => c.status === 'pending').map(claim => {
        const reward = rewards.find(r => r.id === claim.rewardId);
        if (!reward) return null;
        return (
          <div key={claim.id} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{reward.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fcd34d', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{reward.title}</p>
              <p style={{ color: '#f59e0b', fontSize: 12, margin: 0 }}>⏳ Waiting for parent approval</p>
            </div>
          </div>
        );
      })}

      {/* Can afford — full width cards */}
      {affordable.length > 0 && (
        <section>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>🎉 YOU CAN CLAIM NOW</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {affordable.map(r => (
              <div key={r.id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 14px', boxShadow: `0 2px 12px ${color}10` }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 3px' }}>{r.title}</p>
                  <span style={{ background: `${color}18`, color, fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>✨ {r.pointCost}</span>
                </div>
                <button onClick={() => claimReward(r.id)} style={{ padding: '12px 18px', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 14px ${color}44`, border: 'none', cursor: 'pointer', flexShrink: 0 }}>Claim!</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saving up — 2-col grid */}
      {saving.length > 0 && (
        <section>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>💪 SAVE UP FOR</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {saving.map(r => {
              const needed   = r.pointCost - myPoints;
              const progress = Math.min((myPoints / r.pointCost) * 100, 100);
              return (
                <div key={r.id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 18, padding: 14, opacity: 0.85 }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{r.emoji}</span>
                  <p style={{ color: D.textPri, fontWeight: 700, fontSize: 13, margin: '0 0 4px', lineHeight: 1.2 }}>{r.title}</p>
                  <p style={{ color: '#a78bfa', fontWeight: 900, fontSize: 12, margin: '0 0 10px' }}>✨ {r.pointCost}</p>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 5, marginBottom: 4 }}>
                    <div style={{ background: color, height: 5, borderRadius: 99, width: `${progress}%` }} />
                  </div>
                  <p style={{ color: D.textSec, fontSize: 11 }}>{needed} more needed</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {rewards.length === 0 && (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: '36px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🎁</p>
          <p style={{ color: D.textPri, fontWeight: 700 }}>No rewards yet.</p>
          <p style={{ color: D.textSec, fontSize: 13 }}>Ask a parent to add some!</p>
        </div>
      )}
    </div>
  );
}

function AddRewardModal({ onClose }) {
  const { addReward } = useApp();
  const [form, setForm] = useState({ title: '', description: '', pointCost: 50, emoji: '🎁' });
  const EMOJIS = ['🎮', '🍕', '🎬', '🌙', '🍦', '🏖️', '🎁', '🎯', '🛍️', '🎪', '🎠', '🏆'];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', color: D.textPri, fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: `1px solid ${D.border}`, boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 20px' }}>Add a Reward</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EMOJIS.map(e => <button key={e} onClick={() => set('emoji', e)} style={{ width: 46, height: 46, borderRadius: 14, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: form.emoji === e ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)', border: `2px solid ${form.emoji === e ? '#7c3aed' : 'transparent'}`, cursor: 'pointer' }}>{e}</button>)}
            </div>
          </div>
          <div><label style={labelStyle}>Title</label><input autoFocus type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Extra Screen Time" style={inputStyle} /></div>
          <div><label style={labelStyle}>Description</label><input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What do they get?" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Points Required: <span style={{ color: '#a78bfa' }}>{form.pointCost}</span></label>
            <input type="range" value={form.pointCost} onChange={e => set('pointCost', Number(e.target.value))} min="10" max="300" step="5" style={{ width: '100%', accentColor: '#7c3aed' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: D.textSec, fontSize: 11, marginTop: 2 }}><span>10</span><span>150</span><span>300</span></div>
          </div>
        </div>
        <button onClick={() => { if (!form.title.trim()) return; addReward(form); onClose(); }} disabled={!form.title.trim()} style={{ width: '100%', marginTop: 20, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)', opacity: form.title.trim() ? 1 : 0.4 }}>
          Add Reward
        </button>
      </div>
    </div>
  );
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
