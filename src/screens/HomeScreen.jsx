import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../data/initialData';

const today = () => new Date().toISOString().split('T')[0];

export default function HomeScreen({ setActiveTab }) {
  const { currentUser } = useApp();
  return currentUser.role === 'parent'
    ? <ParentHome setActiveTab={setActiveTab} />
    : <KidHome setActiveTab={setActiveTab} />;
}

// ─── Parent Home ──────────────────────────────────────────────────────────────

function ParentHome({ setActiveTab }) {
  const { members, chores, rewardClaims, currentUser } = useApp();
  const kids = members.filter(m => m.role === 'child');
  const pendingApprovals = chores.filter(c => c.status === 'completed');
  const pendingRewards   = rewardClaims.filter(c => c.status === 'pending');
  const todayChores = chores.filter(c => c.dueDate === today());
  const doneToday   = todayChores.filter(c => c.status === 'approved').length;
  const totalToday  = todayChores.length;
  const pct = totalToday ? Math.round((doneToday / totalToday) * 100) : 0;
  const needsAction = pendingApprovals.length + pendingRewards.length;

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Header banner */}
      <div className="px-4 pt-5 pb-6"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <p className="text-indigo-200 text-sm font-medium">Hi, {currentUser.name} 👋</p>
        <h1 className="text-3xl font-black text-white mt-0.5">Family Overview</h1>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatBadge value={totalToday} label="Today" sublabel="chores" color="white" />
          <StatBadge value={`${pct}%`} label="Done" sublabel="today" color="white" />
          <StatBadge value={needsAction} label="Action" sublabel="needed" color={needsAction > 0 ? '#fbbf24' : 'white'} />
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-3">
        {/* Needs attention */}
        {needsAction > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}>
              <span className="text-white text-lg">⚡</span>
              <span className="text-white font-bold">Needs your approval</span>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingApprovals.map(c => (
                <ApprovalRow key={c.id} chore={c} onTap={() => setActiveTab('chores')} />
              ))}
              {pendingRewards.map(cl => (
                <RewardRow key={cl.id} claim={cl} onTap={() => setActiveTab('rewards')} />
              ))}
            </div>
          </div>
        )}

        {/* Kids cards */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Kids</p>
          <div className="space-y-3">
            {kids.map(kid => <KidCard key={kid.id} kid={kid} chores={chores} onTap={() => setActiveTab('chores')} />)}
            {kids.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="text-gray-400 text-sm">No kids added yet — go to the Family tab to add them.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's chore list */}
        {todayChores.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Today's Chores</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {todayChores.slice(0, 5).map((c, i) => (
                <ChoreRow key={c.id} chore={c} last={i === Math.min(todayChores.length, 5) - 1} />
              ))}
              {todayChores.length > 5 && (
                <button onClick={() => setActiveTab('chores')}
                  className="w-full py-3 text-center text-indigo-500 font-semibold text-sm border-t border-gray-50">
                  See all {todayChores.length} chores →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ value, label, sublabel, color }) {
  return (
    <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-center">
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-white text-xs font-semibold">{label}</p>
      <p className="text-indigo-200 text-xs">{sublabel}</p>
    </div>
  );
}

function ApprovalRow({ chore, onTap }) {
  const { members } = useApp();
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const kid = members.find(m => m.id === chore.assignedTo);
  return (
    <button onClick={onTap} className="w-full flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: cat.bg }}>{cat.emoji}</div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-800 text-sm">{chore.title}</p>
        <p className="text-xs text-gray-400">{kid?.name} · +{chore.points} pts</p>
      </div>
      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Review</span>
    </button>
  );
}

function RewardRow({ claim, onTap }) {
  const { members, rewards } = useApp();
  const kid    = members.find(m => m.id === claim.claimedBy);
  const reward = rewards.find(r => r.id === claim.rewardId);
  if (!reward) return null;
  return (
    <button onClick={onTap} className="w-full flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">
        {reward.emoji}
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-800 text-sm">{reward.title}</p>
        <p className="text-xs text-gray-400">{kid?.name} · {reward.pointCost} pts</p>
      </div>
      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">Claim</span>
    </button>
  );
}

function KidCard({ kid, chores, onTap }) {
  const myChores = chores.filter(c => c.assignedTo === kid.id);
  const done     = myChores.filter(c => c.status === 'approved').length;
  const review   = myChores.filter(c => c.status === 'completed').length;
  const pct      = myChores.length ? Math.round((done / myChores.length) * 100) : 0;

  return (
    <button onClick={onTap} className="w-full bg-white rounded-2xl p-4 shadow-sm text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: kid.bg }}>{kid.emoji}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="font-bold text-gray-900 text-base">{kid.name}</p>
            <p className="font-black text-lg" style={{ color: kid.color }}>✨ {kid.points}</p>
          </div>
          <div className="flex gap-3 mt-0.5">
            <span className="text-xs text-gray-500">{done}/{myChores.length} done</span>
            {review > 0 && <span className="text-xs font-bold text-amber-500">⚡ {review} to review</span>}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: kid.color }} />
      </div>
    </button>
  );
}

