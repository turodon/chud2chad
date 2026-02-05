import { Location, TimeSlot, DayOfWeek, Demographic, Filters } from './types';

/**
 * Get the current time slot based on hour
 */
export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'latenight';
}

/**
 * Get the current day of week
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
}

/**
 * Calculate the base score for a location at a given time
 */
export function getBaseScore(
  location: Location,
  timeSlot: TimeSlot,
  dayOfWeek: DayOfWeek
): number {
  return location.scores[timeSlot][dayOfWeek];
}

/**
 * Calculate the demographic multiplier
 */
export function getDemoMultiplier(
  location: Location,
  demographics: Demographic[]
): number {
  if (demographics.length === 0) return 1;

  // Average the multipliers for selected demographics
  const sum = demographics.reduce(
    (acc, demo) => acc + location.demoMultipliers[demo],
    0
  );
  return sum / demographics.length;
}

/**
 * Calculate the final score for a location
 */
export function calculateScore(
  location: Location,
  timeSlot: TimeSlot,
  dayOfWeek: DayOfWeek,
  demographics: Demographic[] = []
): number {
  const baseScore = getBaseScore(location, timeSlot, dayOfWeek);
  const demoMultiplier = getDemoMultiplier(location, demographics);
  return Math.round(baseScore * demoMultiplier);
}

/**
 * Get score color class based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-primary-dark';
  if (score >= 50) return 'text-accent';
  if (score >= 30) return 'text-purple-500';
  return 'text-blue-500';
}

/**
 * Get score gradient color for visual display
 */
export function getScoreGradient(score: number): string {
  if (score >= 70) return 'from-primary to-primary-dark';
  if (score >= 50) return 'from-accent to-primary';
  if (score >= 30) return 'from-purple-600 to-accent';
  return 'from-blue-600 to-purple-600';
}

/**
 * Filter and score locations based on filters
 */
export function filterAndScoreLocations(
  locations: Location[],
  filters: Filters
): Array<{ location: Location; score: number }> {
  return locations
    .filter((loc) => {
      // Filter by category
      if (filters.categories.length > 0 && !filters.categories.includes(loc.category)) {
        return false;
      }

      // Filter by minimum score
      const score = calculateScore(
        loc,
        filters.timeSlot,
        filters.dayOfWeek,
        filters.demographics
      );
      if (score < filters.minScore) {
        return false;
      }

      return true;
    })
    .map((loc) => ({
      location: loc,
      score: calculateScore(loc, filters.timeSlot, filters.dayOfWeek, filters.demographics),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get time slot label
 */
export function getTimeSlotLabel(slot: TimeSlot): string {
  const labels: Record<TimeSlot, string> = {
    morning: 'Morning (5am-12pm)',
    afternoon: 'Afternoon (12pm-5pm)',
    evening: 'Evening (5pm-10pm)',
    latenight: 'Late Night (10pm-5am)',
  };
  return labels[slot];
}

/**
 * Get time slot emoji
 */
export function getTimeSlotEmoji(slot: TimeSlot): string {
  const emojis: Record<TimeSlot, string> = {
    morning: '☀️',
    afternoon: '🌤️',
    evening: '🌆',
    latenight: '🌙',
  };
  return emojis[slot];
}

/**
 * Get day label (abbreviated)
 */
export function getDayLabel(day: DayOfWeek): string {
  const labels: Record<DayOfWeek, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  };
  return labels[day];
}

/**
 * Calculate distance between two coordinates in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
