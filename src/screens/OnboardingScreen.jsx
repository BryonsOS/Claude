import { useState } from 'react';
import { useApp, PRESET_COLORS } from '../context/AppContext';

const PARENT_EMOJIS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','👵','👴','🧑','🧔'];
const KID_EMOJIS    = ['👧','👦','🧒','👧🏽','👦🏽','🧒🏽','👧🏿','👦🏿','🧒🏿','👶'];

const STEPS = ['welcome', 'parents', 'kids', 'done'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStepRaw] = useState(0);
  const [parents, setParents] = useState([{ id: `p${Date.now()}`, name: '', emoji: '👩', role: 'parent' }]);
  const [kids, setKids] = useState([{ id: `k${Date.now()}`, name: '', emoji: '👧', role: 'child' }]);

  const setStep = (n) => setStepRaw(Math.max(0, Math.min(STEPS.length - 1, n)));

  const handleFinish = () => {
    const allMembers = [
      ...parents.filter(p => p.name.trim()).map((p, i) => ({ ...p, name: p.name.trim(), ...PRESET_COLORS[i % PRESET_COLORS.length] })),
      ...kids.filter(k => k.name.trim()).map((k, i) => ({ ...k, name: k.name.trim(), ...PRESET_COLORS[(parents.length + i) % PRESET_COLORS.length] })),
    ];
    completeOnboarding(allMembers);
  };

  const canAdvanceParents = parents.some(p => p.name.trim());
  const canAdvanceKids = kids.some(k => k.name.trim());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Progress dots */}
        {step > 0 && step < 3 && (
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-8 bg-white' : 'w-2 bg-white bg-opacity-40'}`} />
            ))}
          </div>
        )}

        {/* Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-7xl mb-4">🏠</div>
            <h1 className="text-4xl font-bold text-white mb-2">ChoreFamily</h1>
            <p className="text-indigo-200 mb-8">Build habits. Earn rewards. Together.</p>
            <div className="bg-white rounded-3xl p-6 text-left space-y-3 mb-6">
              <Feature emoji="✅" title="Assign chores" desc="Parents assign, kids complete, parents approve." />
              <Feature emoji="✨" title="Habit points" desc="Every approved chore earns points." />
              <Feature emoji="🎁" title="Real rewards" desc="Kids spend points on rewards you set." />
              <Feature emoji="📢" title="Everyone sees everything" desc="No asking — the whole family stays in sync." />
            </div>
            <button onClick={() => setStep(1)}
              className="w-full py-4 rounded-2xl font-bold text-indigo-700 bg-white text-lg">
              Set Up My Family →
            </button>
          </div>
        )}

        {/* Parents */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Add parents</h2>
            <p className="text-sm text-gray-500 mb-5">Who manages the family?</p>
            <div className="space-y-3">
              {parents.map((p, i) => (
                <MemberRow
                  key={p.id}
                  member={p}
                  emojiOptions={PARENT_EMOJIS}
                  onChange={updated => setParents(prev => prev.map((x, j) => j === i ? { ...x, ...updated } : x))}
                  onRemove={parents.length > 1 ? () => setParents(prev => prev.filter((_, j) => j !== i)) : null}
                />
              ))}
            </div>
            <button
              onClick={() => setParents(prev => [...prev, { id: `p${Date.now()}`, name: '', emoji: '👨', role: 'parent' }])}
              className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-medium"
            >
              + Add another parent
            </button>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl text-gray-400 text-sm">Back</button>
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvanceParents}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Kids */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Add kids</h2>
            <p className="text-sm text-gray-500 mb-5">Who will be doing chores?</p>
            <div className="space-y-3">
              {kids.map((k, i) => (
                <MemberRow
                  key={k.id}
                  member={k}
                  emojiOptions={KID_EMOJIS}
                  onChange={updated => setKids(prev => prev.map((x, j) => j === i ? { ...x, ...updated } : x))}
                  onRemove={kids.length > 1 ? () => setKids(prev => prev.filter((_, j) => j !== i)) : null}
                />
              ))}
            </div>
            <button
              onClick={() => setKids(prev => [...prev, { id: `k${Date.now()}`, name: '', emoji: '👦', role: 'child' }])}
              className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-medium"
            >
              + Add another kid
            </button>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl text-gray-400 text-sm">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!canAdvanceKids}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-500 disabled:opacity-40"
              >
                Finish →
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
            <p className="text-indigo-200 mb-6">
              {[...parents, ...kids].filter(m => m.name.trim()).map(m => m.name.trim()).join(', ')} are ready to go.
            </p>
            <div className="bg-white rounded-2xl p-4 mb-6 text-left space-y-2">
              <p className="text-sm text-gray-600">✅ We've added 5 starter rewards for your kids to work toward.</p>
              <p className="text-sm text-gray-600">➕ Parents can assign the first chores from the Chores tab.</p>
              <p className="text-sm text-gray-600">👨‍👩‍👧 Add or edit family members anytime in the Family tab.</p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl font-bold text-indigo-700 bg-white text-lg"
            >
              Open ChoreFamily 🏠
            </button>
          </div>
        )}
      </div>
    </div>
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

function MemberRow({ member, emojiOptions, onChange, onRemove }) {
  const [showEmojis, setShowEmojis] = useState(false);
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEmojis(v => !v)}
          className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
        >
          {member.emoji}
        </button>
        <input
          type="text"
          value={member.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Name"
          maxLength={20}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400"
        />
        {onRemove && (
          <button onClick={onRemove} className="text-gray-300 hover:text-red-400 text-lg px-1">✕</button>
        )}
      </div>
      {showEmojis && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {emojiOptions.map(e => (
            <button
              key={e}
              onClick={() => { onChange({ emoji: e }); setShowEmojis(false); }}
              className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center ${member.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-white'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
