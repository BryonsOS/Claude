import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

const BG = 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';

export default function OnboardingScreen() {
  const { completeOnboarding, joinFamily } = useApp();
  const [mode, setMode] = useState(null);

  if (mode === 'join')   return <JoinFlow onBack={() => setMode(null)} onJoin={joinFamily} />;
  if (mode === 'create') return <CreateFlow onBack={() => setMode(null)} onCreate={completeOnboarding} />;
  return <WelcomeScreen onCreate={() => setMode('create')} onJoin={() => setMode('join')} />;
}

function WelcomeScreen({ onCreate, onJoin }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: BG }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 12px 40px rgba(99,102,241,0.6)',
          }}>🏠</div>
          <h1 style={{ color: '#ffffff', fontSize: 36, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>ChoreFamily</h1>
          <p style={{ color: '#a5b4fc', fontSize: 15, fontWeight: 600, margin: 0 }}>Build habits. Earn rewards. Together.</p>
        </div>

        {/* Feature list */}
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '20px 20px', marginBottom: 20 }}>
          {[
            { emoji: '✅', title: 'Assign & track chores', desc: 'Parents assign, kids complete, parents approve.' },
            { emoji: '✨', title: 'Habit points', desc: 'Every approved chore earns points that stack up.' },
            { emoji: '🎁', title: 'Real rewards', desc: 'Kids spend points on rewards you decide.' },
            { emoji: '📱', title: 'Synced everywhere', desc: 'All phones update together in real time.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 20, marginTop: 1 }}>{f.emoji}</span>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{f.title}</p>
                <p style={{ color: '#a5b4fc', fontSize: 12, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button onClick={onCreate} style={{
          width: '100%', padding: '18px 0', borderRadius: 20, fontWeight: 900,
          fontSize: 17, border: 'none', cursor: 'pointer', marginBottom: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
        }}>
          Set Up My Family →
        </button>
        <button onClick={onJoin} style={{
          width: '100%', padding: '16px 0', borderRadius: 20, fontWeight: 700,
          fontSize: 15, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
          background: 'rgba(255,255,255,0.1)', color: '#ffffff',
        }}>
          Join an Existing Family
        </button>
      </div>
    </div>
  );
}

function CreateFlow({ onBack, onCreate }) {
  const [step, setStep]       = useState(0);
  const [parents, setParents] = useState([{ id: `p${Date.now()}`, name: '', emoji: '👩', role: 'parent' }]);
  const [kids,    setKids]    = useState([{ id: `k${Date.now()}`, name: '', emoji: '👧', role: 'child' }]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const canNext0 = parents.some(p => p.name.trim());
  const canNext1 = kids.some(k => k.name.trim());

  const handleFinish = async () => {
    setLoading(true); setError('');
    const allMembers = [
      ...parents.filter(p => p.name.trim()).map((p, i) => ({ ...p, name: p.name.trim(), ...PRESET_COLORS[i % PRESET_COLORS.length] })),
      ...kids.filter(k => k.name.trim()).map((k, i) => ({ ...k, name: k.name.trim(), ...PRESET_COLORS[(parents.length + i) % PRESET_COLORS.length] })),
    ];
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000));
      await Promise.race([onCreate(allMembers), timeout]);
    } catch (err) {
      setError(err.message === 'timeout'
        ? 'Connection timed out. Make sure the Supabase secrets are added in GitHub and the site was redeployed.'
        : `Setup failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: BG }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              height: 8, borderRadius: 4,
              width: step === i ? 32 : 8,
              background: step >= i ? 'white' : 'rgba(255,255,255,0.25)',
              transition: 'width 0.3s, background 0.3s',
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#221a3d', borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          {step === 0 && (
            <>
              <h2 style={{ color: '#f0f6fc', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Add parents</h2>
              <p style={{ color: '#9e98bd', fontSize: 14, margin: '0 0 20px' }}>Who manages the family?</p>
              <MemberList members={parents} setMembers={setParents} emojiOptions={PARENT_EMOJIS} />
              <AddBtn onClick={() => setParents(p => [...p, { id: `p${Date.now()}`, name: '', emoji: '👨', role: 'parent' }])} label="Add another parent" />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onBack} style={{ padding: '12px 16px', borderRadius: 16, color: '#9e98bd', fontWeight: 700, fontSize: 14, background: 'transparent', border: 'none', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(1)} disabled={!canNext0} style={{ flex: 1, padding: '16px 0', borderRadius: 20, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: canNext0 ? 'pointer' : 'default', opacity: canNext0 ? 1 : 0.4, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>Next →</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ color: '#f0f6fc', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Add kids</h2>
              <p style={{ color: '#9e98bd', fontSize: 14, margin: '0 0 20px' }}>Who will be doing chores?</p>
              <MemberList members={kids} setMembers={setKids} emojiOptions={KID_EMOJIS} />
              <AddBtn onClick={() => setKids(k => [...k, { id: `k${Date.now()}`, name: '', emoji: '👦', role: 'child' }])} label="Add another kid" />
              {error && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 14 }}>
                  <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setStep(0)} disabled={loading} style={{ padding: '12px 16px', borderRadius: 16, color: '#9e98bd', fontWeight: 700, fontSize: 14, background: 'transparent', border: 'none', cursor: 'pointer' }}>Back</button>
                <button onClick={handleFinish} disabled={!canNext1 || loading} style={{ flex: 1, padding: '16px 0', borderRadius: 20, fontWeight: 900, color: 'white', fontSize: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: canNext1 && !loading ? 'pointer' : 'default', opacity: canNext1 && !loading ? 1 : 0.4, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                  {loading ? '⏳ Saving…' : "Let's Go! 🚀"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JoinFlow({ onBack, onJoin }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const formatted = code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{4})(.+)/, '$1-$2');

  const handleJoin = async () => {
    const clean = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length !== 8) { setError('Enter the full 8-character code (e.g. ABCD-1234)'); return; }
    setLoading(true); setError('');
    try {
      await onJoin(`${clean.slice(0, 4)}-${clean.slice(4)}`);
    } catch {
      setError('Code not found. Check with your parent for the correct code.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: BG }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ background: '#221a3d', borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: '#f0f6fc', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Join a Family</h2>
          <p style={{ color: '#9e98bd', fontSize: 14, margin: '0 0 20px' }}>
            Ask a parent for your code — use the <span style={{ color: '#f0f6fc', fontWeight: 700 }}>Parent Code</span> for full access or the{' '}
            <span style={{ color: '#f0f6fc', fontWeight: 700 }}>Kid Code</span> for a kids-only device.
          </p>

          <input
            type="text"
            value={formatted}
            onChange={e => setCode(e.target.value.replace(/[^A-Z0-9-]/gi, '').slice(0, 9))}
            placeholder="ABCD-1234"
            maxLength={9}
            autoFocus
            autoCapitalize="characters"
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16,
              fontSize: 28, fontWeight: 900, textAlign: 'center', letterSpacing: '0.15em',
              background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.15)',
              color: '#f0f6fc', outline: 'none', boxSizing: 'border-box',
              textTransform: 'uppercase',
            }}
          />

          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: 600 }}>{error}</p>}

          <button onClick={handleJoin} disabled={loading} style={{
            width: '100%', marginTop: 16, padding: '16px 0', borderRadius: 20,
            fontWeight: 900, color: 'white', fontSize: 16, border: 'none',
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>
            {loading ? 'Joining…' : 'Join Family →'}
          </button>

          <button onClick={onBack} style={{
            width: '100%', marginTop: 10, padding: '12px 0',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#9e98bd', fontSize: 14, fontWeight: 700,
          }}>← Back</button>
        </div>
      </div>
    </div>
  );
}

function MemberList({ members, setMembers, emojiOptions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {members.map((m, i) => (
        <MemberRow
          key={m.id}
          member={m}
          emojiOptions={emojiOptions}
          onChange={u => setMembers(prev => prev.map((x, j) => j === i ? { ...x, ...u } : x))}
          onRemove={members.length > 1 ? () => setMembers(prev => prev.filter((_, j) => j !== i)) : null}
        />
      ))}
    </div>
  );
}

function MemberRow({ member, emojiOptions, onChange, onRemove }) {
  const [showEmojis, setShowEmojis] = useState(false);
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setShowEmojis(v => !v)} style={{
          width: 48, height: 48, borderRadius: 14, fontSize: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', flexShrink: 0,
        }}>
          {member.emoji}
        </button>
        <input
          type="text"
          value={member.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Name"
          maxLength={20}
          style={{
            flex: 1, padding: '12px 14px', borderRadius: 14, fontSize: 15, fontWeight: 700,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f0f6fc', outline: 'none',
          }}
        />
        {onRemove && (
          <button onClick={onRemove} style={{ color: '#9e98bd', fontSize: 16, padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        )}
      </div>
      {showEmojis && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {emojiOptions.map(e => (
            <button key={e} onClick={() => { onChange({ emoji: e }); setShowEmojis(false); }} style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: member.emoji === e ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
              border: member.emoji === e ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}>{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      marginTop: 10, width: '100%', padding: '12px 0', borderRadius: 16,
      border: '2px dashed rgba(255,255,255,0.2)', background: 'transparent',
      color: '#9e98bd', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    }}>
      + {label}
    </button>
  );
}
