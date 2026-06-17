import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext(null);
const CODE_KEY   = 'chorefamily_code';
const ACCESS_KEY = 'chorefamily_access';

export const PRESET_COLORS = [
  { color: '#6366f1', bg: '#eef2ff' },
  { color: '#ec4899', bg: '#fdf2f8' },
  { color: '#10b981', bg: '#ecfdf5' },
  { color: '#f59e0b', bg: '#fffbeb' },
  { color: '#f97316', bg: '#fff7ed' },
  { color: '#8b5cf6', bg: '#f5f3ff' },
  { color: '#06b6d4', bg: '#ecfeff' },
  { color: '#ef4444', bg: '#fef2f2' },
];

const STARTER_REWARDS = [
  { title: '$5 Cash Out',  pointCost: 500,  emoji: '💵', description: 'Cash out $5.00 of your earnings.',             bonus: 0    },
  { title: '$10 Cash Out', pointCost: 1000, emoji: '💵', description: 'Cash out $10.00 of your earnings.',            bonus: 0    },
  { title: '$25 Cash Out', pointCost: 2500, emoji: '💰', description: 'Save up and cash out $25 — nice work!',        bonus: 200  },
  { title: '$50 Cash Out', pointCost: 5000, emoji: '💰', description: 'Save big — cash out $50 plus a $5 bonus!',     bonus: 500  },
  { title: '$100 Jackpot', pointCost: 10000,emoji: '🏆', description: 'Super saver! Cash out $100 plus a $15 bonus!', bonus: 1500 },
];

function generateFamilyCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const D = '23456789';
  const r = (s) => s[Math.floor(Math.random() * s.length)];
  return `${r(L)}${r(L)}${r(L)}${r(L)}-${r(D)}${r(D)}${r(D)}${r(D)}`;
}

function rowToState(row) {
  return {
    members:      row.members       || [],
    chores:       row.chores        || [],
    rewards:      row.rewards       || [],
    rewardClaims: row.reward_claims || [],
    activityFeed: row.activity_feed || [],
    kidCode:      row.kid_code      || null,
  };
}

