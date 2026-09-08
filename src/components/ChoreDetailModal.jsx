import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META, daysLabel } from '../data/initialData';
import { ProofSheet } from './ProofSheet';
import { formatDate } from '../utils/date';

const D = {
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#9e98bd',
};

const fmt = c => '$' + (c / 100).toFixed(2);

export const STATUS_MAP = {
  pending:   { label: 'To Do',        color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  completed: { label: 'Needs Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  approved:  { label: 'Approved ✓',   color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  rejected:  { label: 'Redo',         color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

// Shared by the Chores tab and the parent Home screen. onEdit/onDelete are
// optional — Home opens the sheet purely to review and approve.
export default function ChoreDetailModal({ chore, onClose, onEdit, onDelete }) {
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
      <div style={{ background: '#221a3d', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 520, padding: '24px 24px 40px', border: `1px solid ${D.border}`, overflowY: 'auto', maxHeight: '90vh', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
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
          {isParent && (onEdit || onDelete) && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {onEdit   && <button onClick={onEdit}   style={{ padding: '8px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>✏️ Edit</button>}
              {onDelete && <button onClick={onDelete} style={{ padding: '8px 12px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>🗑</button>}
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
