import { useApp } from '../context/AppContext';
import { MemberAvatar } from '../components/MemberAvatar';
import { CATEGORY_META } from '../data/initialData';

export default function FeedScreen() {
  const { activityFeed, members, chores, rewards } = useApp();

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Family Feed</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          Live updates 🟢
        </span>
      </div>

      {/* Family Scoreboard */}
      <FamilyScoreboard />

      {/* Activity Feed */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Recent Activity</h3>
        {activityFeed.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <span className="text-4xl">📢</span>
            <p className="mt-2 text-sm">No activity yet. Get to work! 😄</p>
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

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🏆</span> This Week's Leaderboard
      </h3>
      <div className="space-y-3">
        {kids.map((kid, i) => (
          <div key={kid.id} className="flex items-center gap-3">
            <span className="text-sm font-bold w-5 text-gray-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </span>
            <MemberAvatar memberId={kid.id} size="md" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-800">{kid.name}</span>
                <span className="text-indigo-600 font-bold text-sm">✨ {kid.points}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(kid.points / topPoints) * 100}%`,
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
          <em className="not-italic font-semibold text-gray-700">"{chore?.title}"</em>{' '}
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
          <em className="not-italic font-semibold text-gray-700">"{chore?.title}"</em>{' '}
          +{chore?.points}✨
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
          <em className="not-italic font-semibold text-gray-700">"{chore?.title}"</em>{' '}
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
          <em className="not-italic font-semibold text-gray-700">"{chore?.title}"</em>{' '}
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
          <em className="not-italic font-semibold text-gray-700">"{reward?.title}"</em>{' '}
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
          <em className="not-italic font-semibold text-gray-700">"{reward?.title}"</em>{' '}
          reward {reward?.emoji}
        </span>
      ),
    },
  };

  const cfg = configs[entry.type];
  if (!cfg) return null;

  return (
    <div
      className="rounded-2xl p-3.5 border flex items-start gap-3"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <MemberAvatar memberId={entry.memberId} size="md" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed">{cfg.message()}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(entry.ts)}</p>
      </div>
      <span className="text-xl flex-shrink-0">{cfg.emoji}</span>
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
