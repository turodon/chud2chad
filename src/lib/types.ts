// ============ LOCATION TYPES ============

export type Category = 'food' | 'shopping' | 'campus' | 'gym' | 'outdoor' | 'social';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'latenight';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Demographic = 'asian' | 'black' | 'latina' | 'white' | 'mena' | 'southasian';

export interface DemoMultipliers {
  asian: number;
  black: number;
  latina: number;
  white: number;
  mena: number;
  southasian: number;
}

export interface TimeScores {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: Category;
  type: string;
  description: string;
  tip: string;
  distance: string;
  cost: string;
  ageRange: string;
  crowdDensity: 'Low' | 'Medium' | 'High' | 'Very High';
  soloRatio: string;
  peakHours?: string;
  demoMultipliers: DemoMultipliers;
  scores: {
    morning: TimeScores;
    afternoon: TimeScores;
    evening: TimeScores;
    latenight: TimeScores;
  };
}

// ============ SESSION TYPES ============

export type OutcomeType = 'success' | 'neutral' | 'reject';

export interface Session {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  outcome: OutcomeType;
  notes?: string;
  openerUsed?: string;
  personaName?: string;
  createdAt: Date;
}

export interface SessionStats {
  total: number;
  success: number;
  neutral: number;
  reject: number;
  successRate: number;
}

// ============ PERSONA TYPES ============

export interface Persona {
  name: string;
  age: number;
  emoji: string;
  occupation: string;
  vibe: string;
  interests: string[];
  scenario: string;
  demographic: Demographic;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============ CHAT TYPES ============

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface PracticeSession {
  id: string;
  persona: Persona;
  location: Location;
  messages: ChatMessage[];
  outcome?: OutcomeType;
  startedAt: Date;
  endedAt?: Date;
}

// ============ USER TYPES ============

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  location?: string;
  targetDemographic?: Demographic;
  stats: SessionStats;
  createdAt: Date;
}

// ============ FILTER TYPES ============

export interface Filters {
  radius: number; // in miles
  timeSlot: TimeSlot;
  dayOfWeek: DayOfWeek;
  demographics: Demographic[];
  categories: Category[];
  minScore: number;
}

// ============ ROUTE TYPES ============

export interface RouteStop {
  location: Location;
  score: number;
  order: number;
}

export interface Route {
  id: string;
  name: string;
  stops: RouteStop[];
  totalScore: number;
  estimatedTime: string;
}

// ============ ACHIEVEMENT TYPES ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'sessions' | 'success' | 'streak' | 'locations' | 'special';
  unlockedAt?: Date;
}
