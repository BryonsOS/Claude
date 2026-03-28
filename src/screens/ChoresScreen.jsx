import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../data/initialData';
import { MemberAvatar, MemberName } from '../components/MemberAvatar';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'To Do' },
  { id: 'completed', label: 'Review' },
  { id: 'approved', label: 'Done' },
];

export default function ChoresScreen() {
  const { currentUser } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChore, setSelectedChore] = useState(null);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Chore Board</h2>
        {currentUser.role === 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            + Assign
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === tab.id
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ChoreList filter={filter} onSelectChore={setSelectedChore} />

      {showAddModal && <AddChoreModal onClose={() => setShowAddModal(false)} />}
      {selectedChore && (
        <ChoreDetailModal chore={selectedChore} onClose={() => setSelectedChore(null)} />
      )}
    </div>
  );
}

function ChoreList({ filter, onSelectChore }) {
  const { currentUser, chores, members } = useApp();
  const isParent = currentUser.role === 'parent';

  const filtered = chores.filter(c => {
    if (!isParent && c.assignedTo !== currentUser.id) return false;
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-3">✨</span>
        <p className="font-medium">Nothing here!</p>
        <p className="text-sm mt-1">
          {filter === 'completed' ? 'No chores waiting for review.' : 'All chores are accounted for.'}
        </p>
      </div>
    );
  }

  // Group by assignee for parent view
  if (isParent && filter === 'all') {
    const kids = members.filter(m => m.role === 'child');
    return (
      <div className="px-4 space-y-4 pb-4">
        {kids.map(kid => {
          const kidChores = filtered.filter(c => c.assignedTo === kid.id);
          if (!kidChores.length) return null;
          return (
            <div key={kid.id}>
              <div className="flex items-center gap-2 mb-2">
                <MemberAvatar memberId={kid.id} size="sm" />
                <span className="font-semibold text-gray-700 text-sm">{kid.name}</span>
                <span className="text-xs text-gray-400">({kidChores.length})</span>
              </div>
              <div className="space-y-2">
                {kidChores.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2 pb-4">
      {filtered.map(c => <ChoreCard key={c.id} chore={c} onClick={() => onSelectChore(c)} />)}
    </div>
  );
}

function ChoreCard({ chore, onClick }) {
  const { currentUser, completeChore, approveChore } = useApp();
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const isParent = currentUser.role === 'parent';
  const isMyChore = chore.assignedTo === currentUser.id;

  const statusConfig = {
    pending:   { color: '#6366f1', bg: '#eef2ff', label: 'To Do' },
    completed: { color: '#f59e0b', bg: '#fffbeb', label: 'Needs Review' },
    approved:  { color: '#22c55e', bg: '#f0fdf4', label: 'Approved ✓' },
    rejected:  { color: '#ef4444', bg: '#fef2f2', label: 'Redo' },
  };
  const st = statusConfig[chore.status] || statusConfig.pending;

  const isOverdue = chore.dueDate < new Date().toISOString().split('T')[0] && chore.status === 'pending';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl p-2 flex-shrink-0" style={{ backgroundColor: cat.bg }}>
          <span className="text-xl">{cat.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-800 text-sm leading-tight">{chore.title}</p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ color: st.color, backgroundColor: st.bg }}>
              {st.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{chore.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-indigo-600 font-bold text-xs">+{chore.points} pts</span>
            {isParent && (
              <div className="flex items-center gap-1">
                <MemberAvatar memberId={chore.assignedTo} size="sm" />
                <MemberName memberId={chore.assignedTo} className="text-xs text-gray-500" />
              </div>
            )}
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {isOverdue ? '⚠️ Overdue' : `📅 ${formatDate(chore.dueDate)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
        {!isParent && isMyChore && chore.status === 'pending' && (
          <button
            onClick={() => completeChore(chore.id)}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: currentUser.color }}
          >
            Mark Complete ✓
          </button>
        )}
        {!isParent && isMyChore && chore.status === 'completed' && (
          <div className="flex-1 py-2 rounded-xl text-xs font-medium text-amber-600 text-center bg-amber-50">
            ⏳ Waiting for parent approval
          </div>
        )}
        {isParent && chore.status === 'completed' && (
          <>
            <button
              onClick={() => approveChore(chore.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-green-500"
            >
              Approve ✓
            </button>
            <button
              onClick={() => {}} // opens detail for rejection reason
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ChoreDetailModal({ chore, onClose }) {
  const { currentUser, approveChore, rejectChore, completeChore } = useApp();
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const isParent = currentUser.role === 'parent';

  const handleReject = () => {
    rejectChore(chore.id, rejectReason);
    onClose();
  };

  const statusConfig = {
    pending:   { color: '#6366f1', label: 'To Do' },
    completed: { color: '#f59e0b', label: 'Needs Review' },
    approved:  { color: '#22c55e', label: 'Approved' },
    rejected:  { color: '#ef4444', label: 'Needs Redo' },
  };
  const st = statusConfig[chore.status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl p-3" style={{ backgroundColor: cat.bg }}>
            <span className="text-3xl">{cat.emoji}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{chore.title}</h3>
            <span className="text-sm font-medium" style={{ color: st.color }}>{st.label}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{chore.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoTile label="Points" value={`✨ ${chore.points}`} />
          <InfoTile label="Due" value={`📅 ${formatDate(chore.dueDate)}`} />
          <InfoTile label="Repeats" value={`🔁 ${chore.recurrence}`} />
          <InfoTile label="Category" value={`${cat.emoji} ${cat.label}`} />
        </div>

        {isParent && chore.status === 'completed' && !showReject && (
          <div className="flex gap-3">
            <button
              onClick={() => { approveChore(chore.id); onClose(); }}
              className="flex-1 py-3 rounded-2xl font-bold text-white bg-green-500"
            >
              Approve ✓
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex-1 py-3 rounded-2xl font-bold text-red-500 bg-red-50"
            >
              Send Back
            </button>
          </div>
        )}

        {isParent && chore.status === 'completed' && showReject && (
          <div className="space-y-3">
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Tell them what needs to be fixed..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500">
                Send Back
              </button>
              <button onClick={() => setShowReject(false)} className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isParent && chore.status === 'pending' && chore.assignedTo === currentUser.id && (
          <button
            onClick={() => { completeChore(chore.id); onClose(); }}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ backgroundColor: currentUser.color }}
          >
            Mark as Complete ✓
          </button>
        )}

        {chore.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl">
            <p className="text-xs font-semibold text-red-600 mb-1">Parent's note:</p>
            <p className="text-sm text-red-700">{chore.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function AddChoreModal({ onClose }) {
  const { members, addChore, currentUserId } = useApp();
  const kids = members.filter(m => m.role === 'child');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: kids[0]?.id || '',
    points: 15,
    dueDate: today,
    recurrence: 'once',
    category: 'cleaning',
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.assignedTo) return;
    addChore(form);
    onClose();
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 overflow-y-auto max-h-[85vh]"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold text-gray-800 mb-4">Assign a Chore</h3>

        <div className="space-y-4">
          <Field label="Chore Title">
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Wash Dishes"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What needs to be done..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none"
              rows={2}
            />
          </Field>

          <Field label="Assign To">
            <div className="flex gap-2">
              {kids.map(kid => (
                <button
                  key={kid.id}
                  onClick={() => set('assignedTo', kid.id)}
                  className="flex-1 flex flex-col items-center p-2.5 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: form.assignedTo === kid.id ? kid.color : '#e5e7eb',
                    backgroundColor: form.assignedTo === kid.id ? kid.bgColor : 'white',
                  }}
                >
                  <span className="text-xl">{kid.emoji}</span>
                  <span className="text-xs font-medium mt-0.5" style={{ color: form.assignedTo === kid.id ? kid.color : '#6b7280' }}>
                    {kid.name}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Points">
              <input
                type="number"
                value={form.points}
                onChange={e => set('points', Number(e.target.value))}
                min="5" max="100"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </Field>
          </div>

          <Field label="Repeats">
            <div className="flex gap-2">
              {['once', 'daily', 'weekly'].map(r => (
                <button
                  key={r}
                  onClick={() => set('recurrence', r)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                    form.recurrence === r
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Category">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => set('category', key)}
                  className="flex flex-col items-center py-2 px-1 rounded-xl border transition-all"
                  style={{
                    borderColor: form.category === key ? meta.color : '#e5e7eb',
                    backgroundColor: form.category === key ? meta.bg : 'white',
                  }}
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="text-xs mt-0.5" style={{ color: form.category === key ? meta.color : '#9ca3af' }}>
                    {meta.label}
                  </span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white bg-indigo-500 disabled:opacity-40"
        >
          Assign Chore
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
