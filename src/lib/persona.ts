import { Persona, Location, Category, Demographic } from './types';

// Name pools by demographic
const NAMES: Record<Demographic, string[]> = {
  asian: ['Emily', 'Jessica', 'Michelle', 'Amy', 'Christine', 'Lisa', 'Jennifer', 'Stephanie', 'Tiffany', 'Sarah'],
  latina: ['Sofia', 'Isabella', 'Valentina', 'Camila', 'Lucia', 'Maria', 'Elena', 'Carmen', 'Rosa', 'Ana'],
  white: ['Emma', 'Olivia', 'Sophia', 'Ava', 'Mia', 'Harper', 'Evelyn', 'Abigail', 'Ella', 'Scarlett'],
  black: ['Aaliyah', 'Zara', 'Imani', 'Destiny', 'Jasmine', 'Diamond', 'Taylor', 'Brianna', 'Maya', 'Kiara'],
  mena: ['Yasmin', 'Layla', 'Nadia', 'Fatima', 'Amira', 'Sara', 'Lina', 'Rania', 'Dina', 'Leila'],
  southasian: ['Priya', 'Ananya', 'Aisha', 'Neha', 'Kavya', 'Shreya', 'Meera', 'Sana', 'Riya', 'Pooja'],
};

const EMOJIS = ['👩', '👩‍🦱', '👩‍🦰', '🧑', '👱‍♀️', '👩‍🦳'];

const OCCUPATIONS = [
  'UCLA Student (Psychology)',
  'UCLA Student (Business)',
  'UCLA Student (Engineering)',
  'UCLA Student (Pre-Med)',
  'Grad Student (MBA)',
  'Grad Student (Law)',
  'Marketing Coordinator',
  'Software Engineer',
  'Nurse',
  'Teacher',
  'Designer',
  'Content Creator',
  'Photographer',
  'Fitness Instructor',
  'Bartender',
];

const VIBES = [
  'Chill & laid-back',
  'Energetic & outgoing',
  'Shy but friendly',
  'Confident & direct',
  'Artsy & creative',
  'Bookworm & intellectual',
  'Athletic & active',
  'Bubbly & talkative',
  'Reserved but warm',
  'Playful & flirty',
];

const INTERESTS_POOL = [
  'yoga', 'hiking', 'boba', 'photography', 'travel', 'music',
  'cooking', 'reading', 'fitness', 'art', 'fashion', 'movies',
  'dancing', 'skincare', 'coffee', 'anime', 'gaming', 'thrifting',
  'brunch', 'concerts', 'netflix', 'dogs', 'cats', 'painting',
];

const SCENARIOS: Record<Category, string[]> = {
  food: [
    "She's waiting in line, scrolling through her phone, looking slightly bored.",
    "She's sitting alone at a table, enjoying her food and people-watching.",
    "She's looking at the menu on the wall, trying to decide what to order.",
    "She just received her order and is taking a photo of it.",
    "She's sitting at the counter, eating and reading something on her phone.",
  ],
  shopping: [
    "She's browsing through racks of clothes, occasionally holding things up.",
    "She's waiting outside a store while her friend is inside trying something on.",
    "She's sitting on a bench, taking a break with some shopping bags.",
    "She's looking at her phone near the directory, maybe figuring out where to go.",
    "She's in line at a checkout counter, scrolling through her phone.",
  ],
  campus: [
    "She's studying at a table with her laptop open, occasionally looking around.",
    "She's walking between classes, earbuds in but not looking too rushed.",
    "She's sitting on the grass with a book, enjoying the weather.",
    "She's at a coffee kiosk, waiting for her order.",
    "She's at a club table, handing out flyers but not super busy.",
  ],
  gym: [
    "She just finished a workout and is stretching near the mats.",
    "She's filling up her water bottle at the fountain.",
    "She's waiting for a machine to open up, doing some light stretches.",
    "She's in the cardio area, just finishing up on the treadmill.",
    "She's near the entrance, checking her phone after her workout.",
  ],
  outdoor: [
    "She's sitting on a blanket, reading a book and enjoying the sun.",
    "She's taking photos of the scenery with her phone.",
    "She's walking her dog along the path.",
    "She's sitting on a bench, eating a snack and people-watching.",
    "She's stretching after what looks like a run.",
  ],
  social: [
    "She's at the bar waiting to order a drink, looking around the venue.",
    "She's with friends but seems to have separated from the group for a moment.",
    "She's near the edge of the dance floor, vibing to the music.",
    "She's looking at her phone near the entrance, maybe waiting for someone.",
    "She's by herself at a high-top table, sipping a drink.",
  ],
};

