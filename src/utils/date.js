// Local-time date helpers.
//
// Everything here is keyed to the phone's local calendar day, never UTC.
// The family uses the app in the evening; with UTC dates "today" rolled
// over at 8pm Detroit time, so freshly recycled chores read "Tomorrow",
// today's done-counts went to zero, and the day-of-week schedule shifted.

export function localDateStr(d = new Date()) {
  const dt  = d instanceof Date ? d : new Date(d);
  const y   = dt.getFullYear();
  const m   = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayStr = () => localDateStr();

export function isToday(iso) {
  return !!iso && localDateStr(new Date(iso)) === todayStr();
}

export function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}

export function formatDate(dateStr) {
  if (!dateStr) return '–';
  if (dateStr === todayStr())     return 'Today';
  if (dateStr === daysFromNow(1)) return 'Tomorrow';
  // Build the date from parts: new Date('YYYY-MM-DD') parses as UTC midnight,
  // which renders as the previous day anywhere west of Greenwich.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
