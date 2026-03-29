import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MemberAvatar, MemberName } from '../components/MemberAvatar';

export default function RewardsScreen() {
  const { currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }}>
        <div>
          <h1 className="text-2xl font-black text-white">Rewards</h1>
          <p className="text-purple-200 text-sm mt-0.5">
            {currentUser.role === 'parent' ? 'Manage what kids can earn' : 'Spend your hard-earned points'}
          </p>
        </div>
        {currentUser.role === 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-purple-600 font-bold px-4 py-2.5 rounded-2xl text-sm shadow-lg"
          >
            + Add
          </button>
        )}
      </div>

      {currentUser.role === 'parent' ? <ParentRewards /> : <KidRewards />}

      {showAddModal && <AddRewardModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// ─── Parent Rewards View ──────────────────────────────────────────────────────

function ParentRewards() {
  const { rewards, rewardClaims, approveRewardClaim, rejectRewardClaim, members } = useApp();
  const pending = rewardClaims.filter(c => c.status === 'pending');
  const history = rewardClaims.filter(c => c.status !== 'pending');

  return (
    <div className="px-4 pt-4 pb-4 space-y-5">
      {/* Pending Claims */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
              {pending.length}
            </span>
            <h3 className="font-black text-gray-900">Awaiting Approval</h3>
          </div>
          <div className="space-y-3">
            {pending.map(claim => {
              const reward = rewards.find(r => r.id === claim.rewardId);
              const claimer = members.find(m => m.id === claim.claimedBy);
              if (!reward || !claimer) return null;
              return (
                <div key={claim.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl flex-shrink-0">
                      {reward.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-base">{reward.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MemberAvatar memberId={claim.claimedBy} size="sm" />
                        <MemberName memberId={claim.claimedBy} className="text-sm text-gray-600 font-medium" />
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{timeAgo(claim.claimedAt)}</span>
                      </div>
                    </div>
                    <span className="font-black text-purple-600">✨ {reward.pointCost}</span>
                  </div>
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={() => approveRewardClaim(claim.id)}
                      className="flex-1 py-3.5 rounded-xl font-black text-white text-sm bg-green-500"
                    >
                      Approve 🎉
                    </button>
                    <button
                      onClick={() => rejectRewardClaim(claim.id)}
                      className="flex-1 py-3.5 rounded-xl font-black text-red-500 text-sm bg-red-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Available Rewards */}
      <div>
        <h3 className="font-black text-gray-900 mb-3">Available Rewards</h3>
        {rewards.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-4xl mb-2">🎁</p>
            <p className="text-gray-500 font-medium">No rewards yet.</p>
            <p className="text-gray-400 text-sm mt-1">Add rewards that kids can earn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        )}
      </div>

      {/* Claim History */}
      {history.length > 0 && (
        <div>
          <h3 className="font-black text-gray-900 mb-3">History</h3>
          <div className="space-y-2">
            {history.map(claim => {
              const reward = rewards.find(r => r.id === claim.rewardId);
              if (!reward) return null;
              return (
                <div key={claim.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                    {reward.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{reward.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MemberName memberId={claim.claimedBy} className="text-xs text-gray-400" />
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(claim.claimedAt)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    claim.status === 'approved'
                      ? 'text-green-700 bg-green-50'
                      : 'text-red-500 bg-red-50'
                  }`}>
                    {claim.status === 'approved' ? '✓ Done' : '✗ Declined'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kid Rewards View ─────────────────────────────────────────────────────────

function KidRewards() {
  const { currentUser, rewards, rewardClaims, claimReward } = useApp();
  const myPoints = currentUser.points;

  const myClaims = rewardClaims.filter(c => c.claimedBy === currentUser.id);
  const claimedIds = new Set(myClaims.filter(c => c.status === 'pending' || c.status === 'approved').map(c => c.rewardId));

  const affordable = rewards.filter(r => r.pointCost <= myPoints && !claimedIds.has(r.id));
  const saving = rewards.filter(r => r.pointCost > myPoints && !claimedIds.has(r.id));

  return (
    <div className="pb-4">
      {/* Points hero */}
      <div className="px-4 py-5"
        style={{ background: `linear-gradient(135deg, ${currentUser.color} 0%, ${currentUser.color}bb 100%)` }}>
        <p className="text-white text-opacity-80 text-sm font-medium">Your Balance</p>
        <p className="text-5xl font-black text-white mt-1">✨ {myPoints}</p>
        <p className="text-white text-opacity-60 text-xs mt-1">habit points</p>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Pending Claims */}
        {myClaims.filter(c => c.status === 'pending').map(claim => {
          const reward = rewards.find(r => r.id === claim.rewardId);
          if (!reward) return null;
          return (
            <div key={claim.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                {reward.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900">{reward.title}</p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">⏳ Waiting for parent approval</p>
              </div>
            </div>
          );
        })}

        {/* Affordable Rewards */}
        {affordable.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-black text-gray-900">You Can Get These</h3>
              <span className="text-lg">🎉</span>
            </div>
            <div className="space-y-3">
              {affordable.map(reward => (
                <AffordableRewardCard
                  key={reward.id}
                  reward={reward}
                  onClaim={() => claimReward(reward.id)}
                  color={currentUser.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Saving Up */}
        {saving.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-black text-gray-900">Save Up For</h3>
              <span className="text-lg">💪</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {saving.map(reward => (
                <SavingRewardCard
                  key={reward.id}
                  reward={reward}
                  myPoints={myPoints}
                  color={currentUser.color}
                />
              ))}
            </div>
          </div>
        )}

        {rewards.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-4xl mb-2">🎁</p>
            <p className="text-gray-500 font-medium">No rewards yet.</p>
            <p className="text-gray-400 text-sm mt-1">Ask a parent to add some!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RewardCard({ reward }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-4xl mb-2">{reward.emoji}</div>
      <p className="font-bold text-gray-900 leading-tight">{reward.title}</p>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reward.description}</p>
      <p className="font-black text-purple-600 text-sm mt-2">✨ {reward.pointCost} pts</p>
    </div>
  );
}

function AffordableRewardCard({ reward, onClaim, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-4 py-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl flex-shrink-0">
        {reward.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 leading-tight">{reward.title}</p>
        <p className="font-black text-purple-600 text-sm mt-0.5">✨ {reward.pointCost}</p>
      </div>
      <button
        onClick={onClaim}
        className="px-4 py-3 rounded-xl text-sm font-black text-white flex-shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      >
        Claim!
      </button>
    </div>
  );
}

function SavingRewardCard({ reward, myPoints, color }) {
  const needed = reward.pointCost - myPoints;
  const progress = Math.min((myPoints / reward.pointCost) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 opacity-80">
      <div className="text-3xl mb-2">{reward.emoji}</div>
      <p className="font-bold text-gray-800 text-sm leading-tight">{reward.title}</p>
      <p className="font-black text-purple-600 text-xs mt-1">✨ {reward.pointCost}</p>
      <div className="mt-3">
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-400 font-medium">{needed} more needed</p>
      </div>
    </div>
  );
}

function AddRewardModal({ onClose }) {
  const { addReward } = useApp();
  const [form, setForm] = useState({
    title: '',
    description: '',
    pointCost: 50,
    emoji: '🎁',
  });

  const EMOJIS = ['🎮', '🍕', '🎬', '🌙', '🍦', '🏖️', '🎁', '🎯', '🛍️', '🎪', '🎠', '🏆'];

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    addReward(form);
    onClose();
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-xl font-black text-gray-900 mb-5">Add a Reward</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => set('emoji', e)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                    form.emoji === e ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Extra Screen Time"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-purple-300"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What do they get?"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-300"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Points Required: <span className="text-purple-600">{form.pointCost}</span>
            </label>
            <input
              type="range"
              value={form.pointCost}
              onChange={e => set('pointCost', Number(e.target.value))}
              min="10" max="300" step="5"
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span><span>150</span><span>300</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          className="w-full mt-6 py-4 rounded-2xl font-black text-white text-base disabled:opacity-40 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }}
        >
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
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
