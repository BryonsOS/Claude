import { useApp } from '../context/AppContext';

export function MemberAvatar({ memberId, size = 'md' }) {
  const { members } = useApp();
  const member = members.find(m => m.id === memberId);
  if (!member) return null;

  const sizes = {
    sm: { outer: 28, font: '14px' },
    md: { outer: 36, font: '18px' },
    lg: { outer: 48, font: '24px' },
    xl: { outer: 64, font: '32px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: s.outer, height: s.outer,
        backgroundColor: member.bgColor,
        fontSize: s.font,
      }}
    >
      {member.emoji}
    </div>
  );
}

export function MemberName({ memberId, className = '' }) {
  const { members } = useApp();
  const member = members.find(m => m.id === memberId);
  return <span className={className}>{member?.name || 'Unknown'}</span>;
}