export function AppProvider({ children }) {
  const savedCode   = localStorage.getItem(CODE_KEY);
  const savedAccess = localStorage.getItem(ACCESS_KEY) || 'full';

  const [familyCode,    setFamilyCode]    = useState(savedCode);
  const [accessLevel,   setAccessLevel]   = useState(savedAccess);
  const familyCodeRef = useRef(savedCode);

  const [isLoading,     setIsLoading]     = useState(!!savedCode);
  const [isSetup,       setIsSetup]       = useState(false);
  const [members,       setMembers]       = useState([]);
  const [chores,        setChores]        = useState([]);
  const [rewards,       setRewards]       = useState([]);
  const [rewardClaims,  setRewardClaims]  = useState([]);
  const [activityFeed,  setActivityFeed]  = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [syncError,     setSyncError]     = useState(null);
  const [toast,         setToast]         = useState(null);
  const [kidCode,       setKidCode]       = useState(null);

  const currentUser   = members.find(m => m.id === currentUserId) || null;
  const prevChoresRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) { prevChoresRef.current = chores; return; }
    if (prevChoresRef.current === null) { prevChoresRef.current = chores; return; }

    const fire = (title, body) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
    };

    const usd = c => '$' + (c / 100).toFixed(2);

    if (currentUser.role === 'parent') {
      chores.forEach(chore => {
        const prev = prevChoresRef.current.find(c => c.id === chore.id);
        if (prev && prev.status !== 'completed' && chore.status === 'completed') {
          const kid = members.find(m => m.id === chore.assignedTo);
          fire('✅ Chore Needs Approval', `${kid?.name || 'Someone'} finished "${chore.title}"`);
        }
      });
    } else if (currentUser.role === 'child') {
      chores.forEach(chore => {
        const existed = prevChoresRef.current.find(c => c.id === chore.id);
        if (!existed && chore.status === 'pending') {
          if (chore.assignedTo === currentUserId) {
            fire('📋 New Chore!', `You've got a new task: "${chore.title}" — ${usd(chore.points)}`);
          } else if (!chore.assignedTo) {
            fire('🌟 Chore Available!', `"${chore.title}" is up for grabs — ${usd(chore.points)} to whoever finishes first!`);
          }
        }
      });
      chores.forEach(chore => {
        const prev = prevChoresRef.current.find(c => c.id === chore.id);
        if (prev && prev.status === 'completed' && chore.status === 'pending' && chore.assignedTo === currentUserId && chore.rejectionReason) {
          fire('🔁 Redo Required', `"${chore.title}" was sent back — check the note!`);
        }
      });
    }

    prevChoresRef.current = chores;
  }, [chores]);

  const syncToSupabase = useCallback(async (updates) => {
    const code = familyCodeRef.current;
    if (!code) return;
    const payload = {};
    if ('members'      in updates) payload.members       = updates.members;
    if ('chores'       in updates) payload.chores        = updates.chores;
    if ('rewards'      in updates) payload.rewards       = updates.rewards;
    if ('rewardClaims' in updates) payload.reward_claims = updates.rewardClaims;
    if ('activityFeed' in updates) payload.activity_feed = updates.activityFeed;
    if ('kidCode'      in updates) payload.kid_code      = updates.kidCode;
    try {
      const { error } = await supabase.from('families').update(payload).eq('id', code);
      if (error) throw error;
      setSyncError(null);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncError('Changes may not have saved. Check your connection.');
    }
  }, []);

  useEffect(() => {
    if (!familyCode) { setIsLoading(false); return; }
    familyCodeRef.current = familyCode;

    supabase.from('families').select('*').eq('id', familyCode).single()
      .then(({ data, error }) => {
        if (error || !data) {
          localStorage.removeItem(CODE_KEY);
          localStorage.removeItem(ACCESS_KEY);
          setFamilyCode(null);
          familyCodeRef.current = null;
          setIsSetup(false);
        } else {
          const s = rowToState(data);
          setMembers(s.members);
          setChores(s.chores);
          setRewards(s.rewards);
          setRewardClaims(s.rewardClaims);
          setActivityFeed(s.activityFeed);
          setKidCode(s.kidCode);
          setIsSetup(true);
        }
        setIsLoading(false);
      });

    const channel = supabase
      .channel(`family-${familyCode}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'families',
        filter: `id=eq.${familyCode}`,
      }, (payload) => {
        const s = rowToState(payload.new);
        setMembers(s.members);
        setChores(s.chores);
        setRewards(s.rewards);
        setRewardClaims(s.rewardClaims);
        setActivityFeed(s.activityFeed);
        setKidCode(s.kidCode);
        setIsSetup(true);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setSyncError('Could not connect. Check your internet connection.');
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [familyCode]);

  const completeOnboarding = useCallback(async (newMembers) => {
    const parentCode = generateFamilyCode();
    const kCode      = generateFamilyCode();

    const coloredMembers = newMembers.map((m, i) => ({
      ...m,
      points: 0,
      ...PRESET_COLORS[i % PRESET_COLORS.length],
    }));
    const parentId = coloredMembers.find(m => m.role === 'parent')?.id;
    const starterRewards = STARTER_REWARDS.map((r, i) => ({
      ...r, id: `r${Date.now() + i}`, createdBy: parentId || 'system',
    }));

    const familyRow = {
      id:            parentCode,
      members:       coloredMembers,
      chores:        [],
      rewards:       starterRewards,
      reward_claims: [],
      activity_feed: [],
      kid_code:      kCode,
    };

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('families').insert(familyRow),
      supabase.from('family_codes').insert({ id: kCode, parent_code: parentCode }),
    ]);
    if (e1 || e2) throw e1 || e2;

    localStorage.setItem(CODE_KEY, parentCode);
    localStorage.setItem(ACCESS_KEY, 'full');
    familyCodeRef.current = parentCode;
    setAccessLevel('full');
    setFamilyCode(parentCode);
  }, []);

  const joinFamily = useCallback(async (code) => {
    const clean     = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = `${clean.slice(0, 4)}-${clean.slice(4)}`;

    const { data: familyRow } = await supabase
      .from('families').select('id').eq('id', formatted).single();
    if (familyRow) {
      localStorage.setItem(CODE_KEY, formatted);
      localStorage.setItem(ACCESS_KEY, 'full');
      familyCodeRef.current = formatted;
      setAccessLevel('full');
      setFamilyCode(formatted);
      return;
    }

    const { data: codeRow } = await supabase
      .from('family_codes').select('parent_code').eq('id', formatted).single();
    if (codeRow) {
      const { parent_code } = codeRow;
      localStorage.setItem(CODE_KEY, parent_code);
      localStorage.setItem(ACCESS_KEY, 'kids-only');
      familyCodeRef.current = parent_code;
      setAccessLevel('kids-only');
      setFamilyCode(parent_code);
      return;
    }

    throw new Error('Family code not found');
  }, []);

  const resetApp = useCallback(() => {
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(ACCESS_KEY);
    familyCodeRef.current = null;
    setFamilyCode(null);
    setAccessLevel('full');
    setIsSetup(false);
    setMembers([]);
    setChores([]);
    setRewards([]);
    setRewardClaims([]);
    setActivityFeed([]);
    setCurrentUserId(null);
    setKidCode(null);
  }, []);

  const addMember = useCallback((memberData) => {
    const newMember = {
      id: `m${Date.now()}`,
      points: 0,
      ...PRESET_COLORS[members.length % PRESET_COLORS.length],
      ...memberData,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    syncToSupabase({ members: updated });
    return newMember;
  }, [members, syncToSupabase]);

  const updateMember = useCallback((id, updates) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    setMembers(updated);
    syncToSupabase({ members: updated });
  }, [members, syncToSupabase]);

  const removeMember = useCallback((id) => {
    const updatedMembers = members.filter(m => m.id !== id);
    const updatedChores  = chores.filter(c => c.assignedTo !== id);
    setMembers(updatedMembers);
    setChores(updatedChores);
    syncToSupabase({ members: updatedMembers, chores: updatedChores });
  }, [members, chores, syncToSupabase]);

  const mkActivity = (type, extra = {}) => ({
    id: `a${Date.now()}`,
    ts: new Date().toISOString(),
    memberId: currentUserId,
    type,
    ...extra,
  });

  const newFeed = (item, feed) => [item, ...feed].slice(0, 60);

  const completeChore = useCallback((choreId) => {
    const now = new Date().toISOString();
    const updatedChores = chores.map(c =>
      c.id === choreId ? { ...c, status: 'completed', completedAt: now } : c
    );
    const updatedFeed = newFeed(mkActivity('chore_completed', { choreId }), activityFeed);
    setChores(updatedChores);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, activityFeed: updatedFeed });
    showToast('✅ Marked as done!');
  }, [chores, activityFeed, currentUserId, syncToSupabase, showToast]);

  const claimOpenChore = useCallback((choreId) => {
    const now = new Date().toISOString();
    const updatedChores = chores.map(c =>
      c.id === choreId
        ? { ...c, assignedTo: currentUserId, status: 'completed', completedAt: now }
        : c
    );
    const updatedFeed = newFeed(mkActivity('chore_completed', { choreId }), activityFeed);
    setChores(updatedChores);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, activityFeed: updatedFeed });
    showToast('✅ Chore claimed & done!');
  }, [chores, activityFeed, currentUserId, syncToSupabase, showToast]);

  const approveChore = useCallback((choreId) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;
    const updatedChores = chores.map(c =>
      c.id === choreId
        ? { ...c, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: currentUserId }
        : c
    );
    const updatedMembers = members.map(m =>
      m.id === chore.assignedTo ? { ...m, points: m.points + chore.points } : m
    );
    const updatedFeed = newFeed(
      mkActivity('chore_approved', { choreId, targetId: chore.assignedTo }), activityFeed
    );
    setChores(updatedChores);
    setMembers(updatedMembers);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, members: updatedMembers, activityFeed: updatedFeed });
    showToast(`🌟 Approved! +$${(chore.points / 100).toFixed(2)} added`);
  }, [chores, members, activityFeed, currentUserId, syncToSupabase, showToast]);

  const rejectChore = useCallback((choreId, reason) => {
    const updatedChores = chores.map(c =>
      c.id === choreId
        ? { ...c, status: 'pending', completedAt: null, rejectionReason: reason || '' }
        : c
    );
    const updatedFeed = newFeed(mkActivity('chore_rejected', { choreId }), activityFeed);
    setChores(updatedChores);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, activityFeed: updatedFeed });
    showToast('↩️ Sent back for a redo');
  }, [chores, activityFeed, currentUserId, syncToSupabase, showToast]);

  const resetChore = useCallback((choreId) => {
    const updated = chores.map(c =>
      c.id === choreId
        ? { ...c, status: 'pending', completedAt: null, approvedAt: null, approvedBy: null, rejectionReason: '' }
        : c
    );
    setChores(updated);
    syncToSupabase({ chores: updated });
    showToast('↩️ Reset to To Do');
  }, [chores, syncToSupabase, showToast]);

  const addChore = useCallback((choreData) => {
    const newChore = {
      id: `ch${Date.now()}`,
      assignedBy: currentUserId,
      status: 'pending',
      completedAt: null,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: '',
      ...choreData,
    };
    const updatedChores = [newChore, ...chores];
    const updatedFeed = newFeed(
      mkActivity('chore_created', { choreId: newChore.id, targetId: newChore.assignedTo }), activityFeed
    );
    setChores(updatedChores);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, activityFeed: updatedFeed });
    return newChore;
  }, [chores, activityFeed, currentUserId, syncToSupabase]);

  const deleteChore = useCallback((choreId) => {
    const updated = chores.filter(c => c.id !== choreId);
    setChores(updated);
    syncToSupabase({ chores: updated });
  }, [chores, syncToSupabase]);

  const updateChore = useCallback((choreId, changes) => {
    const updated = chores.map(c => c.id === choreId ? { ...c, ...changes } : c);
    setChores(updated);
    syncToSupabase({ chores: updated });
  }, [chores, syncToSupabase]);

  const bulkApproveChores = useCallback((choreIds) => {
    const now = new Date().toISOString();
    let updatedMembers = [...members];
    const feedEntries = [];
    choreIds.forEach((choreId, i) => {
      const chore = chores.find(c => c.id === choreId);
      if (!chore) return;
      updatedMembers = updatedMembers.map(m =>
        m.id === chore.assignedTo ? { ...m, points: m.points + chore.points } : m
      );
      feedEntries.push({
        id: `a${Date.now()}${i}`,
        ts: now,
        memberId: currentUserId,
        type: 'chore_approved',
        choreId,
        targetId: chore.assignedTo,
      });
    });
    const updatedChores = chores.map(c =>
      choreIds.includes(c.id)
        ? { ...c, status: 'approved', approvedAt: now, approvedBy: currentUserId }
        : c
    );
    let updatedFeed = activityFeed;
    feedEntries.forEach(entry => { updatedFeed = newFeed(entry, updatedFeed); });
    setChores(updatedChores);
    setMembers(updatedMembers);
    setActivityFeed(updatedFeed);
    syncToSupabase({ chores: updatedChores, members: updatedMembers, activityFeed: updatedFeed });
    showToast(`🌟 Approved all ${choreIds.length} chores!`);
  }, [chores, members, activityFeed, currentUserId, syncToSupabase, showToast]);

  const claimReward = useCallback((rewardId) => {
    const claim = {
      id: `rc${Date.now()}`,
      rewardId,
      claimedBy: currentUserId,
      claimedAt: new Date().toISOString(),
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
    };
    const updatedClaims = [claim, ...rewardClaims];
    const updatedFeed   = newFeed(mkActivity('reward_claimed', { rewardId }), activityFeed);
    setRewardClaims(updatedClaims);
    setActivityFeed(updatedFeed);
    syncToSupabase({ rewardClaims: updatedClaims, activityFeed: updatedFeed });
    showToast('🎁 Reward claimed! Waiting for payout');
  }, [rewardClaims, activityFeed, currentUserId, syncToSupabase, showToast]);

  const approveRewardClaim = useCallback((claimId) => {
    const claim  = rewardClaims.find(c => c.id === claimId);
    const reward = rewards.find(r => r.id === claim?.rewardId);
    if (!claim || !reward) return;
    const updatedClaims  = rewardClaims.map(c =>
      c.id === claimId
        ? { ...c, status: 'approved', approvedBy: currentUserId, approvedAt: new Date().toISOString() }
        : c
    );
    const updatedMembers = members.map(m =>
      m.id === claim.claimedBy ? { ...m, points: Math.max(0, m.points - reward.pointCost) } : m
    );
    const updatedFeed = newFeed(
      mkActivity('reward_approved', { rewardId: claim.rewardId, targetId: claim.claimedBy }), activityFeed
    );
    setRewardClaims(updatedClaims);
    setMembers(updatedMembers);
    setActivityFeed(updatedFeed);
    syncToSupabase({ rewardClaims: updatedClaims, members: updatedMembers, activityFeed: updatedFeed });
    showToast('🎉 Reward paid out!');
  }, [rewardClaims, rewards, members, activityFeed, currentUserId, syncToSupabase, showToast]);

  const rejectRewardClaim = useCallback((claimId) => {
    const updated = rewardClaims.map(c =>
      c.id === claimId ? { ...c, status: 'rejected', approvedBy: currentUserId } : c
    );
    setRewardClaims(updated);
    syncToSupabase({ rewardClaims: updated });
  }, [rewardClaims, currentUserId, syncToSupabase]);

  const adjustBalance = useCallback((memberId, amountCents, note) => {
    const updatedMembers = members.map(m =>
      m.id === memberId ? { ...m, points: Math.max(0, m.points + amountCents) } : m
    );
    const entry = mkActivity('balance_adjustment', { targetId: memberId, amount: amountCents, note });
    const updatedFeed = newFeed(entry, activityFeed);
    setMembers(updatedMembers);
    setActivityFeed(updatedFeed);
    syncToSupabase({ members: updatedMembers, activityFeed: updatedFeed });
    const usd = '$' + (Math.abs(amountCents) / 100).toFixed(2);
    showToast(amountCents < 0 ? `💸 Deducted ${usd}` : `💰 Added ${usd}`);
  }, [members, activityFeed, currentUserId, syncToSupabase, showToast]);

  const addReward = useCallback((rewardData) => {
    const newReward = { id: `r${Date.now()}`, createdBy: currentUserId, ...rewardData };
    const updated = [newReward, ...rewards];
    setRewards(updated);
    syncToSupabase({ rewards: updated });
    return newReward;
  }, [rewards, currentUserId, syncToSupabase]);

  const deleteReward = useCallback((rewardId) => {
    const updated = rewards.filter(r => r.id !== rewardId);
    setRewards(updated);
    syncToSupabase({ rewards: updated });
  }, [rewards, syncToSupabase]);

  const updateReward = useCallback((rewardId, changes) => {
    const updated = rewards.map(r => r.id === rewardId ? { ...r, ...changes } : r);
    setRewards(updated);
    syncToSupabase({ rewards: updated });
  }, [rewards, syncToSupabase]);

  return (
    <AppContext.Provider value={{
      familyCode, kidCode, accessLevel,
      isLoading, isSetup, syncError, toast,
      currentUser, currentUserId, setCurrentUserId,
      members, chores, rewards, rewardClaims, activityFeed,
      completeOnboarding, joinFamily, resetApp,
      addMember, updateMember, removeMember,
      completeChore, claimOpenChore, approveChore, rejectChore,
      resetChore, addChore, deleteChore, updateChore, bulkApproveChores,
      claimReward, approveRewardClaim, rejectRewardClaim,
      addReward, deleteReward, updateReward,
      adjustBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
