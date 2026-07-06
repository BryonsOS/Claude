const border = 'rgba(255,255,255,0.08)';
const textSec = '#8b949e';

export function PayChips({ value, onChange, options, color = '#818cf8' }) {
  const label = c => c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`;
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {options.map(cents => {
        const on = value === cents;
        return (
          <button key={cents} onClick={() => onChange(cents)} style={{ flex: 1, padding: '9px 0', borderRadius: 12, fontWeight: 800, fontSize: 13, border: `1px solid ${on ? color : border}`, background: on ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.04)', color: on ? color : textSec, cursor: 'pointer' }}>{label(cents)}</button>
        );
      })}
    </div>
  );
}
