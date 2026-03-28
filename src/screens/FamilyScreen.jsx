import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

export default function FamilyScreen() {
  const { currentUser } = useApp();
  return currentUser.role === 'parent' ? <ParentFamilyView /> : <KidProfileView />;
}

// ─── Parent view ──────────────────────────────────────────────────────────────

function ParentFamilyView() {
  const { members, chores } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showReset, setShowReset] = useState(false);

  const parents = members.filter(m => m.role === 'parent');
  const kids = members.filter(m => m.role === 'child');

  return (
    <div className="max-w-lg mx-auto px-4 pb-6 pt-4 space-y-5">
      {/* Parents */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Parents</h3>
          <button onClick={() => setShowAddModal('parent')}
            className="text-indigo-500 text-sm font-medium">+ Add</button>
        </div>
        <div className="space-y-2">
          {parents.map(m => (
            <MemberCard key={m.id} member={m} chores={chores} onEdit={() => setEditingMember(m)} />
          ))}
        </div>
      </section>

      {/* Kids */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Kids</h3>
          <button onClick={() => setShowAddModal('child')}
            className="text-indigo-500 text-sm font-medium">+ Add</button>
        </div>
        <div className="space-y-2">
          {kids.map(m => (
            <MemberCard key={m.id} member={m} chores={chores} onEdit={() => setEditingMember(m)} />
          ))}
          {kids.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No kids added yet.</p>
              <button onClick={() => setShowAddModal('child')}
                className="mt-2 text-indigo-500 text-sm font-medium">Add a kid →</button>
            </div>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="pt-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">Danger Zone</h3>
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium">
            Reset App & Start Over
          </button>
        ) : (
          <ResetConfirm onCancel={() => setShowReset(false)} />
        )}
      </section>

      {showAddModal && (
        <AddMemberModal role={showAddModal} onClose={() => setShowAddModal(false)} />
      )}
      {editingMember && (
        <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} />
      )}
    </div>
  );
}

function MemberCard({ member, chores, onEdit }) {
  const myChores = chores.filter(c => c.assignedTo === member.id);
  const approved = myChores.filter(c => c.status === 'approved').length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: member.bg }}>
        {member.emoji}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{member.name}</p>
        <p className="text-xs text-gray-400 capitalize">
          {member.role === 'parent' ? 'Parent' : `✨ ${member.points} pts · ${approved} chores done`}
        </p>
      </div>
      <button onClick={onEdit}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-50">
        ✏️
      </button>
    </div>
  );
}

function AddMemberModal({ role, onClose }) {
  const { addMember } = useApp();
  const emojiOptions = role === 'parent' ? PARENT_EMOJIS : KID_EMOJIS;
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(emojiOptions[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addMember({ name: name.trim(), emoji, role });
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`Add ${role === 'parent' ? 'Parent' : 'Kid'}`}>
      <EmojiPicker options={emojiOptions} selected={emoji} onSelect={setEmoji} />
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        maxLength={20}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-3"
        autoFocus
      />
      <button
        onClick={handleAdd}
        disabled={!name.trim()}
        className="w-full mt-4 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40"
      >
        Add {role === 'parent' ? 'Parent' : 'Kid'}
      </button>
    </Modal>
  );
}

function EditMemberModal({ member, onClose }) {
  const { updateMember, removeMember, currentUserId } = useApp();
  const emojiOptions = member.role === 'parent' ? PARENT_EMOJIS : KID_EMOJIS;
  const [name, setName] = useState(member.name);
  const [emoji, setEmoji] = useState(member.emoji);
  const [colorIdx, setColorIdx] = useState(
    PRESET_COLORS.findIndex(c => c.color === member.color) ?? 0
  );
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    updateMember(member.id, { name: name.trim(), emoji, ...PRESET_COLORS[colorIdx] });
    onClose();
  };

  const handleDelete = () => {
    removeMember(member.id);
    onClose();
  };

  const isSelf = member.id === currentUserId;

  return (
    <Modal onClose={onClose} title={`Edit ${member.name}`}>
      <EmojiPicker options={emojiOptions} selected={emoji} onSelect={setEmoji} />
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        maxLength={20}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-3"
      />
      <div className="mt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c, i) => (
            <button
              key={c.color}
              onClick={() => setColorIdx(i)}
              className="w-8 h-8 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c.color,
                borderColor: colorIdx === i ? '#1f2937' : 'transparent',
                transform: colorIdx === i ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full mt-4 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40"
      >
        Save
      </button>
      {!isSelf && !showDelete && (
        <button onClick={() => setShowDelete(true)}
          className="w-full mt-2 py-2.5 rounded-xl text-red-400 text-sm font-medium">
          Remove {member.name}
        </button>
      )}
      {showDelete && (
        <div className="mt-3 p-3 bg-red-50 rounded-xl">
          <p className="text-sm text-red-700 mb-3">Remove {member.name}? Their chores will also be removed.</p>
          <div className="flex gap-2">
            <button onClick={handleDelete}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold">Remove</button>
            <button onClick={() => setShowDelete(false)}
              className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ResetConfirm({ onCancel }) {
  const { resetApp } = useApp();
  return (
    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
      <p className="text-sm text-red-700 font-medium mb-1">Reset everything?</p>
      <p className="text-xs text-red-500 mb-4">
        This deletes all family members, chores, points, and rewards. It cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={resetApp}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm">
          Yes, reset
        </button>
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Kid profile view ─────────────────────────────────────────────────────────

function KidProfileView() {
  const { currentUser, chores, rewardClaims, rewards } = useApp();
  const myChores = chores.filter(c => c.assignedTo === currentUser.id);
  const totalApproved = myChores.filter(c => c.status === 'approved').length;
  const totalPoints = currentUser.points;
  const claimedRewards = rewardClaims
    .filter(c => c.claimedBy === currentUser.id && c.status === 'approved')
    .map(c => rewards.find(r => r.id === c.rewardId))
    .filter(Boolean);

  return (
    <div className="max-w-lg mx-auto px-4 pb-6 pt-4 space-y-4">
      {/* Profile hero */}
      <div className="rounded-3xl p-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${currentUser.color} 0%, ${currentUser.color}cc 100%)` }}>
        <div className="text-6xl mb-3">{currentUser.emoji}</div>
        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
        <p className="text-white text-opacity-80 text-sm mt-1">Family Member</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="✨" value={totalPoints} label="Points" />
        <StatCard emoji="✅" value={totalApproved} label="Chores Done" />
        <StatCard emoji="🎁" value={claimedRewards.length} label="Rewards Won" />
      </div>

      {/* Earned rewards */}
      {claimedRewards.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Rewards Earned 🏆</h3>
          <div className="space-y-2">
            {claimedRewards.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xl">{r.emoji}</span>
                <span className="text-sm text-gray-700">{r.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ emoji, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function EmojiPicker({ options, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(e => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
            selected === e ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-gray-50'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