function ChoreRow({ chore, last }) {
  const { members } = useApp();
  const cat      = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  const assignee = members.find(m => m.id === chore.assignedTo);
  const status   = {
    pending:   { label: 'To Do',   color: '#6366f1', bg: '#eef2ff' },
    completed: { label: 'Review',  color: '#f59e0b', bg: '#fffbeb' },
    approved:  { label: 'Done ✓',  color: '#22c55e', bg: '#f0fdf4' },
    rejected:  { label: 'Redo',    color: '#ef4444', bg: '#fef2f2' },
  }[chore.status] || { label: 'To Do', color: '#6366f1', bg: '#eef2ff' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!last ? 'border-b border-gray-50' : ''}`}>
      <span className="text-lg">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{chore.title}</p>
        <p className="text-xs text-gray-400">{assignee?.name}</p>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ color: status.color, backgroundColor: status.bg }}>{status.label}</span>
    </div>
  );
}

// ─── Kid Home ─────────────────────────────────────────────────────────────────

function KidHome({ setActiveTab }) {
  const { currentUser, chores, rewards, completeChore } = useApp();
  const myChores     = chores.filter(c => c.assignedTo === currentUser.id);
  const todayChores  = myChores.filter(c => c.dueDate === today());
  const pending      = todayChores.filter(c => c.status === 'pending');
  const done         = todayChores.filter(c => c.status === 'approved').length;
  const waiting      = todayChores.filter(c => c.status === 'completed').length;
  const canAfford    = rewards.filter(r => r.pointCost <= currentUser.points);
  const streak       = calcStreak(myChores);

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-5 pb-8"
        style={{ background: `linear-gradient(135deg, ${currentUser.color} 0%, ${currentUser.color}bb 100%)` }}>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full" />
        <div className="absolute right-4 -bottom-8 w-24 h-24 bg-white opacity-5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center text-4xl">
              {currentUser.emoji}
            </div>
            <div>
              <p className="text-white text-opacity-75 text-sm">Hey there,</p>
              <h1 className="text-3xl font-black text-white">{currentUser.name}!</h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <HeroStat label="Points" value={currentUser.points} icon="✨" />
            <HeroStat label="Streak" value={`${streak}d`} icon="🔥" />
            <HeroStat label="Today" value={`${done}/${todayChores.length}`} icon="✅" />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2">
        {/* All done banner */}
        {pending.length === 0 && todayChores.length > 0 && (
          <div className="bg-green-500 rounded-2xl p-4 text-center shadow-lg">
            <p className="text-3xl mb-1">🎉</p>
            <p className="font-black text-white text-lg">All done today!</p>
            {waiting > 0 && <p className="text-green-100 text-sm mt-0.5">{waiting} chore{waiting > 1 ? 's' : ''} waiting for approval</p>}
          </div>
        )}

        {/* Pending chores */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              To Do Today · {pending.length} left
            </p>
            <div className="space-y-2.5">
              {pending.map(chore => (
                <BigChoreCard
                  key={chore.id}
                  chore={chore}
                  onComplete={() => completeChore(chore.id)}
                  color={currentUser.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Waiting for approval */}
        {waiting > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Waiting for Approval</p>
            <div className="space-y-2">
              {todayChores.filter(c => c.status === 'completed').map(chore => {
                const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
                return (
                  <div key={chore.id} className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{cat.emoji}</span>
                    <p className="flex-1 font-semibold text-amber-800 text-sm">{chore.title}</p>
                    <span className="text-xs text-amber-500 font-bold">⏳ Pending</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Affordable rewards */}
        {canAfford.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rewards You Can Get</p>
              <button onClick={() => setActiveTab('rewards')} className="text-indigo-500 text-xs font-bold">See all</button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {canAfford.slice(0, 5).map(r => (
                <div key={r.id} className="flex-shrink-0 w-28 bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                  <span className="text-3xl">{r.emoji}</span>
                  <p className="text-xs font-bold text-gray-700 mt-1.5 leading-tight line-clamp-2">{r.title}</p>
                  <p className="text-indigo-600 font-black text-sm mt-1">✨ {r.pointCost}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStat({ label, value, icon }) {
  return (
    <div className="bg-white bg-opacity-20 rounded-2xl p-3 text-center">
      <p className="text-white text-opacity-70 text-xs mb-0.5">{label}</p>
      <p className="text-white font-black text-xl leading-none">{icon} {value}</p>
    </div>
  );
}

function BigChoreCard({ chore, onComplete, color }) {
  const cat = CATEGORY_META[chore.category] || CATEGORY_META.cleaning;
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-3 flex-1 px-4 py-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: cat.bg }}>{cat.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{chore.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">+{chore.points} pts</p>
        </div>
        <button onClick={onComplete}
          className="px-4 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0"
          style={{ backgroundColor: color }}>
          Done ✓
        </button>
      </div>
    </div>
  );
}

function calcStreak(chores) {
  if (!chores.length) return 0;
  const dates = new Set(chores.filter(c => c.status === 'approved' && c.approvedAt).map(c => c.approvedAt.split('T')[0]));
  let s = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().split('T')[0])) s++;
    else if (i > 0) break;
  }
  return s;
}
