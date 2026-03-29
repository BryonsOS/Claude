import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

export default function OnboardingScreen() {
  const { completeOnboarding, joinFamily } = useApp();
  const [mode, setMode] = useState(null);

  if (mode === 'join')   return <JoinFlow onBack={() => setMode(null)} onJoin={joinFamily} />;
  if (mode === 'create') return <CreateFlow onBack={() => setMode(null)} onCreate={completeOnboarding} />;

  return <WelcomeScreen onCreate={() => setMode('create')} onJoin={() => setMode('join')} />;
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

function WelcomeScreen({ onCreate, onJoin }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 12px 40px rgba(99,102,241,0.6)',
            }}
          >
            🏠
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">ChoreFamily</h1>
          <p className="text-indigo-300 mt-2 font-medium">Build habits. Earn rewards. Together.</p>
        </div>

        {/* Feature tiles */}
        <div
          className="rounded-3xl p-5 mb-5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <Feature emoji="✅" title="Assign & track chores" desc="Parents assign, kids complete, parents approve." />
          <Feature emoji="✨" title="Habit points" desc="Every approved chore earns points that stack up." />
          <Feature emoji="🎁" title="Real rewards" desc="Kids spend points on rewards you decide." />
          <Feature emoji="📱" title="Synced everywhere" desc="All phones update together in real time." />
        </div>

        {/* Buttons */}
        <button
          onClick={onCreate}
          className="w-full py-4 rounded-2xl font-black text-indigo-700 bg-white text-lg mb-3 active:scale-95 transition-transform shadow-2xl"
          style={{ boxShadow: '0 8px 30px rgba(255,255,255,0.2)' }}
        >
          Set Up My Family →
        </button>
        <button
          onClick={onJoin}
          className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          Join an Existing Family
        </button>
      </div>
    </div>
  );
}

// ─── Create flow ──────────────────────────────────────────────────────────────

function CreateFlow({ onBack, onCreate }) {
  const [step, setStep]       = useState(0);
  const [parents, setParents] = useState([{ id: `p${Date.now()}`, name: '', emoji: '👩', role: 'parent' }]);
  const [kids,    setKids]    = useState([{ id: `k${Date.now()}`, name: '', emoji: '👧', role: 'child' }]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const canNext0 = parents.some(p => p.name.trim());
  const canNext1 = kids.some(k => k.name.trim());

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    const allMembers = [
      ...parents.filter(p => p.name.trim()).map((p, i) => ({ ...p, name: p.name.trim(), ...PRESET_COLORS[i % PRESET_COLORS.length] })),
      ...kids.filter(k => k.name.trim()).map((k, i) => ({ ...k, name: k.name.trim(), ...PRESET_COLORS[(parents.length + i) % PRESET_COLORS.length] })),
    ];
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000));
      await Promise.race([onCreate(allMembers), timeout]);
    } catch (err) {
      setError(
        err.message === 'timeout'
          ? 'Connection timed out. Make sure the Firebase secrets are added in GitHub and the site was redeployed.'
          : `Setup failed: ${err.message}`
      );
      setLoading(false);
    }
  };

  const bg = 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: bg }}>
      <div className="w-full max-w-sm">
        {/* Steps */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1].map(i => (
            <div
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: step === i ? '2rem' : '0.5rem',
                background: step >= i ? 'white' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-black text-gray-900 mb-1">Add parents</h2>
            <p className="text-sm text-gray-500 mb-5">Who manages the family?</p>
            <MemberList members={parents} setMembers={setParents} emojiOptions={PARENT_EMOJIS} />
            <AddBtn onClick={() => setParents(p => [...p, { id: `p${Date.now()}`, name: '', emoji: '👨', role: 'parent' }])} label="Add another parent" />
            <div className="flex gap-3 mt-5">
              <button onClick={onBack} className="px-5 py-3 rounded-xl text-gray-400 text-sm font-bold">Back</button>
              <button
                onClick={() => setStep(1)}
                disabled={!canNext0}
                className="flex-1 py-4 rounded-2xl font-black text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-black text-gray-900 mb-1">Add kids</h2>
            <p className="text-sm text-gray-500 mb-5">Who will be doing chores?</p>
            <MemberList members={kids} setMembers={setKids} emojiOptions={KID_EMOJIS} />
            <AddBtn onClick={() => setKids(k => [...k, { id: `k${Date.now()}`, name: '', emoji: '👦', role: 'child' }])} label="Add another kid" />
            {error && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(0)} disabled={loading} className="px-5 py-3 rounded-xl text-gray-400 text-sm font-bold">Back</button>
              <button
                onClick={handleFinish}
                disabled={!canNext1 || loading}
                className="flex-1 py-4 rounded-2xl font-black text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
              >
                {loading ? '⏳ Saving…' : 'Let\'s Go! 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Join flow ────────────────────────────────────────────────────────────────

function JoinFlow({ onBack, onJoin }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const formatted = code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{4})(.+)/, '$1-$2');

  const handleJoin = async () => {
    const clean = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length !== 8) { setError('Enter the full 8-character code (e.g. ABCD-1234)'); return; }
    setLoading(true);
    setError('');
    try {
      await onJoin(`${clean.slice(0, 4)}-${clean.slice(4)}`);
    } catch {
      setError('Code not found. Check with your parent for the correct code.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-1">Join a Family</h2>
          <p className="text-sm text-gray-500 mb-5">
            Ask a parent for your code — use the <strong>Parent Code</strong> for full access or the{' '}
            <strong>Kid Code</strong> for a kids-only device.
          </p>

          <input
            type="text"
            value={formatted}
            onChange={e => setCode(e.target.value.replace(/[^A-Z0-9-]/gi, '').slice(0, 9))}
            placeholder="ABCD-1234"
            maxLength={9}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-2xl font-black text-center tracking-widest focus:outline-none focus:border-indigo-400 uppercase"
            autoFocus
            autoCapitalize="characters"
          />

          {error && <p className="text-red-500 text-sm mt-2 text-center font-medium">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full mt-4 py-4 rounded-2xl font-black text-white text-base disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
          >
            {loading ? 'Joining…' : 'Join Family →'}
          </button>
          <button onClick={onBack} className="w-full mt-3 py-3 text-gray-400 text-sm font-bold">
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function MemberList({ members, setMembers, emojiOptions }) {
  return (
    <div className="space-y-3">
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
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEmojis(v => !v)}
          className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0 active:scale-95 transition-transform"
        >
          {member.emoji}
        </button>
        <input
          type="text"
          value={member.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Name"
          maxLength={20}
          className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-3 py-3 text-base font-bold focus:outline-none focus:border-indigo-400"
        />
        {onRemove && (
          <button onClick={onRemove} className="text-gray-300 hover:text-red-400 text-lg px-1 py-2">✕</button>
        )}
      </div>
      {showEmojis && (
        <div className="mt-2 flex flex-wrap gap-2">
          {emojiOptions.map(e => (
            <button
              key={e}
              onClick={() => { onChange({ emoji: e }); setShowEmojis(false); }}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${member.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'bg-white'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-bold active:scale-95 transition-transform"
    >
      + {label}
    </button>
  );
}

function Feature({ emoji, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl mt-0.5">{emoji}</span>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-xs text-indigo-300 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
