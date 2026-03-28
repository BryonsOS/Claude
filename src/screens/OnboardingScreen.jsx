import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

export default function OnboardingScreen() {
  const { completeOnboarding, joinFamily } = useApp();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'

  if (mode === 'join')   return <JoinFlow onBack={() => setMode(null)} onJoin={joinFamily} />;
  if (mode === 'create') return <CreateFlow onBack={() => setMode(null)} onCreate={completeOnboarding} />;

  return <WelcomeScreen onCreate={() => setMode('create')} onJoin={() => setMode('join')} />;
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

function WelcomeScreen({ onCreate, onJoin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🏠</div>
          <h1 className="text-4xl font-bold text-white mb-2">ChoreFamily</h1>
          <p className="text-indigo-200">Build habits. Earn rewards. Together.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-4 space-y-3">
          <Feature emoji="✅" title="Assign chores" desc="Parents assign, kids complete, parents approve." />
          <Feature emoji="✨" title="Habit points" desc="Every approved chore earns points." />
          <Feature emoji="🎁" title="Real rewards" desc="Kids spend points on rewards you set." />
          <Feature emoji="📱" title="Everyone in sync" desc="All devices update in real time." />
        </div>

        <button onClick={onCreate}
          className="w-full py-4 rounded-2xl font-bold text-indigo-700 bg-white text-lg mb-3">
          Set Up My Family →
        </button>
        <button onClick={onJoin}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          Join an Existing Family
        </button>
      </div>
    </div>
  );
}

// ─── Create flow ──────────────────────────────────────────────────────────────

function CreateFlow({ onBack, onCreate }) {
  const [step, setStep]       = useState(0); // 0=parents, 1=kids, 2=done
  const [parents, setParents] = useState([{ id: `p${Date.now()}`, name: '', emoji: '👩', role: 'parent' }]);
  const [kids,    setKids]    = useState([{ id: `k${Date.now()}`, name: '', emoji: '👧', role: 'child' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      );
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-8 bg-white' : step > i ? 'w-2 bg-white' : 'w-2 bg-white bg-opacity-30'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Add parents</h2>
            <p className="text-sm text-gray-500 mb-5">Who manages the family?</p>
            <MemberList members={parents} setMembers={setParents} emojiOptions={PARENT_EMOJIS} />
            <AddBtn onClick={() => setParents(p => [...p, { id: `p${Date.now()}`, name: '', emoji: '👨', role: 'parent' }])} label="Add another parent" />
            <div className="flex gap-3 mt-5">
              <button onClick={onBack} className="px-5 py-3 rounded-xl text-gray-400 text-sm">Back</button>
              <button onClick={() => setStep(1)} disabled={!canNext0}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40 text-base">
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Add kids</h2>
            <p className="text-sm text-gray-500 mb-5">Who will be doing chores?</p>
            <MemberList members={kids} setMembers={setKids} emojiOptions={KID_EMOJIS} />
            <AddBtn onClick={() => setKids(k => [...k, { id: `k${Date.now()}`, name: '', emoji: '👦', role: 'child' }])} label="Add another kid" />
            {error && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(0)} disabled={loading}
                className="px-5 py-3 rounded-xl text-gray-400 text-sm">Back</button>
              <button onClick={handleFinish} disabled={!canNext1 || loading}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40 text-base">
                {loading ? '⏳ Saving…' : 'Finish ✓'}
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
      setError('Family code not found. Double-check and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Join a Family</h2>
          <p className="text-sm text-gray-500 mb-5">
            Ask a parent for your family code — it's shown in the Family tab.
          </p>

          <input
            type="text"
            value={formatted}
            onChange={e => setCode(e.target.value.replace(/[^A-Z0-9-]/gi, '').slice(0, 9))}
            placeholder="ABCD-1234"
            maxLength={9}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-2xl font-bold text-center tracking-widest focus:outline-none focus:border-indigo-400 uppercase"
            autoFocus
            autoCapitalize="characters"
          />

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

          <button onClick={handleJoin} disabled={loading}
            className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40 text-base">
            {loading ? 'Joining…' : 'Join Family →'}
          </button>
          <button onClick={onBack} className="w-full mt-3 py-3 text-gray-400 text-sm">
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
        <button onClick={() => setShowEmojis(v => !v)}
          className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
          {member.emoji}
        </button>
        <input
          type="text"
          value={member.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Name"
          maxLength={20}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-indigo-400"
        />
        {onRemove && (
          <button onClick={onRemove} className="text-gray-300 hover:text-red-400 text-lg px-1 py-2">✕</button>
        )}
      </div>
      {showEmojis && (
        <div className="mt-2 flex flex-wrap gap-2">
          {emojiOptions.map(e => (
            <button key={e} onClick={() => { onChange({ emoji: e }); setShowEmojis(false); }}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${member.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-white'}`}>
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
    <button onClick={onClick}
      className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-medium">
      + {label}
    </button>
  );
}

function Feature({ emoji, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl mt-0.5">{emoji}</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
