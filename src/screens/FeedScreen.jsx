import { useApp } from '../context/AppContext';
import { MemberAvatar } from '../components/MemberAvatar';
import { CATEGORY_META } from '../data/initialData';

export default function FeedScreen() {
  const { activityFeed } = useApp();

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
        <div>
          <h1 className="text-2xl font-black text-white">Family Feed</h1>
          <p className="text-blue-100 text-sm mt-0.5">Everything happening in real time</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-xs font-bold">Live</span>
        </div>
      </div>

      {/* Family Scoreboard */}
      <FamilyScoreboard />

      {/* Activity Feed */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="font-black text-gray-900 text-base">Recent Activity</h3>
        {activityFeed.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <span className="text-5xl">📢</span>
            <p className="mt-3 font-bold text-gray-500">No activity yet.</p>
            <p className="text-sm text-gray-400 mt-1">Get the kids started on some chores!</p>
          </div>
        ) : (
          activityFeed.map(entry => (
            <ActivityEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

function FamilyScoreboard() {
  const { members } = useApp();
  const kids = members.filter(m => m.role === 'child').sort((a, b) => b.points - a.points);
  const topPoints = kids[0]?.points || 1;

  if (kids.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="mx-4 my-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}>
        <span className="text-xl">🏆</span>
        <span className="font-black text-white text-base">Leaderboard</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {kids.map((kid, i) => (
          <div key={kid.id} className="flex items-center gap-3">
            <span className="text-xl w-7 flex-shrink-0">{medals[i] || `${i + 1}.`}</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: kid.bg }}>{kid.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900">{kid.name}</span>
                <span className="font-black text-sm" style={{ color: kid.color }}>✨ {kid.points}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.max((kid.points / Math.max(topPoints, 1)) * 100, 4)}%`,
                    backgroundColor: kid.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityEntry({ entry }) {
  const { members, chores, rewards } = useApp();
  const actor = members.find(m => m.id === entry.memberId);
  const target = members.find(m => m.id === entry.targetId);
  const chore = chores.find(c => c.id === entry.choreId);
  const reward = rewards.find(r => r.id === entry.rewardId);
  const cat = chore ? (CATEGORY_META[chore.category] || CATEGORY_META.cleaning) : null;

  if (!actor) return null;

  const configs = {
    chore_completed: {
      emoji: '✅',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> marked{' '}
          <em className="not-italic font-bold text-gray-800">"{chore?.title}"</em>{' '}
          as complete {cat?.emoji}
        </span>
      ),
    },
    chore_approved: {
      emoji: '🌟',
      bg: '#fefce8',
      border: '#fde68a',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> approved{' '}
          <Strong name={target?.name} color={target?.color} />'s{' '}
          <em className="not-italic font-bold text-gray-800">"{chore?.title}"</em>{' '}
          <span className="font-black text-indigo-600">+{chore?.points}✨</span>
        </span>
      ),
    },
    chore_rejected: {
      emoji: '↩️',
      bg: '#fef2f2',
      border: '#fecaca',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> sent back{' '}
          <em className="not-italic font-bold text-gray-800">"{chore?.title}"</em>{' '}
          for a redo
        </span>
      ),
    },
    chore_created: {
      emoji: '📋',
      bg: '#eef2ff',
      border: '#c7d2fe',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> assigned{' '}
          <em className="not-italic font-bold text-gray-800">"{chore?.title}"</em>{' '}
          to <Strong name={target?.name} color={target?.color} />
        </span>
      ),
    },
    reward_claimed: {
      emoji: '🎁',
      bg: '#fdf4ff',
      border: '#e9d5ff',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> claimed the{' '}
          <em className="not-italic font-bold text-gray-800">"{reward?.title}"</em>{' '}
          reward {reward?.emoji}
        </span>
      ),
    },
    reward_approved: {
      emoji: '🎉',
      bg: '#fdf4ff',
      border: '#e9d5ff',
      message: () => (
        <span>
          <Strong name={actor.name} color={actor.color} /> approved{' '}
          <Strong name={target?.name} color={target?.color} />'s{' '}
          <em className="not-italic font-bold text-gray-800">"{reward?.title}"</em>{' '}
          reward {reward?.emoji}
        </span>
      ),
    },
  };

  const cfg = configs[entry.type];
  if (!cfg) return null;

  return (
    <div
      className="rounded-2xl p-4 border flex items-start gap-3"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex-shrink-0">
        <MemberAvatar memberId={entry.memberId} size="md" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed font-medium">{cfg.message()}</p>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">{timeAgo(entry.ts)}</p>
      </div>
      <span className="text-2xl flex-shrink-0">{cfg.emoji}</span>
    </div>
  );
}

function Strong({ name, color }) {
  if (!name) return null;
  return <strong style={{ color }}>{name}</strong>;
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
