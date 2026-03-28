import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MemberAvatar, MemberName } from '../components/MemberAvatar';

export default function RewardsScreen() {
  const { currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Rewards</h2>
        {currentUser.role === 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
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
    <div className="px-4 pb-4 space-y-5">
      {/* Pending Claims */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {pending.length}
            </span>
            Awaiting Approval
          </h3>
          <div className="space-y-3">
            {pending.map(claim => {
              const reward = rewards.find(r => r.id === claim.rewardId);
              const claimer = members.find(m => m.id === claim.claimedBy);
              if (!reward || !claimer) return null;
              return (
                <div key={claim.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
                      {reward.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{reward.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MemberAvatar memberId={claim.claimedBy} size="sm" />
                        <MemberName memberId={claim.claimedBy} className="text-sm text-gray-500" />
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{timeAgo(claim.claimedAt)}</span>
                      </div>
                    </div>
                    <span className="text-indigo-600 font-bold text-sm">✨ {reward.pointCost}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveRewardClaim(claim.id)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-green-500"
                    >
                      Approve 🎉
                    </button>
                    <button
                      onClick={() => rejectRewardClaim(claim.id)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-red-500 text-sm bg-red-50"
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
        <h3 className="font-semibold text-gray-700 mb-3">Available Rewards</h3>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>

      {/* Claim History */}
      {history.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">History</h3>
          <div className="space-y-2">
            {history.map(claim => {
              const reward = rewards.find(r => r.id === claim.rewardId);
              if (!reward) return null;
              return (
                <div key={claim.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                  <span className="text-2xl">{reward.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{reward.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MemberName memberId={claim.claimedBy} className="text-xs text-gray-400" />
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(claim.claimedAt)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    claim.status === 'approved'
                      ? 'text-green-600 bg-green-50'
                      : 'text-red-500 bg-red-50'
                  }`}>
                    {claim.status === 'approved' ? '✓ Approved' : '✗ Declined'}
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
    <div className="px-4 pb-4 space-y-5">
      {/* Points Banner */}
      <div
        className="rounded-2xl p-4 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${currentUser.color} 0%, ${currentUser.color}cc 100%)` }}
      >
        <p className="text-white text-opacity-80 text-sm">Your Balance</p>
        <p className="text-4xl font-bold">✨ {myPoints}</p>
        <p className="text-white text-opacity-70 text-xs mt-1">habit points</p>
      </div>

      {/* Pending Claims */}
      {myClaims.filter(c => c.status === 'pending').map(claim => {
        const reward = rewards.find(r => r.id === claim.rewardId);
        if (!reward) return null;
        return (
          <div key={claim.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-2xl">{reward.emoji}</span>
            <div className="flex-1">
              <p className="font-medium text-sm text-amber-800">{reward.title}</p>
              <p className="text-xs text-amber-600">⏳ Waiting for parent approval</p>
            </div>
          </div>
        );
      })}

      {/* Affordable Rewards */}
      {affordable.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">You Can Get These 🎉</h3>
          <div className="grid grid-cols-2 gap-3">
            {affordable.map(reward => (
              <KidRewardCard
                key={reward.id}
                reward={reward}
                canAfford
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
          <h3 className="font-semibold text-gray-700 mb-3">Save Up For 💪</h3>
          <div className="grid grid-cols-2 gap-3">
            {saving.map(reward => (
              <KidRewardCard
                key={reward.id}
                reward={reward}
                canAfford={false}
                myPoints={myPoints}
                color={currentUser.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RewardCard({ reward }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-3xl mb-2">{reward.emoji}</div>
      <p className="font-semibold text-sm text-gray-800 leading-tight">{reward.title}</p>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reward.description}</p>
      <p className="text-indigo-600 font-bold text-sm mt-2">✨ {reward.pointCost} pts</p>
    </div>
  );
}

function KidRewardCard({ reward, canAfford, onClaim, myPoints, color }) {
  const needed = reward.pointCost - (myPoints || 0);
  const progress = myPoints ? Math.min((myPoints / reward.pointCost) * 100, 100) : 0;

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
      canAfford ? 'border-indigo-100' : 'border-gray-100 opacity-80'
    }`}>
      <div className="text-3xl mb-2">{reward.emoji}</div>
      <p className="font-semibold text-sm text-gray-800 leading-tight">{reward.title}</p>
      <p className="text-indigo-600 font-bold text-xs mt-1">✨ {reward.pointCost} pts</p>

      {canAfford ? (
        <button
          onClick={onClaim}
          className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          Claim! 🎉
        </button>
      ) : (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400">{needed} more pts needed</p>
        </div>
      )}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold text-gray-800 mb-4">Add a Reward</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => set('emoji', e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                    form.emoji === e ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Extra Screen Time"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What do they get?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Points Required: {form.pointCost}
            </label>
            <input
              type="range"
              value={form.pointCost}
              onChange={e => set('pointCost', Number(e.target.value))}
              min="10" max="300" step="5"
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span><span>150</span><span>300</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white bg-indigo-500 disabled:opacity-40"
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
