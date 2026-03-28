import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { members, setCurrentUserId } = useApp();
  const parents = members.filter(m => m.role === 'parent');
  const kids    = members.filter(m => m.role === 'child');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏠</div>
          <h1 className="text-4xl font-bold text-white mb-1">ChoreFamily</h1>
          <p className="text-indigo-200 text-sm">Build habits. Earn rewards. Together.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <p className="text-center text-gray-500 text-sm font-semibold mb-5 uppercase tracking-wider">
            Who are you?
          </p>

          {parents.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Parents</p>
              <div className="grid grid-cols-2 gap-3">
                {parents.map(m => (
                  <MemberCard key={m.id} member={m} onSelect={() => setCurrentUserId(m.id)} />
                ))}
              </div>
            </div>
          )}

          {kids.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Kids</p>
              <div className="grid grid-cols-3 gap-3">
                {kids.map(m => (
                  <MemberCard key={m.id} member={m} onSelect={() => setCurrentUserId(m.id)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-indigo-200 text-xs mt-5">Tap your name to get started</p>
      </div>
    </div>
  );
}

function MemberCard({ member, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center py-5 px-3 rounded-2xl border-2 border-transparent active:scale-95 transition-all"
      style={{ backgroundColor: member.bg }}
      onMouseEnter={e => e.currentTarget.style.borderColor = member.color}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      <span className="text-4xl mb-2">{member.emoji}</span>
      <span className="text-sm font-bold" style={{ color: member.color }}>{member.name}</span>
      <span className="text-xs text-gray-400 mt-1">
        {member.role === 'child' ? `${member.points} pts` : 'Parent'}
      </span>
    </button>
  );
}
