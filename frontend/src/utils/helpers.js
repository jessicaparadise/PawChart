import { format, parseISO, differenceInYears, differenceInMonths, isPast, isToday, addDays } from 'date-fns';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return dateStr;
  }
}

export function getAge(dateOfBirth) {
  if (!dateOfBirth) return 'Unknown age';
  const dob = parseISO(dateOfBirth);
  const years = differenceInYears(new Date(), dob);
  if (years === 0) {
    const months = differenceInMonths(new Date(), dob);
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }
  return `${years} year${years !== 1 ? 's' : ''} old`;
}

export function getSpeciesEmoji(species) {
  const map = {
    Dog: '🐕',
    Cat: '🐈',
    Rabbit: '🐇',
    Bird: '🦜',
    Fish: '🐠',
    Hamster: '🐹',
    Guinea: '🐾',
    Turtle: '🐢',
    Snake: '🐍',
    Lizard: '🦎',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (species?.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🐾';
}

export function getSpeciesColor(species) {
  const map = {
    Dog: 'bg-amber-100 text-amber-700',
    Cat: 'bg-purple-100 text-purple-700',
    Rabbit: 'bg-pink-100 text-pink-700',
    Bird: 'bg-sky-100 text-sky-700',
    Fish: 'bg-blue-100 text-blue-700',
    Hamster: 'bg-orange-100 text-orange-700',
    Turtle: 'bg-green-100 text-green-700',
    Snake: 'bg-emerald-100 text-emerald-700',
  };
  for (const [key, cls] of Object.entries(map)) {
    if (species?.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return 'bg-gray-100 text-gray-700';
}

export function getVaccinationStatus(nextDueDate) {
  if (!nextDueDate) return { label: 'No due date', color: 'bg-gray-100 text-gray-600' };
  const due = parseISO(nextDueDate);
  const today = new Date();
  const soonThreshold = addDays(today, 30);

  if (isPast(due) && !isToday(due)) {
    return { label: 'Overdue', color: 'bg-red-100 text-red-700' };
  }
  if (due <= soonThreshold) {
    return { label: 'Due soon', color: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Up to date', color: 'bg-green-100 text-green-700' };
}

export function getAppointmentTypeLabel(type) {
  const map = {
    checkup: 'Wellness Check',
    vaccination: 'Vaccination',
    dental: 'Dental',
    surgery: 'Surgery',
    followup: 'Follow-up',
    emergency: 'Emergency',
    grooming: 'Grooming',
    other: 'Other',
  };
  return map[type] || type;
}

export function getAppointmentTypeColor(type) {
  const map = {
    checkup: 'bg-blue-100 text-blue-700',
    vaccination: 'bg-green-100 text-green-700',
    dental: 'bg-cyan-100 text-cyan-700',
    surgery: 'bg-red-100 text-red-700',
    followup: 'bg-purple-100 text-purple-700',
    emergency: 'bg-red-200 text-red-800',
    grooming: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}

export function getSeverityColor(severity) {
  const map = {
    mild: 'bg-green-100 text-green-700',
    moderate: 'bg-amber-100 text-amber-700',
    severe: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-900',
  };
  return map[severity] || 'bg-gray-100 text-gray-600';
}

export function getConditionStatusColor(status) {
  const map = {
    active: 'bg-red-100 text-red-700',
    managed: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    chronic: 'bg-purple-100 text-purple-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function isUpcoming(dateStr, days = 7) {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  const today = new Date();
  const threshold = addDays(today, days);
  return date >= today && date <= threshold;
}
