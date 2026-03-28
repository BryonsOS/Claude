import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const AppContext = createContext(null);
const CODE_KEY = 'chorefamily_code';

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
  { title: 'Extra Screen Time', pointCost: 50, emoji: '🎮', description: '1 extra hour of games or TV.' },
  { title: 'Choose Dinner',     pointCost: 75, emoji: '🍕', description: 'Pick what the family has for dinner.' },
  { title: 'Movie Night Pick',  pointCost: 60, emoji: '🎬', description: 'Pick the movie for family movie night.' },
  { title: 'Stay Up Late',      pointCost: 80, emoji: '🌙', description: 'One night 1 hour past bedtime.' },
  { title: 'No Chores Day',     pointCost: 150,emoji: '🏖️', description: 'One full day off from all chores.' },
];

function generateFamilyCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const D = '23456789';
  const r = (s) => s[Math.floor(Math.random() * s.length)];
  return `${r(L)}${r(L)}${r(L)}${r(L)}-${r(D)}${r(D)}${r(D)}${r(D)}`;
}

export function AppProvider({ children }) {
  const savedCode = localStorage.getItem(CODE_KEY);
  const [familyCode, setFamilyCode] = useState(savedCode);
  const familyCodeRef = useRef(savedCode);

  const [isLoading, setIsLoading]       = useState(!!savedCode);
  const [isSetup,   setIsSetup]         = useState(false);
  const [members,   setMembers]         = useState([]);
  const [chores,    setChores]          = useState([]);
  const [rewards,   setRewards]         = useState([]);
  const [rewardClaims, setRewardClaims] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [syncError, setSyncError]       = useState(null);

  const currentUser = members.find(m => m.id === currentUserId) || null;

  // ─── Firestore sync helper ───────────────────────────────────────────────
  const syncToFirestore = useCallback(async (updates) => {
    const code = familyCodeRef.current;
    if (!code) return;
    try {
      await updateDoc(doc(db, 'families', code), updates);
      setSyncError(null);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncError('Changes may not have saved. Check your connection.');
    }
  }, []);

  // ─── Subscribe to Firestore when we have a code ──────────────────────────
  useEffect(() => {
    if (!familyCode) { setIsLoading(false); return; }
    familyCodeRef.current = familyCode;

    const unsub = onSnapshot(doc(db, 'families', familyCode), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setMembers(d.members       || []);
        setChores(d.chores         || []);
        setRewards(d.rewards       || []);
        setRewardClaims(d.rewardClaims || []);
        setActivityFeed(d.activityFeed || []);
        setIsSetup(true);
      } else {
        // Code not found — clear it
        localStorage.removeItem(CODE_KEY);
        setFamilyCode(null);
        familyCodeRef.current = null;
        setIsSetup(false);
      }
      setIsLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setSyncError('Could not connect. Check your internet connection.');
      setIsLoading(false);
    });

    return unsub;
  }, [familyCode]);

  // ─── Setup ───────────────────────────────────────────────────────────────
  const completeOnboarding = useCallback(async (newMembers) => {
    const code = generateFamilyCode();
    const coloredMembers = newMembers.map((m, i) => ({
      ...m,
      points: 0,
      ...PRESET_COLORS[i % PRESET_COLORS.length],
    }));
    const parentId = coloredMembers.find(m => m.role === 'parent')?.id;
    const starterRewards = STARTER_REWARDS.map((r, i) => ({
      ...r, id: `r${Date.now() + i}`, createdBy: parentId || 'system',
    }));
    const familyData = {
      members: coloredMembers,
      chores: [],
      rewards: starterRewards,
      rewardClaims: [],
      activityFeed: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'families', code), familyData);
    localStorage.setItem(CODE_KEY, code);
    familyCodeRef.current = code;
    setFamilyCode(code);
  }, []);

  const joinFamily = useCallback(async (code) => {
    const snap = await getDoc(doc(db, 'families', code.toUpperCase().trim()));
    if (!snap.exists()) throw new Error('Family code not found');
    localStorage.setItem(CODE_KEY, code.toUpperCase().trim());
    familyCodeRef.current = code.toUpperCase().trim();
    setFamilyCode(code.toUpperCase().trim());
  }, []);

  const resetApp = useCallback(() => {
    localStorage.removeItem(CODE_KEY);
    familyCodeRef.current = null;
    setFamilyCode(null);
    setIsSetup(false);
    setMembers([]);
    setChores([]);
    setRewards([]);
    setRewardClaims([]);
    setActivityFeed([]);
    setCurrentUserId(null);
  }, []);

  // ─── Members ─────────────────────────────────────────────────────────────
  const addMember = useCallback((memberData) => {
    const newMember = {
      id: `m${Date.now()}`,
      points: 0,
      ...PRESET_COLORS[members.length % PRESET_COLORS.length],
      ...memberData,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    syncToFirestore({ members: updated });
    return newMember;
  }, [members, syncToFirestore]);

  const updateMember = useCallback((id, updates) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    setMembers(updated);
    syncToFirestore({ members: updated });
  }, [members, syncToFirestore]);

  const removeMember = useCallback((id) => {
    const updatedMembers = members.filter(m => m.id !== id);
    const updatedChores  = chores.filter(c => c.assignedTo !== id);
    setMembers(updatedMembers);
    setChores(updatedChores);
    syncToFirestore({ members: updatedMembers, chores: updatedChores });
  }, [members, chores, syncToFirestore]);

  // ─── Chores ──────────────────────────────────────────────────────────────
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
    syncToFirestore({ chores: updatedChores, activityFeed: updatedFeed });
  }, [chores, activityFeed, currentUserId, syncToFirestore]);

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
    syncToFirestore({ chores: updatedChores, members: updatedMembers, activityFeed: updatedFeed });
  }, [chores, members, activityFeed, currentUserId, syncToFirestore]);

  const rejectChore = useCallback((choreId, reason) => {
    const updatedChores = chores.map(c =>
      c.id === choreId
        ? { ...c, status: 'pending', completedAt: null, rejectionReason: reason || '' }
        : c
    );
    const updatedFeed = newFeed(mkActivity('chore_rejected', { choreId }), activityFeed);
    setChores(updatedChores);
    setActivityFeed(updatedFeed);
    syncToFirestore({ chores: updatedChores, activityFeed: updatedFeed });
  }, [chores, activityFeed, currentUserId, syncToFirestore]);

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
    syncToFirestore({ chores: updatedChores, activityFeed: updatedFeed });
    return newChore;
  }, [chores, activityFeed, currentUserId, syncToFirestore]);

  const deleteChore = useCallback((choreId) => {
    const updated = chores.filter(c => c.id !== choreId);
    setChores(updated);
    syncToFirestore({ chores: updated });
  }, [chores, syncToFirestore]);

  // ─── Rewards ─────────────────────────────────────────────────────────────
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
    syncToFirestore({ rewardClaims: updatedClaims, activityFeed: updatedFeed });
  }, [rewardClaims, activityFeed, currentUserId, syncToFirestore]);

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
    syncToFirestore({ rewardClaims: updatedClaims, members: updatedMembers, activityFeed: updatedFeed });
  }, [rewardClaims, rewards, members, activityFeed, currentUserId, syncToFirestore]);

  const rejectRewardClaim = useCallback((claimId) => {
    const updated = rewardClaims.map(c =>
      c.id === claimId ? { ...c, status: 'rejected', approvedBy: currentUserId } : c
    );
    setRewardClaims(updated);
    syncToFirestore({ rewardClaims: updated });
  }, [rewardClaims, currentUserId, syncToFirestore]);

  const addReward = useCallback((rewardData) => {
    const newReward = { id: `r${Date.now()}`, createdBy: currentUserId, ...rewardData };
    const updated = [newReward, ...rewards];
    setRewards(updated);
    syncToFirestore({ rewards: updated });
    return newReward;
  }, [rewards, currentUserId, syncToFirestore]);

  const deleteReward = useCallback((rewardId) => {
    const updated = rewards.filter(r => r.id !== rewardId);
    setRewards(updated);
    syncToFirestore({ rewards: updated });
  }, [rewards, syncToFirestore]);

  return (
    <AppContext.Provider value={{
      familyCode, isLoading, isSetup, syncError,
      currentUser, currentUserId, setCurrentUserId,
      members, chores, rewards, rewardClaims, activityFeed,
      completeOnboarding, joinFamily, resetApp,
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
