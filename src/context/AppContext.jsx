import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'chorefamily_v1';

const PRESET_COLORS = [
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
  { title: 'Extra Screen Time', pointCost: 50, emoji: '🎮', description: '1 extra hour of games or TV.' },
  { title: 'Choose Dinner', pointCost: 75, emoji: '🍕', description: 'Pick what the family has for dinner.' },
  { title: 'Movie Night Pick', pointCost: 60, emoji: '🎬', description: 'Pick the movie for family movie night.' },
  { title: 'Stay Up Late', pointCost: 80, emoji: '🌙', description: 'One night 1 hour past bedtime.' },
  { title: 'No Chores Day', pointCost: 150, emoji: '🏖️', description: 'One full day off from all chores.' },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export { PRESET_COLORS };

export function AppProvider({ children }) {
  const saved = load();

  const [isSetup, setIsSetup] = useState(saved?.isSetup || false);
  const [members, setMembers] = useState(saved?.members || []);
  const [chores, setChores] = useState(saved?.chores || []);
  const [rewards, setRewards] = useState(saved?.rewards || []);
  const [rewardClaims, setRewardClaims] = useState(saved?.rewardClaims || []);
  const [activityFeed, setActivityFeed] = useState(saved?.activityFeed || []);
  const [currentUserId, setCurrentUserId] = useState(null);

  const currentUser = members.find(m => m.id === currentUserId) || null;

  // Persist all state changes
  useEffect(() => {
    save({ isSetup, members, chores, rewards, rewardClaims, activityFeed });
  }, [isSetup, members, chores, rewards, rewardClaims, activityFeed]);

  const addActivity = useCallback((entry) => {
    setActivityFeed(prev => [
      { id: `a${Date.now()}`, ts: new Date().toISOString(), ...entry },
      ...prev,
    ]);
  }, []);

  // --- Setup ---
  const completeOnboarding = useCallback((newMembers) => {
    const coloredMembers = newMembers.map((m, i) => ({
      ...m,
      points: 0,
      ...PRESET_COLORS[i % PRESET_COLORS.length],
    }));
    const parentId = coloredMembers.find(m => m.role === 'parent')?.id;
    const starterRewards = STARTER_REWARDS.map((r, i) => ({
      ...r,
      id: `r${Date.now() + i}`,
      createdBy: parentId || 'system',
    }));
    setMembers(coloredMembers);
    setRewards(starterRewards);
    setChores([]);
    setRewardClaims([]);
    setActivityFeed([]);
    setIsSetup(true);
  }, []);

  const resetApp = useCallback(() => {
    setIsSetup(false);
    setMembers([]);
    setChores([]);
    setRewards([]);
    setRewardClaims([]);
    setActivityFeed([]);
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // --- Members ---
  const addMember = useCallback((memberData) => {
    const idx = members.length;
    const newMember = {
      id: `m${Date.now()}`,
      points: 0,
      ...PRESET_COLORS[idx % PRESET_COLORS.length],
      ...memberData,
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  }, [members.length]);

  const updateMember = useCallback((id, updates) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const removeMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setChores(prev => prev.filter(c => c.assignedTo !== id));
  }, []);

  // --- Chores ---
  const completeChore = useCallback((choreId) => {
    setChores(prev => prev.map(c =>
      c.id === choreId ? { ...c, status: 'completed', completedAt: new Date().toISOString() } : c
    ));
    addActivity({ type: 'chore_completed', memberId: currentUserId, choreId });
  }, [currentUserId, addActivity]);

  const approveChore = useCallback((choreId) => {
    let earned = 0;
    let assignedTo = null;
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        earned = c.points;
        assignedTo = c.assignedTo;
        return { ...c, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: currentUserId };
      }
      return c;
    }));
    if (assignedTo) {
      setMembers(prev => prev.map(m =>
        m.id === assignedTo ? { ...m, points: m.points + earned } : m
      ));
      addActivity({ type: 'chore_approved', memberId: currentUserId, targetId: assignedTo, choreId });
    }
  }, [currentUserId, addActivity]);

  const rejectChore = useCallback((choreId, reason) => {
    setChores(prev => prev.map(c =>
      c.id === choreId
        ? { ...c, status: 'pending', completedAt: null, rejectionReason: reason || '' }
        : c
    ));
    addActivity({ type: 'chore_rejected', memberId: currentUserId, choreId });
  }, [currentUserId, addActivity]);

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
    setChores(prev => [newChore, ...prev]);
    addActivity({ type: 'chore_created', memberId: currentUserId, targetId: newChore.assignedTo, choreId: newChore.id });
    return newChore;
  }, [currentUserId, addActivity]);

  const deleteChore = useCallback((choreId) => {
    setChores(prev => prev.filter(c => c.id !== choreId));
  }, []);

  // --- Rewards ---
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
    setRewardClaims(prev => [claim, ...prev]);
    addActivity({ type: 'reward_claimed', memberId: currentUserId, rewardId });
  }, [currentUserId, addActivity]);

  const approveRewardClaim = useCallback((claimId) => {
    let claimData = null;
    setRewardClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        claimData = c;
        return { ...c, status: 'approved', approvedBy: currentUserId, approvedAt: new Date().toISOString() };
      }
      return c;
    }));
    if (claimData) {
      const reward = rewards.find(r => r.id === claimData.rewardId);
      if (reward) {
        setMembers(prev => prev.map(m =>
          m.id === claimData.claimedBy ? { ...m, points: Math.max(0, m.points - reward.pointCost) } : m
        ));
        addActivity({ type: 'reward_approved', memberId: currentUserId, targetId: claimData.claimedBy, rewardId: claimData.rewardId });
      }
    }
  }, [rewards, currentUserId, addActivity]);

  const rejectRewardClaim = useCallback((claimId) => {
    setRewardClaims(prev => prev.map(c =>
      c.id === claimId ? { ...c, status: 'rejected', approvedBy: currentUserId } : c
    ));
  }, [currentUserId]);

  const addReward = useCallback((rewardData) => {
    const newReward = { id: `r${Date.now()}`, createdBy: currentUserId, ...rewardData };
    setRewards(prev => [newReward, ...prev]);
    return newReward;
  }, [currentUserId]);

  const deleteReward = useCallback((rewardId) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId));
  }, []);

  return (
    <AppContext.Provider value={{
      isSetup, currentUser, currentUserId, setCurrentUserId, members,
      chores, rewards, rewardClaims, activityFeed,
      completeOnboarding, resetApp,
      addMember, updateMember, removeMember,
      completeChore, approveChore, rejectChore, addChore, deleteChore,
      claimReward, approveRewardClaim, rejectRewardClaim, addReward, deleteReward,
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
