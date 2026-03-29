import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { members: allMembers, accessLevel, setCurrentUserId } = useApp();

  // Kids-only devices can only see child members
  const members = accessLevel === 'kids-only'
    ? allMembers.filter(m => m.role === 'child')
    : allMembers;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col items-center flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2.5rem)', paddingBottom: '1.5rem' }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-3 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
          }}
        >
          🏠
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">ChoreFamily</h1>
        <p className="text-indigo-300 text-sm mt-1 font-medium">
          {accessLevel === 'kids-only' ? "Choose your character!" : "Who's playing?"}
        </p>
      </div>

      {/* Member grid */}
      <div
        className="flex-1 grid grid-cols-2 gap-4 px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)', alignContent: 'start' }}
      >
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
  const isParent = member.role === 'parent';

  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center justify-center rounded-3xl active:scale-95 transition-all gap-3 relative overflow-hidden"
      style={{
        minHeight: '172px',
        background: `linear-gradient(145deg, ${member.bg} 0%, white 100%)`,
        boxShadow: `0 8px 30px ${member.color}40, 0 2px 8px rgba(0,0,0,0.15)`,
        border: `2px solid ${member.color}30`,
      }}
    >
      {/* Subtle glow circle in background */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ backgroundColor: member.color }}
      />

      {/* Role badge */}
      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-black"
        style={{
          background: isParent
            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
            : `linear-gradient(135deg, ${member.color}, ${member.color}cc)`,
          color: 'white',
          fontSize: '10px',
          letterSpacing: '0.05em',
        }}
      >
        {isParent ? '👑 PARENT' : 'PLAYER'}
      </div>

      <span className="text-6xl leading-none relative z-10">{member.emoji}</span>

      <div className="text-center px-3 relative z-10">
        <p className="font-black text-lg leading-tight" style={{ color: member.color }}>
          {member.name}
        </p>
        {!isParent && (
          <div
            className="mt-1.5 px-3 py-0.5 rounded-full text-xs font-black inline-block"
            style={{ backgroundColor: member.color, color: 'white' }}
          >
            ✨ {member.points} pts
          </div>
        )}
      </div>
    </button>
  );
}
