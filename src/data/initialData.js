export const MEMBERS = [
  { id: 'p1', name: 'Mom', role: 'parent', emoji: '👩', color: '#818cf8', bgColor: '#eef2ff', points: 0 },
  { id: 'p2', name: 'Dad', role: 'parent', emoji: '👨', color: '#6366f1', bgColor: '#e0e7ff', points: 0 },
  { id: 'k1', name: 'Emma', role: 'child', emoji: '👧', color: '#ec4899', bgColor: '#fdf2f8', age: 13, points: 145 },
  { id: 'k2', name: 'Jake', role: 'child', emoji: '👦', color: '#10b981', bgColor: '#ecfdf5', age: 10, points: 90 },
  { id: 'k3', name: 'Lily', role: 'child', emoji: '🧒', color: '#f59e0b', bgColor: '#fffbeb', age: 7, points: 55 },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const CHORES = [
  {
    id: 'ch1', title: 'Wash Dishes', description: 'Wash all dishes in the sink and put away dry ones.',
    assignedTo: 'k1', assignedBy: 'p1', points: 15, dueDate: today,
    recurrence: 'daily', status: 'completed', category: 'kitchen',
    completedAt: new Date(Date.now() - 3600000).toISOString(), approvedAt: null, approvedBy: null,
  },
  {
    id: 'ch2', title: 'Vacuum Living Room', description: 'Vacuum the carpet and under the couch cushions.',
    assignedTo: 'k1', assignedBy: 'p1', points: 20, dueDate: today,
    recurrence: 'weekly', status: 'approved', category: 'cleaning',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 72000000).toISOString(), approvedBy: 'p2',
  },
  {
    id: 'ch3', title: 'Take Out Trash', description: 'Empty all trash bins and take bags to the curb.',
    assignedTo: 'k2', assignedBy: 'p2', points: 10, dueDate: today,
    recurrence: 'weekly', status: 'pending', category: 'outdoor',
    completedAt: null, approvedAt: null, approvedBy: null,
  },
  {
    id: 'ch4', title: 'Set the Table', description: 'Set dinner table for all family members.',
    assignedTo: 'k3', assignedBy: 'p1', points: 10, dueDate: today,
    recurrence: 'daily', status: 'completed', category: 'kitchen',
    completedAt: new Date(Date.now() - 1800000).toISOString(), approvedAt: null, approvedBy: null,
  },
  {
    id: 'ch5', title: 'Clean Bathroom', description: 'Scrub sink, toilet and mirror. Replace toilet paper.',
    assignedTo: 'k2', assignedBy: 'p1', points: 25, dueDate: tomorrow,
    recurrence: 'weekly', status: 'pending', category: 'cleaning',
    completedAt: null, approvedAt: null, approvedBy: null,
  },
  {
    id: 'ch6', title: 'Feed the Dog', description: 'Fill Biscuit\'s bowl with food and fresh water.',
    assignedTo: 'k3', assignedBy: 'p2', points: 10, dueDate: today,
    recurrence: 'daily', status: 'approved', category: 'pets',
    completedAt: new Date(Date.now() - 10800000).toISOString(),
    approvedAt: new Date(Date.now() - 9000000).toISOString(), approvedBy: 'p1',
  },
  {
    id: 'ch7', title: 'Tidy Bedroom', description: 'Make bed, put clothes away, and clear the desk.',
    assignedTo: 'k1', assignedBy: 'p1', points: 15, dueDate: today,
    recurrence: 'daily', status: 'pending', category: 'cleaning',
    completedAt: null, approvedAt: null, approvedBy: null,
  },
  {
    id: 'ch8', title: 'Mow the Lawn', description: 'Mow the front and back yard, edge the driveway.',
    assignedTo: 'k2', assignedBy: 'p2', points: 40, dueDate: tomorrow,
    recurrence: 'weekly', status: 'pending', category: 'outdoor',
    completedAt: null, approvedAt: null, approvedBy: null,
  },
];

export const REWARDS = [
  { id: 'r1', title: 'Extra Screen Time', description: '1 extra hour of video games or TV.', pointCost: 50, emoji: '🎮', createdBy: 'p1' },
  { id: 'r2', title: 'Choose Dinner', description: 'Pick what the whole family has for dinner.', pointCost: 75, emoji: '🍕', createdBy: 'p1' },
  { id: 'r3', title: 'Movie Night Pick', description: 'You pick the movie for family movie night.', pointCost: 60, emoji: '🎬', createdBy: 'p2' },
  { id: 'r4', title: 'Stay Up Late', description: 'One night to stay up 1 hour past bedtime.', pointCost: 80, emoji: '🌙', createdBy: 'p1' },
  { id: 'r5', title: 'Dessert of Choice', description: 'Pick any dessert from the store.', pointCost: 40, emoji: '🍦', createdBy: 'p2' },
  { id: 'r6', title: 'No Chores Day', description: 'One full day off from all chores.', pointCost: 150, emoji: '🏖️', createdBy: 'p1' },
];

export const REWARD_CLAIMS = [
  {
    id: 'rc1', rewardId: 'r5', claimedBy: 'k1', claimedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending', approvedBy: null, approvedAt: null,
  },
];

export const ACTIVITY_FEED = [
  { id: 'a1', type: 'chore_approved', memberId: 'p2', targetId: 'k1', choreId: 'ch2', ts: new Date(Date.now() - 72000000).toISOString() },
  { id: 'a2', type: 'chore_completed', memberId: 'k3', choreId: 'ch6', ts: new Date(Date.now() - 10800000).toISOString() },
  { id: 'a3', type: 'chore_approved', memberId: 'p1', targetId: 'k3', choreId: 'ch6', ts: new Date(Date.now() - 9000000).toISOString() },
  { id: 'a4', type: 'reward_claimed', memberId: 'k1', rewardId: 'r5', ts: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a5', type: 'chore_completed', memberId: 'k1', choreId: 'ch1', ts: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a6', type: 'chore_completed', memberId: 'k3', choreId: 'ch4', ts: new Date(Date.now() - 1800000).toISOString() },
];

export const CATEGORY_META = {
  kitchen: { label: 'Kitchen', color: '#f97316', bg: '#fff7ed', emoji: '🍳' },
  cleaning: { label: 'Cleaning', color: '#6366f1', bg: '#eef2ff', emoji: '🧹' },
  outdoor: { label: 'Outdoor', color: '#10b981', bg: '#ecfdf5', emoji: '🌿' },
  pets: { label: 'Pets', color: '#f59e0b', bg: '#fffbeb', emoji: '🐾' },
  laundry: { label: 'Laundry', color: '#8b5cf6', bg: '#f5f3ff', emoji: '👕' },
  personal: { label: 'Personal', color: '#ec4899', bg: '#fdf2f8', emoji: '⭐' },
};
