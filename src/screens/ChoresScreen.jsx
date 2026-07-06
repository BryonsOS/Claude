import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META, DAY_LABELS, isScheduledToday, daysLabel } from '../data/initialData';
import { MemberAvatar, MemberName } from '../components/MemberAvatar';
import { ProofSheet, PhotoPick } from '../components/ProofSheet';
import { PayChips } from '../components/PayChips';

const D = {
  bg:      '#0d1117',
  card:    '#161b22',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#8b949e',
};

const fmt = c => '$' + (c / 100).toFixed(2);

const STATUS_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'pending',   label: 'To Do' },
  { id: 'completed', label: 'Review' },
  { id: 'approved',  label: 'Done' },
  { id: 'requests',  label: 'Requests' },
];

const STATUS_MAP = {
  pending:   { label: 'To Do',        color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  completed: { label: 'Needs Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  approved:  { label: 'Approved ✓',   color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  rejected:  { label: 'Redo',         color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

export default function ChoresScreen() {
  const { currentUser, chores } = useApp();
  const [filter,           setFilter]           = useState('all');
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedChore,    setSelectedChore]    = useState(null);
  const [editingChore,     setEditingChore]     = useState(null);
  const [deletingChore,    setDeletingChore]    = useState(null);

  const isParent        = currentUser.role === 'parent';
  const pendingRequests = chores.filter(c =>
    c.selfReported && c.status === 'completed' && (isParent || c.assignedTo === currentUser.id)
  ).length;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 2px' }}>CHORES</p>
            <h1 style={{ color: D.textPri, fontSize: 26, fontWeight: 900, margin: 0 }}>Chore Board</h1>
          </div>
          {isParent && (
            <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 18px', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>+ Assign</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
          {STATUS_TABS.map(tab => {
            const active     = filter === tab.id;
            const badgeCount = tab.id === 'requests' ? pendingRequests : 0;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, border: active ? 'none' : `1px solid ${D.border}`, cursor: 'pointer', background: active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : D.card, color: active ? 'white' : D.textSec, boxShadow: active ? '0 4px 12px rgba(99,102,241,0.35)' : 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                {tab.label}
                {badgeCount > 0 && <span style={{ background: active ? 'rgba(255,255,255,0.3)' : '#ef4444', color: 'white', fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 10 }}>{badgeCount}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <ChoreList filter={filter} onSelectChore={setSelectedChore} onEditChore={setEditingChore} onDeleteChore={setDeletingChore} onRequest={() => setShowRequestModal(true)} />

      {showAddModal     && <AddChoreModal onClose={() => setShowAddModal(false)} />}
      {showRequestModal && <RequestChoreModal onClose={() => setShowRequestModal(false)} />}
      {selectedChore    && <ChoreDetailModal chore={selectedChore} onClose={() => setSelectedChore(null)} onEdit={() => { setEditingChore(selectedChore); setSelectedChore(null); }} onDelete={() => { setDeletingChore(selectedChore); setSelectedChore(null); }} />}
      {editingChore     && <EditChoreModal chore={editingChore} onClose={() => setEditingChore(null)} />}
      {deletingChore    && <DeleteChoreConfirm chore={deletingChore} onClose={() => setDeletingChore(null)} />}
    </div>
  );
}

function ChoreList({ filter, onSelectChore, onEditChore, onDeleteChore, onRequest }) {
  const { currentUser, chores, members, bulkApproveChores } = useApp();
  const isParent = currentUser.role === 'parent';

  if (filter === 'approved') {
    const people  = isParent ? members.filter(m => m.role === 'child') : [currentUser];
    const entries = people
      .flatMap(m => (m.history || []).map(h => ({ ...h, member: m })))
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 60);
    return (
      <div style={{ padding: '0 16px 16px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🏅</p>
            <p style={{ color: D.textPri, fontWeight: 700, fontSize: 16 }}>Nothing finished yet.</p>
            <p style={{ color: D.textSec, fontSize: 13 }}>Every approved chore shows up here — get after it!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(e => (
              <div key={e.id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: e.member.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{e.member.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: D.textPri, fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{e.title}</p>
                  <p style={{ color: D.textSec, fontSize: 11, margin: 0 }}>{isParent ? `${e.member.name} · ` : ''}{timeAgo(e.ts)}</p>
                </div>
                <span style={{ color: '#34d399', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>+{fmt(e.points)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filter === 'requests') {
    const allRequests = chores.filter(c => c.selfReported);
    const myRequests  = isParent ? allRequests : allRequests.filter(c => c.assignedTo === currentUser.id);
    const pending     = myRequests.filter(c => c.status === 'completed');
    const rest        = myRequests.filter(c => c.status !== 'completed');
    const ordered     = [...pending, ...rest];
    return (
      <div style={{ padding: '0 16px 16px' }}>
        {!isParent && (
          <button onClick={onRequest} style={{ width: '100%', padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}bb)`, border: 'none', cursor: 'pointer', boxShadow: `0 4px 20px ${currentUser.color}44`, marginBottom: 16 }}>
            📝 I Did Something!
          </button>
        )}
        {isParent && pending.length > 0 && (
          <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>NEEDS REVIEW</p>
        )}
        {ordered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isParent ? '40px 16px' : '20px 16px' }}>
            <p style={{ fontSize: 44, marginBottom: 10 }}>📝</p>
            <p style={{ color: D.textPri, fontWeight: 700, fontSize: 16 }}>{isParent ? 'No requests yet.' : 'Nothing submitted yet!'}</p>
            <p style={{ color: D.textSec, fontSize: 13 }}>{isParent ? 'Kids can request credit for chores they did on their own.' : 'Did something around the house? Tap above to request credit!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ordered.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} onEdit={() => onEditChore(c)} onDelete={() => onDeleteChore(c)} />)}
          </div>
        )}
      </div>
    );
  }

  const openChores = chores.filter(c =>
    !c.assignedTo && c.status === 'pending' && (filter === 'all' || filter === 'pending') &&
    (isParent || isScheduledToday(c))
  );

  const filtered = chores.filter(c => {
    if (!c.assignedTo && c.status === 'pending') return false;
    if (!isParent && c.assignedTo !== currentUser.id) return false;
    if (!isParent && c.status === 'pending' && !isScheduledToday(c)) return false;
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const allEmpty = filtered.length === 0 && openChores.length === 0;

  if (allEmpty) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 16px' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>✨</p>
        <p style={{ color: D.textPri, fontWeight: 700, fontSize: 16 }}>Nothing here!</p>
        <p style={{ color: D.textSec, fontSize: 13 }}>{filter === 'completed' ? 'No chores waiting for review.' : 'All chores are accounted for.'}</p>
      </div>
    );
  }

  if (isParent && filter === 'all') {
    const kids = members.filter(m => m.role === 'child');
    return (
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {openChores.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌟</div>
              <span style={{ color: D.textPri, fontWeight: 900, fontSize: 15 }}>Open — Anyone</span>
              <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{openChores.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openChores.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} onEdit={() => onEditChore(c)} onDelete={() => onDeleteChore(c)} />)}
            </div>
          </div>
        )}
        {kids.map(kid => {
          const kidChores = filtered.filter(c => c.assignedTo === kid.id);
          if (!kidChores.length) return null;
          return (
            <div key={kid.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: kid.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{kid.emoji}</div>
                <span style={{ color: D.textPri, fontWeight: 900, fontSize: 15 }}>{kid.name}</span>
                <span style={{ background: D.card, border: `1px solid ${D.border}`, color: D.textSec, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{kidChores.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kidChores.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} onEdit={() => onEditChore(c)} onDelete={() => onDeleteChore(c)} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isParent && filter === 'completed' && filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => bulkApproveChores(filtered.map(c => c.id))}
            style={{ padding: '10px 18px', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 13, background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}
          >
            ✅ Approve All ({filtered.length})
          </button>
        </div>
      )}
      {!isParent && openChores.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>🌟 Available to Claim</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {openChores.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} onEdit={() => onEditChore(c)} onDelete={() => onDeleteChore(c)} isOpen />)}
          </div>
        </div>
      )}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!isParent && openChores.length > 0 && <span style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>YOUR CHORES</span>}
          {filtered.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} onEdit={() => onEditChore(c)} onDelete={() => onDeleteChore(c)} />)}
        </div>
      )}
    </div>
  );
}

function ChoreCard({ chore, onClick, onEdit, onDelete, isOpen }) {
  const { currentUser, completeChore, approveChore, claimOpenChore, resetChore } = useApp();
  const [proofMode, setProofMode] = useState(null);
  const cat         = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const isParent    = currentUser.role === 'parent';
  const isMyChore   = chore.assignedTo === currentUser.id;
  const isOpenChore = !chore.assignedTo && chore.status === 'pending';
  const st          = STATUS_MAP[chore.status] || STATUS_MAP.pending;
  const isOverdue   = chore.dueDate && chore.dueDate < new Date().toISOString().split('T')[0] && chore.status === 'pending';
  const color       = currentUser.color;

  const submitProof = (photo) => {
    if (proofMode === 'claim') claimOpenChore(chore.id, photo);
    else completeChore(chore.id, photo);
    setProofMode(null);
  };

  return (
    <div style={{ background: D.card, border: isOpenChore ? '1px solid rgba(251,191,36,0.25)' : `1px solid ${D.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: isOpenChore ? '0 2px 12px rgba(251,191,36,0.08)' : '0 2px 8px rgba(0,0,0,0.3)' }}>
      {isOpenChore && <div style={{ height: 3, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 10px' }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ color: D.textPri, fontWeight: 900, fontSize: 15, margin: 0, lineHeight: 1.2 }}>{chore.title}</p>
            {isOpenChore
              ? <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>OPEN</span>
              : <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
            <span style={{ background: isOpenChore ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)', color: isOpenChore ? '#fbbf24' : '#818cf8', fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>+{fmt(chore.points)}</span>
            {isParent && !isOpenChore && <MemberName memberId={chore.assignedTo} style={{ color: D.textSec, fontSize: 11 }} />}
            {isParent && isOpenChore && <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 600 }}>🌟 First to finish wins</span>}
            {chore.dueDate && <span style={{ color: isOverdue ? '#f87171' : D.textSec, fontSize: 11, fontWeight: isOverdue ? 700 : 400 }}>{isOverdue ? '⚠️ Overdue' : `📅 ${formatDate(chore.dueDate)}`}</span>}
            {isParent && chore.days && chore.days.length > 0 && chore.days.length < 7 && (
              <span style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🗓 {daysLabel(chore.days)}</span>
            )}
            {chore.selfReported && <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>📝 Self-reported</span>}
          </div>
        </div>
      </div>

      {chore.proofPhoto && chore.status === 'completed' && (
        <div style={{ padding: '0 14px 10px' }}>
          <img src={chore.proofPhoto} alt="proof" onClick={onClick} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 14, display: 'block', cursor: 'pointer', border: `1px solid ${D.border}` }} />
        </div>
      )}

      <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
        {!isParent && isOpenChore && (
          <button onClick={() => setProofMode('claim')} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 16px rgba(245,158,11,0.45)', border: 'none', cursor: 'pointer' }}>
            🙋 I Did It! Earn {fmt(chore.points)}
          </button>
        )}
        {!isParent && isMyChore && chore.status === 'pending' && (
          <button onClick={() => setProofMode('complete')} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 16px ${color}44`, border: 'none', cursor: 'pointer' }}>Mark Done ✓</button>
        )}
        {!isParent && isMyChore && chore.status === 'completed' && (
          <div style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center', color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>⏳ Waiting for parent</div>
        )}
        {!isParent && isMyChore && chore.status === 'approved' && (
          <button onClick={() => setProofMode('complete')} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 16px ${color}44`, border: 'none', cursor: 'pointer' }}>🔄 Did it again!</button>
        )}
        {isParent && chore.status === 'completed' && (
          <>
            <button onClick={() => approveChore(chore.id)} style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 900, color: 'white', fontSize: 14, background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>Approve ✓</button>
            <button onClick={onClick} style={{ padding: '13px 18px', borderRadius: 14, fontWeight: 900, color: '#f87171', fontSize: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>Reject</button>
          </>
        )}
        {isParent && chore.status === 'approved' && !chore.selfReported && (
          <button onClick={() => resetChore(chore.id)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', cursor: 'pointer' }}>↩️ Do Again</button>
        )}
        {proofMode && (
          <ProofSheet chore={chore} color={proofMode === 'claim' ? '#f59e0b' : color} onSubmit={submitProof} onClose={() => setProofMode(null)} />
        )}
        {isParent && chore.status !== 'completed' && (
          <>
            <button onClick={onEdit}   style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer' }}>✏️ Edit</button>
            <button onClick={onDelete} style={{ padding: '11px 16px', borderRadius: 14, fontWeight: 700, fontSize: 13, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>🗑</button>
          </>
        )}
      </div>
    </div>
  );
}

function ChoreDetailModal({ chore, onClose, onEdit, onDelete }) {
  const { currentUser, members, approveChore, rejectChore, completeChore, resetChore } = useApp();
  const [rejectReason, setRejectReason] = useState('');
  const [showReject,   setShowReject]   = useState(false);
  const [showProof,    setShowProof]    = useState(false);
  const cat         = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const isParent    = currentUser.role === 'parent';
  const st          = STATUS_MAP[chore.status] || STATUS_MAP.pending;
  const assignedKid = members.find(m => m.id === chore.assignedTo);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 24px 40px', border: `1px solid ${D.border}`, overflowY: 'auto', maxHeight: '90vh', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>{cat.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 20, margin: '0 0 4px', lineHeight: 1.2 }}>{chore.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{st.label}</span>
              {assignedKid && <span style={{ color: D.textSec, fontSize: 12 }}>{assignedKid.emoji} {assignedKid.name}</span>}
            </div>
          </div>
          {isParent && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={onEdit}   style={{ padding: '8px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>✏️ Edit</button>
              <button onClick={onDelete} style={{ padding: '8px 12px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>🗑</button>
            </div>
          )}
        </div>
        {chore.proofPhoto && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>📸 PHOTO PROOF</p>
            <img src={chore.proofPhoto} alt="proof" style={{ width: '100%', borderRadius: 16, display: 'block', border: `1px solid ${D.border}` }} />
          </div>
        )}
        {chore.description && (
          <p style={{ color: D.textSec, fontSize: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>{chore.description}</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Earns',    value: fmt(chore.points) },
            { label: 'Due',      value: `📅 ${formatDate(chore.dueDate)}` },
            { label: 'Days',     value: `🗓 ${daysLabel(chore.days)}` },
            { label: 'Category', value: `${cat.emoji} ${cat.label}` },
          ].map(t => (
            <div key={t.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 12px' }}>
              <p style={{ color: D.textSec, fontSize: 11, margin: '0 0 2px' }}>{t.label}</p>
              <p style={{ color: D.textPri, fontWeight: 700, fontSize: 13, margin: 0 }}>{t.value}</p>
            </div>
          ))}
        </div>
        {isParent && chore.status === 'approved' && !chore.selfReported && (
          <button onClick={() => { resetChore(chore.id); onClose(); }} style={{ width: '100%', padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #34d399, #059669)', border: 'none', cursor: 'pointer', marginBottom: 10 }}>↩️ Do Again</button>
        )}
        {!isParent && chore.status === 'approved' && chore.assignedTo === currentUser.id && (
          <button onClick={() => setShowProof(true)} style={{ width: '100%', padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}bb)`, boxShadow: `0 4px 16px ${currentUser.color}44`, border: 'none', cursor: 'pointer', marginBottom: 10 }}>🔄 Did it again!</button>
        )}
        {isParent && chore.status === 'completed' && !showReject && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { approveChore(chore.id); onClose(); }} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}>Approve ✓</button>
            <button onClick={() => setShowReject(true)} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: '#f87171', fontSize: 16, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>Send Back</button>
          </div>
        )}
        {isParent && chore.status === 'completed' && showReject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Tell them what needs to be fixed..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', color: D.textPri, fontSize: 14, resize: 'none', boxSizing: 'border-box' }} rows={3} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { rejectChore(chore.id, rejectReason); onClose(); }} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', background: '#dc2626', border: 'none', cursor: 'pointer' }}>Send Back</button>
              <button onClick={() => setShowReject(false)} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: D.textSec, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        {!isParent && chore.status === 'pending' && chore.assignedTo === currentUser.id && (
          <button onClick={() => setShowProof(true)} style={{ width: '100%', padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}bb)`, boxShadow: `0 4px 16px ${currentUser.color}44`, border: 'none', cursor: 'pointer' }}>Mark as Complete ✓</button>
        )}
        {showProof && (
          <ProofSheet chore={chore} color={currentUser.color} onSubmit={(photo) => { completeChore(chore.id, photo); onClose(); }} onClose={() => setShowProof(false)} />
        )}
        {chore.rejectionReason && (
          <div style={{ marginTop: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 14, padding: '10px 14px' }}>
            <p style={{ color: '#f87171', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>PARENT'S NOTE:</p>
            <p style={{ color: '#fca5a5', fontSize: 14, margin: 0 }}>{chore.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DayPicker({ days, onChange }) {
  const toggle = (d) => {
    if (days.includes(d)) {
      if (days.length === 1) return;
      onChange(days.filter(x => x !== d));
    } else {
      onChange([...days, d]);
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        {DAY_LABELS.map((label, d) => {
          const on = days.includes(d);
          return (
            <button key={d} onClick={() => toggle(d)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 900, fontSize: 12, border: `1px solid ${on ? '#6366f1' : D.border}`, background: on ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)', color: on ? '#a5b4fc' : D.textSec, cursor: 'pointer' }}>{label}</button>
          );
        })}
      </div>
      <p style={{ color: D.textSec, fontSize: 11, margin: '6px 0 0' }}>{days.length === 7 ? 'Shows every day' : `Kids only see this chore on: ${daysLabel(days)}`}</p>
    </div>
  );
}

function EditChoreModal({ chore, onClose }) {
  const { updateChore } = useApp();
  const [form, setForm] = useState({ title: chore.title, description: chore.description || '', points: chore.points, dueDate: chore.dueDate, recurrence: chore.recurrence, days: chore.days && chore.days.length > 0 ? chore.days : [0, 1, 2, 3, 4, 5, 6] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', color: D.textPri, fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: `1px solid ${D.border}`, overflowY: 'auto', maxHeight: '90vh', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 20px' }}>Edit Chore</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={labelStyle}>Chore Title</label><input autoFocus type="text" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: 'none' }} rows={2} /></div>
          <div>
            <label style={labelStyle}>Pay Amount: <span style={{ color: '#818cf8' }}>{fmt(form.points)}</span></label>
            <PayChips value={form.points} onChange={v => set('points', v)} options={[50, 100, 200, 500]} />
            <input type="range" value={form.points} onChange={e => set('points', Number(e.target.value))} min="50" max="10000" step="50" style={{ width: '100%', accentColor: '#4f46e5' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: D.textSec, fontSize: 11, marginTop: 2 }}><span>$0.50</span><span>$50</span><span>$100</span></div>
          </div>
          <div><label style={labelStyle}>Due Date</label><input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Show on Days</label>
            <DayPicker days={form.days} onChange={d => set('days', d)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => { if (!form.title.trim()) return; updateChore(chore.id, form); onClose(); }} disabled={!form.title.trim()} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', opacity: form.title.trim() ? 1 : 0.4 }}>Save Changes</button>
          <button onClick={onClose} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 700, color: D.textSec, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DeleteChoreConfirm({ chore, onClose }) {
  const { deleteChore } = useApp();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: 24, width: '100%', maxWidth: 360, padding: '28px 24px', border: '1px solid rgba(248,113,113,0.2)' }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: 40, margin: '0 0 12px', textAlign: 'center' }}>🗑️</p>
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 18, margin: '0 0 6px', textAlign: 'center' }}>Delete Chore?</h3>
        <p style={{ color: D.textSec, fontSize: 14, margin: '0 0 20px', textAlign: 'center' }}>"{chore.title}" will be permanently removed.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { deleteChore(chore.id); onClose(); }} style={{ flex: 1, padding: '14px 0', borderRadius: 16, fontWeight: 900, color: 'white', fontSize: 15, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', border: 'none', cursor: 'pointer' }}>Delete</button>
          <button onClick={onClose} style={{ flex: 1, padding: '14px 0', borderRadius: 16, fontWeight: 700, color: D.textSec, fontSize: 15, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddChoreModal({ onClose }) {
  const { members, addChore } = useApp();
  const kids  = members.filter(m => m.role === 'child');
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: '', description: '', assignedTo: kids[0]?.id || '', points: 150, dueDate: today, recurrence: 'once', category: 'cleaning', days: [0, 1, 2, 3, 4, 5, 6] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', color: D.textPri, fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: `1px solid ${D.border}`, overflowY: 'auto', maxHeight: '90vh', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 20px' }}>Assign a Chore</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={labelStyle}>Chore Title</label><input autoFocus type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Wash Dishes" style={inputStyle} /></div>
          <div><label style={labelStyle}>Description (optional)</label><textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="What needs to be done..." style={{ ...inputStyle, resize: 'none' }} rows={2} /></div>
          <div>
            <label style={labelStyle}>Assign To</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => set('assignedTo', null)} style={{ flex: 1, padding: '12px 8px', borderRadius: 16, border: `2px solid ${form.assignedTo === null ? '#fbbf24' : D.border}`, background: form.assignedTo === null ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 24 }}>🌟</span>
                <span style={{ color: form.assignedTo === null ? '#fbbf24' : D.textSec, fontSize: 12, fontWeight: 700 }}>Anyone</span>
              </button>
              {kids.map(kid => (
                <button key={kid.id} onClick={() => set('assignedTo', kid.id)} style={{ flex: 1, padding: '12px 8px', borderRadius: 16, border: `2px solid ${form.assignedTo === kid.id ? kid.color : D.border}`, background: form.assignedTo === kid.id ? `${kid.color}15` : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 24 }}>{kid.emoji}</span>
                  <span style={{ color: form.assignedTo === kid.id ? kid.color : D.textSec, fontSize: 12, fontWeight: 700 }}>{kid.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Pay Amount: <span style={{ color: '#818cf8' }}>{fmt(form.points)}</span></label>
            <PayChips value={form.points} onChange={v => set('points', v)} options={[50, 100, 200, 500]} />
            <input type="range" value={form.points} onChange={e => set('points', Number(e.target.value))} min="50" max="10000" step="50" style={{ width: '100%', accentColor: '#4f46e5' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: D.textSec, fontSize: 11, marginTop: 2 }}><span>$0.50</span><span>$50</span><span>$100</span></div>
          </div>
          <div><label style={labelStyle}>Due Date</label><input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Show on Days</label>
            <DayPicker days={form.days} onChange={d => set('days', d)} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button key={key} onClick={() => set('category', key)} style={{ padding: '10px 6px', borderRadius: 14, border: `1px solid ${form.category === key ? meta.color : D.border}`, background: form.category === key ? `${meta.color}18` : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                  <span style={{ color: form.category === key ? meta.color : D.textSec, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => { if (!form.title.trim()) return; addChore(form); onClose(); }} disabled={!form.title.trim()} style={{ flex: 2, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', opacity: form.title.trim() ? 1 : 0.4 }}>Assign Chore</button>
          <button onClick={onClose} style={{ flex: 1, padding: '16px 0', borderRadius: 18, fontWeight: 700, color: D.textSec, fontSize: 15, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function RequestChoreModal({ onClose }) {
  const { currentUser, requestChore } = useApp();
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('other');
  const [points,      setPoints]      = useState(150);
  const [photo,       setPhoto]       = useState(null);

  const canSubmit  = title.trim().length > 0;
  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', color: D.textPri, fontSize: 15, fontWeight: 600, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { color: D.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div style={{ background: '#1a2234', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 20px 40px', border: `1px solid ${D.border}`, overflowY: 'auto', maxHeight: '90vh', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: D.textPri, fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>Request Credit</h3>
        <p style={{ color: D.textSec, fontSize: 13, margin: '0 0 20px' }}>Tell a parent what you did — they'll review and pay you!</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>What did you do?</label>
            <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Vacuumed the stairs" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Details (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any extra info for your parent..." style={{ ...inputStyle, resize: 'none' }} rows={2} />
          </div>
          <div>
            <label style={labelStyle}>Photo Proof (optional)</label>
            <PhotoPick photo={photo} onPhoto={setPhoto} color={currentUser.color} />
          </div>
          <div>
            <label style={labelStyle}>Suggested Pay: <span style={{ color: currentUser.color }}>{fmt(points)}</span></label>
            <PayChips value={points} onChange={setPoints} options={[50, 100, 200, 500]} color={currentUser.color} />
            <input type="range" value={points} onChange={e => setPoints(Number(e.target.value))} min="50" max="2000" step="50" style={{ width: '100%', accentColor: currentUser.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: D.textSec, fontSize: 11, marginTop: 2 }}><span>$0.50</span><span>$10</span><span>$20</span></div>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button key={key} onClick={() => setCategory(key)} style={{ padding: '10px 6px', borderRadius: 14, border: `1px solid ${category === key ? meta.color : D.border}`, background: category === key ? `${meta.color}18` : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                  <span style={{ color: category === key ? meta.color : D.textSec, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => { if (!canSubmit) return; requestChore(title.trim(), description.trim(), points, category, photo); onClose(); }}
          disabled={!canSubmit}
          style={{ width: '100%', marginTop: 20, padding: '16px 0', borderRadius: 18, fontWeight: 900, color: 'white', fontSize: 16, background: `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}bb)`, border: 'none', cursor: canSubmit ? 'pointer' : 'default', boxShadow: canSubmit ? `0 4px 20px ${currentUser.color}44` : 'none', opacity: canSubmit ? 1 : 0.4 }}
        >
          📝 Submit Request
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

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (dateStr === today)    return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
