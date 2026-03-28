import { createContext, useContext, useState, useCallback } from 'react';
import {
  MEMBERS, CHORES, REWARDS, REWARD_CLAIMS, ACTIVITY_FEED
} from '../data/initialData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [members, setMembers] = useState(MEMBERS);
  const [chores, setChores] = useState(CHORES);
  const [rewards, setRewards] = useState(REWARDS);
  const [rewardClaims, setRewardClaims] = useState(REWARD_CLAIMS);
  const [activityFeed, setActivityFeed] = useState(ACTIVITY_FEED);

  const currentUser = members.find(m => m.id === currentUserId) || null;

  const addActivity = useCallback((entry) => {
    setActivityFeed(prev => [
      { id: `a${Date.now()}`, ts: new Date().toISOString(), ...entry },
      ...prev,
    ]);
  }, []);

  // --- Chore actions ---
  const completeChore = useCallback((choreId) => {
    setChores(prev => prev.map(c =>
      c.id === choreId
        ? { ...c, status: 'completed', completedAt: new Date().toISOString() }
        : c
    ));
    const chore = chores.find(c => c.id === choreId);
    if (chore) addActivity({ type: 'chore_completed', memberId: currentUserId, choreId });
  }, [chores, currentUserId, addActivity]);

  const approveChore = useCallback((choreId) => {
    let earnedPoints = 0;
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        earnedPoints = c.points;
        return { ...c, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: currentUserId };
      }
      return c;
    }));
    const chore = chores.find(c => c.id === choreId);
    if (chore) {
      setMembers(prev => prev.map(m =>
        m.id === chore.assignedTo ? { ...m, points: m.points + chore.points } : m
      ));
      addActivity({ type: 'chore_approved', memberId: currentUserId, targetId: chore.assignedTo, choreId });
    }
  }, [chores, currentUserId, addActivity]);

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
      ...choreData,
    };
    setChores(prev => [newChore, ...prev]);
    addActivity({ type: 'chore_created', memberId: currentUserId, choreId: newChore.id });
    return newChore;
  }, [currentUserId, addActivity]);

  const deleteChore = useCallback((choreId) => {
    setChores(prev => prev.filter(c => c.id !== choreId));
  }, []);

  // --- Reward actions ---
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
    let claim;
    setRewardClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        claim = c;
        return { ...c, status: 'approved', approvedBy: currentUserId, approvedAt: new Date().toISOString() };
      }
      return c;
    }));
    if (claim) {
      const reward = rewards.find(r => r.id === claim.rewardId);
      if (reward) {
        setMembers(prev => prev.map(m =>
          m.id === claim.claimedBy ? { ...m, points: m.points - reward.pointCost } : m
        ));
        addActivity({ type: 'reward_approved', memberId: currentUserId, targetId: claim.claimedBy, rewardId: claim.rewardId });
      }
    }
  }, [rewards, currentUserId, addActivity]);

  const rejectRewardClaim = useCallback((claimId) => {
    setRewardClaims(prev => prev.map(c =>
      c.id === claimId ? { ...c, status: 'rejected', approvedBy: currentUserId } : c
    ));
  }, [currentUserId]);

  const addReward = useCallback((rewardData) => {
    const newReward = {
      id: `r${Date.now()}`,
      createdBy: currentUserId,
      ...rewardData,
    };
    setRewards(prev => [newReward, ...prev]);
    return newReward;
  }, [currentUserId]);

  return (
    <AppContext.Provider value={{
      currentUser,
      currentUserId,
      setCurrentUserId,
      members,
      chores,
      rewards,
      rewardClaims,
      activityFeed,
      // chore actions
      completeChore,
      approveChore,
      rejectChore,
      addChore,
      deleteChore,
      // reward actions
      claimReward,
      approveRewardClaim,
      rejectRewardClaim,
      addReward,
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