// Pick random items from array
function pick<T>(arr: T[], count: number = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get most likely demographic for a location
function getMostLikelyDemographic(location: Location): Demographic {
  const demos = Object.entries(location.demoMultipliers) as [Demographic, number][];
  demos.sort((a, b) => b[1] - a[1]);

  // Weighted random selection favoring higher multipliers
  const total = demos.reduce((sum, [, mult]) => sum + mult, 0);
  let rand = Math.random() * total;

  for (const [demo, mult] of demos) {
    rand -= mult;
    if (rand <= 0) return demo;
  }

  return demos[0][0];
}

/**
 * Generate a random persona for a location
 */
export function generatePersona(location: Location): Persona {
  const demographic = getMostLikelyDemographic(location);
  const name = pickOne(NAMES[demographic]);
  const age = 18 + Math.floor(Math.random() * 10); // 18-27
  const emoji = pickOne(EMOJIS);
  const occupation = pickOne(OCCUPATIONS);
  const vibe = pickOne(VIBES);
  const interests = pick(INTERESTS_POOL, 3 + Math.floor(Math.random() * 2));
  const scenario = pickOne(SCENARIOS[location.category]);

  // Determine difficulty based on vibe
  const difficulty = vibe.includes('Shy') || vibe.includes('Reserved')
    ? 'hard'
    : vibe.includes('outgoing') || vibe.includes('Bubbly') || vibe.includes('flirty')
    ? 'easy'
    : 'medium';

  return {
    name,
    age,
    emoji,
    occupation,
    vibe,
    interests,
    scenario,
    demographic,
    difficulty,
  };
}

/**
 * Generate opener suggestions for a location/persona
 */
export function generateOpeners(category: Category, persona: Persona): string[] {
  const openers: Record<Category, string[]> = {
    food: [
      `Hey, have you tried the ${pickOne(['ramen', 'dumplings', 'boba', 'pastries', 'coffee'])} here before? I'm trying to decide what to get.`,
      `That looks amazing - what did you order?`,
      `This line is crazy long, must be worth it though right?`,
      `Quick question - do you know if they have good vegetarian options here?`,
    ],
    shopping: [
      `Hey, quick question - do you think this would look better in ${pickOne(['blue', 'black', 'white'])} or ${pickOne(['gray', 'navy', 'green'])}?`,
      `Excuse me, have you been to this store before? I'm looking for something specific.`,
      `I like your style - where did you get that ${pickOne(['jacket', 'bag', 'shoes'])}?`,
    ],
    campus: [
      `Hey, is this seat taken? Everywhere else is packed.`,
      `What class are you studying for? I'm procrastinating on my ${pickOne(['essay', 'midterm', 'project'])}.`,
      `Random question - do you know a good coffee spot around here?`,
      `Hi! Are you in ${pickOne(['psych', 'econ', 'comm'])}? You look familiar.`,
    ],
    gym: [
      `Hey, are you done with this machine? No rush, just checking.`,
      `Quick question - do you know what time the ${pickOne(['yoga', 'spin', 'HIIT'])} class starts?`,
      `Sorry to bother you, but could you spot me real quick?`,
    ],
    outdoor: [
      `Hey, cute dog! What's their name?`,
      `Beautiful day, right? Had to get outside.`,
      `Do you come here often? I'm new to the area.`,
      `I love this spot - it's so peaceful.`,
    ],
    social: [
      `Hey! What are you drinking? I need some inspiration.`,
      `Having a good night?`,
      `You look like you're having more fun than me - what's your secret?`,
      `I love this song - do you know what it is?`,
    ],
  };

  // Add interest-based opener
  const interest = pickOne(persona.interests);
  const interestOpener = `I noticed you ${
    interest === 'yoga' ? 'have a yoga mat'
    : interest === 'photography' ? 'have a nice camera'
    : interest === 'reading' ? 'reading - what book is that'
    : interest === 'fitness' ? 'just finished a workout'
    : `seem into ${interest}`
  } - ${pickOne(['I love that too!', "I've been wanting to get into that.", 'Any recommendations?'])}`;

  return [...pick(openers[category], 3), interestOpener];
}
