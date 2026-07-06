import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const D = {
  bg:      '#0f0a23',
  card:    '#1a1430',
  cardAlt: '#221a3d',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#9e98bd',
};

const fmt = c => '$' + (c / 100).toFixed(2);

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

export default function FamilyScreen() {
  const { currentUser } = useApp();
  return currentUser.role === 'parent' ? <ParentFamilyView /> : <KidProfileView />;
}

function CodeCard({ title, subtitle, code, badgeLabel, accent, onCopy, copied }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${accent}40`, borderRadius: 20, padding: 16, boxShadow: `0 4px 20px ${accent}12` }}>
      <span style={{ display: 'inline-block', marginBottom: 8, background: `${accent}20`, color: accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 20 }}>{badgeLabel}</span>
      <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 4px' }}>{title}</p>
      <p style={{ color: D.textSec, fontSize: 12, margin: '0 0 12px', lineHeight: 1.4 }}>{subtitle}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, background: `${accent}10`, border: `1px solid ${accent}30`, borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
          <span style={{ color: accent, fontSize: 20, fontWeight: 900, letterSpacing: '0.18em' }}>{code || '—'}</span>
        </div>
        <button onClick={onCopy} style={{ padding: '10px 16px', borderRadius: 14, fontWeight: 700, color: 'white', fontSize: 13, background: accent, border: 'none', cursor: 'pointer', boxShadow: `0 4px 12px ${accent}40`, flexShrink: 0 }}>
          {copied ? '✓ Done' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function ParentFamilyView() {
  const { members, chores, familyCode, kidCode } = useApp();
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [editingMember,   setEditingMember]   = useState(null);
  const [adjustingMember, setAdjustingMember] = useState(null);
  const [showReset,       setShowReset]       = useState(false);
  const [parentCopied,    setParentCopied]    = useState(false);
  const [kidCopied,       setKidCopied]       = useState(false);

  const parents = members.filter(m => m.role === 'parent');
  const kids    = members.filter(m => m.role === 'child');

  const copyParent = () => { navigator.clipboard?.writeText(familyCode).catch(() => {}); setParentCopied(true); setTimeout(() => setParentCopied(false), 2000); };
  const copyKid    = () => { navigator.clipboard?.writeText(kidCode).catch(() => {}); setKidCopied(true); setTimeout(() => setKidCopied(false), 2000); };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <SectionLabel text="INVITE CODES" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CodeCard title="Full Access — Parents" subtitle="Share with other parents. Can assign, approve, and manage everything." code={familyCode} badgeLabel="👑 PARENT CODE" accent="#f59e0b" onCopy={copyParent} copied={parentCopied} />
          <CodeCard title="Kids Only" subtitle="Share with kids. They see and complete chores — no approval access." code={kidCode} badgeLabel="🎮 KID CODE" accent="#10b981" onCopy={copyKid} copied={kidCopied} />
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionLabel text="PARENTS" noMargin />
          <button onClick={() => setShowAddModal('parent')} style={{ color: '#818cf8', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {parents.map(m => <MemberCard key={m.id} member={m} chores={chores} onEdit={() => setEditingMember(m)} />)}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionLabel text="KIDS" noMargin />
          <button onClick={() => setShowAddModal('child')} style={{ color: '#818cf8', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
        </div>
        {kids.length === 0 ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ color: D.textSec, fontSize: 14 }}>No kids yet.</p>
            <button onClick={() => setShowAddModal('child')} style={{ color: '#818cf8', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 }}>Add a kid →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {kids.map(m => <MemberCard key={m.id} member={m} chores={chores} onEdit={() => setEditingMember(m)} onAdjust={() => setAdjustingMember(m)} />)}
          </div>
        )}
      </section>

      <section style={{ borderTop: `1px solid ${D.border}`, paddingTop: 20 }}>
        <p style={{ color: '#f87171', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>DANGER ZONE</p>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} style={{ width: '100%', padding: '14px 0', borderRadius: 14, color: '#f87171', fontWeight: 700, fontSize: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>
            Reset App &amp; Start Over
          </button>
        ) : (
          <ResetConfirm onCancel={() => setShowReset(false)} />
        )}
      </section>

      {showAddModal    && <AddMemberModal role={showAddModal} onClose={() => setShowAddModal(false)} />}
      {editingMember   && <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} />}
      {adjustingMember && <AdjustBalanceModal member={adjustingMember} onClose={() => setAdjustingMember(null)} />}
    </div>
  );
}

function SectionLabel({ text, noMargin }) {
  return (
    <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: noMargin ? 0 : '0 0 12px' }}>
      {text}
    </p>
  );
}

function MemberCard({ member, chores, onEdit, onAdjust }) {
  const approved = (member.history || []).length;
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${member.color}18`, border: `1px solid ${member.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
        {member.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: '0 0 2px' }}>{member.name}</p>
        <p style={{ color: D.textSec, fontSize: 12, margin: 0 }}>
          {member.role === 'parent' ? '👑 Parent' : `💰 ${fmt(member.points)} earned · ${approved} chores done`}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {member.role === 'child' && onAdjust && (
          <button onClick={onAdjust} title="Adjust balance" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            💸
          </button>
        )}
        <button onClick={onEdit} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✏️
        </button>
      </div>
    </div>
  );
}

function AdjustBalanceModal({ member, onClose }) {
  const { adjustBalance } = useApp();
  const [isDeduct, setIsDeduct] = useState(true);
  const [dollars,  setDollars]  = useState('');
  const [note,     setNote]     = useState('');

  const parsedCents = Math.round(parseFloat(dollars) * 100);
  const canSubmit   = parsedCents > 0 && !isNaN(parsedCents) && note.trim().length > 0;

  const handle = () => {
    if (!canSubmit) return;
    adjustBalance(member.id, isDeduct ? -parsedCents : parsedCents, note.trim());
    onClose();
  };

  const displayAmt = dollars && parseFloat(dollars) > 0 ? `$${parseFloat(dollars).toFixed(2)}` : '$0.00';

  return (
    <DarkModal onClose={onClose} title={`${member.emoji} ${member.name}`}>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>Current Balance</p>
        <p style={{ color: member.color, fontSize: 28, fontWeight: 900, margin: 0 }}>{fmt(member.points)}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setIsDeduct(true)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, border: `2px solid ${isDeduct ? '#f87171' : D.border}`, background: isDeduct ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)', color: isDeduct ? '#f87171' : D.textSec, cursor: 'pointer' }}>
          − Deduct
        </button>
        <button onClick={() => setIsDeduct(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, border: `2px solid ${!isDeduct ? '#34d399' : D.border}`, background: !isDeduct ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', color: !isDeduct ? '#34d399' : D.textSec, cursor: 'pointer' }}>
          + Add
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Amount</p>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: D.textSec, fontSize: 16, fontWeight: 700, pointerEvents: 'none' }}>$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={dollars}
            onChange={e => setDollars(e.target.value)}
            placeholder="0.00"
            autoFocus
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px 12px 28px', color: '#f0f6fc', fontSize: 18, fontWeight: 700, boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Note / Reason</p>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isDeduct ? "e.g. Sophia's squishies from $5 Below" : 'e.g. Bonus for helping with groceries'}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', color: '#f0f6fc', fontSize: 14, fontWeight: 600, boxSizing: 'border-box', outline: 'none' }}
        />
      </div>

      <button
        onClick={handle}
        disabled={!canSubmit}
        style={{ width: '100%', padding: '15px 0', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 15, background: isDeduct ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: canSubmit ? 'pointer' : 'default', opacity: canSubmit ? 1 : 0.4 }}
      >
        {isDeduct ? `− ${displayAmt} Deduction` : `+ ${displayAmt} Addition`}
      </button>
    </DarkModal>
  );
}

function ResetConfirm({ onCancel }) {
  const { resetApp } = useApp();
  return (
    <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 16, padding: 16 }}>
      <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Reset everything?</p>
      <p style={{ color: D.textSec, fontSize: 12, margin: '0 0 14px', lineHeight: 1.4 }}>This deletes all members, chores, balances, and rewards. Cannot be undone.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={resetApp} style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: '#dc2626', color: 'white', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer' }}>Yes, reset</button>
        <button onClick={onCancel} style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, color: D.textPri, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

function KidProfileView() {
  const { currentUser, chores, rewardClaims, rewards } = useApp();
  const myChores       = chores.filter(c => c.assignedTo === currentUser.id);
  const totalApproved  = myChores.filter(c => c.status === 'approved').length;
  const claimedRewards = rewardClaims
    .filter(c => c.claimedBy === currentUser.id && c.status === 'approved')
    .map(c => rewards.find(r => r.id === c.rewardId))
    .filter(Boolean);
  const color = currentUser.color;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: D.card, border: `1px solid ${color}35`, borderRadius: 24, padding: 20, textAlign: 'center', boxShadow: `0 4px 24px ${color}15` }}>
        <div style={{ height: 4, marginBottom: 16, borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 12px' }}>{currentUser.emoji}</div>
        <p style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>{currentUser.name}</p>
        <span style={{ background: `${color}20`, color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Family Member</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatTile emoji="💰" value={fmt(currentUser.points)} label="Earned"     color={color} />
        <StatTile emoji="✅"        value={totalApproved}           label="Chores Done" color="#34d399" />
        <StatTile emoji="🎁" value={claimedRewards.length}   label="Cash Outs"  color="#c084fc" />
      </div>

      {claimedRewards.length > 0 && (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: 16 }}>
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>🏆 CASH OUTS EARNED</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {claimedRewards.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(192,132,252,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.emoji}</div>
                <span style={{ color: D.textPri, fontWeight: 700, fontSize: 14 }}>{r.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ emoji, value, label, color }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
      <p style={{ fontSize: 22, margin: '0 0 4px' }}>{emoji}</p>
      <p style={{ color, fontSize: value && value.toString().length > 4 ? 16 : 24, fontWeight: 900, lineHeight: 1, margin: '0 0 4px' }}>{value}</p>
      <p style={{ color: D.textSec, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
    </div>
  );
}

function AddMemberModal({ role, onClose }) {
  const { addMember } = useApp();
  const emojiOptions = role === 'parent' ? PARENT_EMOJIS : KID_EMOJIS;
  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState(emojiOptions[0]);

  return (
    <DarkModal onClose={onClose} title={`Add ${role === 'parent' ? 'Parent' : 'Kid'}`}>
      <EmojiPicker options={emojiOptions} selected={emoji} onSelect={setEmoji} />
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" maxLength={20} autoFocus
        style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', color: '#f0f6fc', fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' }} />
      <button onClick={() => { if (!name.trim()) return; addMember({ name: name.trim(), emoji, role }); onClose(); }} disabled={!name.trim()}
        style={{ width: '100%', marginTop: 14, padding: '15px 0', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 15, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)', opacity: name.trim() ? 1 : 0.4 }}>
        Add {role === 'parent' ? 'Parent' : 'Kid'}
      </button>
    </DarkModal>
  );
}

function EditMemberModal({ member, onClose }) {
  const { updateMember, removeMember, currentUserId } = useApp();
  const emojiOptions = member.role === 'parent' ? PARENT_EMOJIS : KID_EMOJIS;
  const [name,       setName]       = useState(member.name);
  const [emoji,      setEmoji]      = useState(member.emoji);
  const [colorIdx,   setColorIdx]   = useState(PRESET_COLORS.findIndex(c => c.color === member.color) ?? 0);
  const [showDelete, setShowDelete] = useState(false);
  const isSelf = member.id === currentUserId;

  return (
    <DarkModal onClose={onClose} title={`Edit ${member.name}`}>
      <EmojiPicker options={emojiOptions} selected={emoji} onSelect={setEmoji} />
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" maxLength={20}
        style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', color: '#f0f6fc', fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' }} />
      <div style={{ marginTop: 14 }}>
        <p style={{ color: '#9e98bd', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>Color</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c, i) => (
            <button key={c.color} onClick={() => setColorIdx(i)}
              style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: c.color, border: `3px solid ${colorIdx === i ? 'white' : 'transparent'}`, cursor: 'pointer', transform: colorIdx === i ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }} />
          ))}
        </div>
      </div>
      <button onClick={() => { if (!name.trim()) return; updateMember(member.id, { name: name.trim(), emoji, ...PRESET_COLORS[colorIdx] }); onClose(); }} disabled={!name.trim()}
        style={{ width: '100%', marginTop: 16, padding: '15px 0', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 15, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)', opacity: name.trim() ? 1 : 0.4 }}>
        Save Changes
      </button>
      {!isSelf && !showDelete && (
        <button onClick={() => setShowDelete(true)}
          style={{ width: '100%', marginTop: 8, padding: '12px 0', borderRadius: 16, color: '#f87171', fontWeight: 700, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
          Remove {member.name}
        </button>
      )}
      {showDelete && (
        <div style={{ marginTop: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 14, padding: 14 }}>
          <p style={{ color: '#f0f6fc', fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>Remove {member.name}? Their chores will also be removed.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { removeMember(member.id); onClose(); }} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#dc2626', color: 'white', fontWeight: 900, fontSize: 13, border: 'none', cursor: 'pointer' }}>Remove</button>
            <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f6fc', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </DarkModal>
  );
}

function DarkModal({ onClose, title, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#221a3d', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: '1px solid rgba(255,255,255,0.08)', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 18px' }} />
        <h3 style={{ color: '#f0f6fc', fontWeight: 900, fontSize: 20, margin: '0 0 16px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function EmojiPicker({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(e => (
        <button key={e} onClick={() => onSelect(e)}
          style={{ width: 44, height: 44, borderRadius: 14, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected === e ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)', border: `2px solid ${selected === e ? '#6366f1' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
          {e}
        </button>
      ))}
    </div>
  );
}
