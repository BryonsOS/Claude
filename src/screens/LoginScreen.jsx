import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { members, setCurrentUserId } = useApp();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1e1b4b' }}>
      {/* Compact header */}
      <div
        className="flex flex-col items-center pt-10 pb-5 px-6 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2.5rem)' }}
      >
        <span className="text-5xl mb-2">🏠</span>
        <h1 className="text-2xl font-bold text-white">ChoreFamily</h1>
        <p className="text-indigo-300 text-sm mt-1">Who's using the app?</p>
      </div>

      {/* Full-screen member grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 p-3 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}>
        {members.map(member => (
          <MemberTile
            key={member.id}
            member={member}
            onSelect={() => setCurrentUserId(member.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MemberTile({ member, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center justify-center rounded-3xl active:scale-95 transition-transform gap-3"
      style={{ backgroundColor: member.bg, minHeight: '160px' }}
    >
      <span className="text-6xl leading-none">{member.emoji}</span>
      <div className="text-center px-2">
        <p className="font-bold text-lg leading-tight" style={{ color: member.color }}>
          {member.name}
        </p>
        <p className="text-sm mt-0.5" style={{ color: member.color, opacity: 0.7 }}>
          {member.role === 'parent' ? 'Parent' : `✨ ${member.points} pts`}
        </p>
      </div>
    </button>
  );
}
