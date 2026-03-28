import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../data/initialData';
import { MemberAvatar } from '../components/MemberAvatar';

export default function HomeScreen({ setActiveTab }) {
  const { currentUser } = useApp();
  return currentUser.role === 'parent'
    ? <ParentHome setActiveTab={setActiveTab} />
    : <KidHome setActiveTab={setActiveTab} />;
}

// ─── Parent Home ──────────────────────────────────────────────────────────────

function ParentHome({ setActiveTab }) {
  const { members, chores, rewardClaims } = useApp();
  const kids = members.filter(m => m.role === 'child');
  const pendingApprovals = chores.filter(c => c.status === 'completed');
  const pendingRewards = rewardClaims.filter(c => c.status === 'pending');
  const todayChores = chores.filter(c => c.dueDate === new Date().toISOString().split('T')[0]);
  const doneToday = todayChores.filter(c => c.status === 'approved').length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold text-gray-800">Good morning! 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's what your family is up to today.</p>
      </div>

      {/* Pending Approvals Banner */}
      {(pendingApprovals.length > 0 || pendingRewards.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏳</span>
            <span className="font-semibold text-amber-800">Needs Your Attention</span>
          </div>
          {pendingApprovals.length > 0 && (
            <button onClick={() => setActiveTab('chores')} className="w-full text-left">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-amber-700">✅ {pendingApprovals.length} chore{pendingApprovals.length > 1 ? 's' : ''} to approve</span>
                <span className="text-amber-500 text-xs">→</span>
              </div>
            </button>
          )}
          {pendingRewards.length > 0 && (
            <button onClick={() => setActiveTab('rewards')} className="w-full text-left">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-amber-700">🎁 {pendingRewards.length} reward claim{pendingRewards.length > 1 ? 's' : ''} waiting</span>
                <span className="text-amber-500 text-xs">→</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Today's Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-700">Today's Chores</span>
          <span className="text-sm text-gray-400">{doneToday}/{todayChores.length} done</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${todayChores.length ? (doneToday / todayChores.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #818cf8, #6366f1)',
            }}
          />
        </div>
        <div className="space-y-2">
          {todayChores.slice(0, 4).map(chore => (
            <ChoreRow key={chore.id} chore={chore} />
          ))}
          {todayChores.length > 4 && (
            <button onClick={() => setActiveTab('chores')} className="text-indigo-500 text-sm font-medium">
              +{todayChores.length - 4} more →
            </button>
          )}
        </div>
      </div>

      {/* Kids Overview */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-700">Kids Overview</span>
        </div>
        <div className="space-y-3">
          {kids.map(kid => <KidCard key={kid.id} kid={kid} chores={chores} />)}
        </div>
      </div>
    </div>
  );
}

function ChoreRow({ chore }) {
  const { members } = useApp();
  const assignee = members.find(m => m.id === chore.assignedTo);
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;

  const statusConfig = {
    pending: { color: '#9ca3af', label: 'To Do', bg: '#f3f4f6' },
    completed: { color: '#f59e0b', label: 'Review', bg: '#fffbeb' },
    approved: { color: '#22c55e', label: 'Done', bg: '#f0fdf4' },
    rejected: { color: '#ef4444', label: 'Redo', bg: '#fef2f2' },
  };
  const st = statusConfig[chore.status] || statusConfig.pending;

  return (
    <div className="flex items-center gap-3">
      <span className="text-base">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{chore.title}</p>
        <p className="text-xs text-gray-400">{assignee?.name}</p>
      </div>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ color: st.color, backgroundColor: st.bg }}>
        {st.label}
      </span>
    </div>
  );
}

function KidCard({ kid, chores }) {
  const myChores = chores.filter(c => c.assignedTo === kid.id);
  const done = myChores.filter(c => c.status === 'approved').length;
  const needsReview = myChores.filter(c => c.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <MemberAvatar memberId={kid.id} size="lg" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">{kid.name}</span>
            <span className="text-indigo-600 font-bold text-sm">✨ {kid.points} pts</span>
          </div>
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-gray-500">{done}/{myChores.length} done today</span>
            {needsReview > 0 && (
              <span className="text-xs font-medium text-amber-600">⏳ {needsReview} review</span>
            )}
          </div>
        </div>
      </div>
      {myChores.length > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${myChores.length ? (done / myChores.length) * 100 : 0}%`,
                backgroundColor: kid.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kid Home ─────────────────────────────────────────────────────────────────

function KidHome({ setActiveTab }) {
  const { currentUser, chores, rewards, rewardClaims, completeChore } = useApp();
  const myChores = chores.filter(c => c.assignedTo === currentUser.id);
  const todayChores = myChores.filter(c => c.dueDate === new Date().toISOString().split('T')[0]);
  const pendingChores = todayChores.filter(c => c.status === 'pending');
  const doneChores = todayChores.filter(c => c.status === 'approved' || c.status === 'completed');
  const canAfford = rewards.filter(r => r.pointCost <= currentUser.points);

  // Calculate streak (simplified: consecutive days with all approved chores)
  const streak = calculateStreak(myChores);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      {/* Kid Hero Card */}
      <div
        className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${currentUser.color} 0%, ${currentUser.color}cc 100%)` }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
              {currentUser.emoji}
            </div>
            <div>
              <p className="text-white text-opacity-80 text-sm">Welcome back,</p>
              <h2 className="text-2xl font-bold">{currentUser.name}!</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Points" value={`✨ ${currentUser.points}`} />
            <StatPill label="Streak" value={`🔥 ${streak}d`} />
            <StatPill label="Today" value={`${doneChores.length}/${todayChores.length}`} />
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white bg-opacity-10 rounded-full" />
        <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-white bg-opacity-5 rounded-full" />
      </div>

      {/* Today's To-Do */}
      {pendingChores.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-700">Today's To-Do</span>
            <span className="text-xs text-gray-400">{pendingChores.length} left</span>
          </div>
          <div className="space-y-2">
            {pendingChores.map(chore => (
              <KidChoreCard key={chore.id} chore={chore} onComplete={() => completeChore(chore.id)} color={currentUser.color} />
            ))}
          </div>
        </div>
      )}

      {/* All Done! */}
      {pendingChores.length === 0 && todayChores.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-green-800">All done for today!</p>
          <p className="text-sm text-green-600 mt-1">Waiting for parent approval on some chores.</p>
        </div>
      )}

      {/* Rewards you can afford */}
      {canAfford.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-700">Rewards You Can Get 🎁</span>
            <button onClick={() => setActiveTab('rewards')} className="text-indigo-500 text-xs font-medium">See all →</button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {canAfford.slice(0, 4).map(reward => (
              <MiniRewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-white bg-opacity-20 rounded-2xl p-2.5 text-center">
      <p className="text-white font-bold text-sm">{value}</p>
      <p className="text-white text-opacity-70 text-xs">{label}</p>
    </div>
  );
}

function KidChoreCard({ chore, onComplete, color }) {
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
      <div className="text-xl w-8 text-center">{cat.emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{chore.title}</p>
        <p className="text-xs text-gray-400">+{chore.points} pts</p>
      </div>
      <button
        onClick={onComplete}
        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        Done ✓
      </button>
    </div>
  );
}

function MiniRewardCard({ reward }) {
  return (
    <div className="flex-shrink-0 bg-indigo-50 rounded-2xl p-3 w-28 text-center border border-indigo-100">
      <span className="text-2xl">{reward.emoji}</span>
      <p className="text-xs font-semibold text-gray-700 mt-1 leading-tight line-clamp-2">{reward.title}</p>
      <p className="text-indigo-600 font-bold text-xs mt-1">✨ {reward.pointCost}</p>
    </div>
  );
}

function calculateStreak(chores) {
  // Simplified streak: count days in a row with at least one approved chore
  if (!chores.length) return 0;
  const approvedDates = new Set(
    chores
      .filter(c => c.status === 'approved' && c.approvedAt)
      .map(c => c.approvedAt.split('T')[0])
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (approvedDates.has(dateStr)) streak++;
    else if (i > 0) break;
  }
  return streak;
}
