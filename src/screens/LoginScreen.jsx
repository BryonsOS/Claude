import { useApp } from '../context/AppContext';

const D = {
  bg:      '#0d1117',
  card:    '#161b22',
  border:  'rgba(255,255,255,0.08)',
  textPri: '#f0f6fc',
  textSec: '#8b949e',
};

export default function LoginScreen() {
  const { members: allMembers, accessLevel, setCurrentUserId } = useApp();

  const members = accessLevel === 'kids-only'
    ? allMembers.filter(m => m.role === 'child')
    : allMembers;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1117 50%, #0f0c1a 100%)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'calc(env(safe-area-inset-top) + 2.5rem)',
        paddingBottom: '1.5rem',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 12,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
        }}>
          🏠
        </div>
        <h1 style={{ color: D.textPri, fontSize: 30, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          ChoreFamily
        </h1>
        <p style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, margin: 0 }}>
          {accessLevel === 'kids-only' ? 'Choose your character!' : "Who's playing?"}
        </p>
      </div>

      {/* Member grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        padding: '0 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
        alignContent: 'start',
      }}>
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
      style={{
        minHeight: 172,
        background: D.card,
        border: `1px solid ${member.color}30`,
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: `0 0 0 0 ${member.color}00, 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 24px ${member.color}30, 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`;
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Color accent bar at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${member.color}, ${member.color}88)`,
      }} />

      {/* Subtle glow orb */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: member.color,
        opacity: 0.08,
        filter: 'blur(20px)',
      }} />

      {/* Role badge */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        padding: '3px 8px',
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.06em',
        background: isParent
          ? 'linear-gradient(135deg, #f59e0b, #f97316)'
          : `${member.color}22`,
        color: isParent ? 'white' : member.color,
        border: isParent ? 'none' : `1px solid ${member.color}44`,
      }}>
        {isParent ? '👑 PARENT' : 'PLAYER'}
      </div>

      {/* Emoji */}
      <span style={{ fontSize: 56, lineHeight: 1, position: 'relative', zIndex: 1 }}>
        {member.emoji}
      </span>

      {/* Name + points */}
      <div style={{ textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
        <p style={{ color: D.textPri, fontWeight: 800, fontSize: 17, margin: '0 0 6px', lineHeight: 1 }}>
          {member.name}
        </p>
        {!isParent && (
          <div style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
            background: `${member.color}22`,
            color: member.color,
            border: `1px solid ${member.color}44`,
          }}>
            💰 ${(member.points / 100).toFixed(2)}
          </div>
        )}
      </div>
    </button>
  );
}
