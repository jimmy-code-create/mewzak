// ─── Mewzak phase-1 catalogue ────────────────────────────────────────────────
// All data is fictional. Artwork is generated procedurally so the prototype has
// no external assets. Palettes are tuned to the brand: lilac, peach, periwinkle,
// blush. No green anywhere.

export const palettes = {
  lavender: { name: 'Lavender Hush', colors: ['#B79CFF', '#6E5BE0', '#FFB48A'] },
  peach: { name: 'Peach Static', colors: ['#FFB48A', '#E07E9E', '#B79CFF'] },
  blush: { name: 'Blush Hour', colors: ['#F2A7C3', '#A46BD6', '#9EC5FF'] },
  night: { name: 'Night Swim', colors: ['#8FA8FF', '#3E4699', '#B79CFF'] },
  ice: { name: 'Ice Bloom', colors: ['#A8C6FF', '#5B7BE0', '#D9C7FF'] },
  plum: { name: 'Plum Velvet', colors: ['#C9A0FF', '#7A4BC8', '#FFB48A'] },
  cream: { name: 'Cream & Sugar', colors: ['#F4D9C6', '#D9A3B8', '#B79CFF'] },
  sky: { name: 'Sky Thread', colors: ['#C9E0FF', '#7F9BE8', '#E2C8FF'] },
} as const;

export type PaletteKey = keyof typeof palettes;

export type Track = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  palette: PaletteKey;
  art: number;
  image?: string;
  streamUrl?: string;
  sourceUrl?: string;
  genre?: string;
  source?: 'audius';
};

export type Artist = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  followers?: number;
  palette: PaletteKey;
  art: number;
  bio: string;
  topTracks: string[];
  image?: string;
  sourceUrl?: string;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  palette: PaletteKey;
  art: number;
  blurb: string;
  trackIds: string[];
  image?: string;
  sourceUrl?: string;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  curator: string;
  palette: PaletteKey;
  art: number;
  updated: string;
  trackIds: string[];
  image?: string;
  user?: boolean;
};

export const tracks: Track[] = [
  // Luna Vale — Slow Parade
  { id: 'slow-blink', title: 'Slow Blink', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 222, palette: 'lavender', art: 0 },
  { id: 'stairwell-sun', title: 'Stairwell Sun', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 211, palette: 'lavender', art: 6 },
  { id: 'paper-moon', title: 'Paper Moon', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 188, palette: 'plum', art: 7 },
  { id: 'feather', title: 'Feather', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 174, palette: 'lavender', art: 4 },
  { id: 'landing-lights', title: 'Landing Lights', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 227, palette: 'night', art: 1 },
  { id: 'blue-chair', title: 'Blue Chair', artist: 'Luna Vale', artistId: 'luna-vale', album: 'Slow Parade', albumId: 'slow-parade', duration: 242, palette: 'ice', art: 3 },

  // Sable & the Quiet — Catnap
  { id: 'moonlit-knead', title: 'Moonlit Knead', artist: 'Sable & the Quiet', artistId: 'sable-quiet', album: 'Catnap', albumId: 'catnap', duration: 246, palette: 'night', art: 5 },
  { id: 'catmilk', title: 'Catmilk', artist: 'Sable & the Quiet', artistId: 'sable-quiet', album: 'Catnap', albumId: 'catnap', duration: 184, palette: 'cream', art: 4 },
  { id: 'nightlight', title: 'Nightlight', artist: 'Sable & the Quiet', artistId: 'sable-quiet', album: 'Catnap', albumId: 'catnap', duration: 202, palette: 'plum', art: 2 },
  { id: 'warm-sock', title: 'Warm Sock', artist: 'Sable & the Quiet', artistId: 'sable-quiet', album: 'Catnap', albumId: 'catnap', duration: 171, palette: 'cream', art: 6 },
  { id: 'drowsy', title: 'Drowsy', artist: 'Sable & the Quiet', artistId: 'sable-quiet', album: 'Catnap', albumId: 'catnap', duration: 260, palette: 'night', art: 0 },

  // Mira Chen — Glass Hour
  { id: 'peach-soda', title: 'Peach Soda', artist: 'Mira Chen', artistId: 'mira-chen', album: 'Glass Hour', albumId: 'glass-hour', duration: 178, palette: 'peach', art: 7 },
  { id: 'daybed', title: 'Daybed', artist: 'Mira Chen', artistId: 'mira-chen', album: 'Glass Hour', albumId: 'glass-hour', duration: 206, palette: 'blush', art: 3 },
  { id: 'glass-hour', title: 'Glass Hour', artist: 'Mira Chen', artistId: 'mira-chen', album: 'Glass Hour', albumId: 'glass-hour', duration: 219, palette: 'peach', art: 1 },
  { id: 'winter-arcade', title: 'Winter Arcade', artist: 'Mira Chen', artistId: 'mira-chen', album: 'Glass Hour', albumId: 'glass-hour', duration: 191, palette: 'ice', art: 5 },

  // Low Ceiling — Room Tone
  { id: 'lint', title: 'Lint', artist: 'Low Ceiling', artistId: 'low-ceiling', album: 'Room Tone', albumId: 'room-tone', duration: 201, palette: 'ice', art: 2 },
  { id: 'marble', title: 'Marble', artist: 'Low Ceiling', artistId: 'low-ceiling', album: 'Room Tone', albumId: 'room-tone', duration: 159, palette: 'sky', art: 0 },
  { id: 'hallway-hum', title: 'Hallway Hum', artist: 'Low Ceiling', artistId: 'low-ceiling', album: 'Room Tone', albumId: 'room-tone', duration: 235, palette: 'lavender', art: 6 },
  { id: 'room-tone', title: 'Room Tone', artist: 'Low Ceiling', artistId: 'low-ceiling', album: 'Room Tone', albumId: 'room-tone', duration: 248, palette: 'ice', art: 4 },

  // Velvet Static — Milk Teeth
  { id: 'soft-teeth', title: 'Soft Teeth', artist: 'Velvet Static', artistId: 'velvet-static', album: 'Milk Teeth', albumId: 'milk-teeth', duration: 185, palette: 'blush', art: 1 },
  { id: 'milk-teeth', title: 'Milk Teeth', artist: 'Velvet Static', artistId: 'velvet-static', album: 'Milk Teeth', albumId: 'milk-teeth', duration: 164, palette: 'blush', art: 5 },
  { id: 'hairpin', title: 'Hairpin', artist: 'Velvet Static', artistId: 'velvet-static', album: 'Milk Teeth', albumId: 'milk-teeth', duration: 198, palette: 'plum', art: 3 },

  // Yuki Halo — Ceramic Sky
  { id: 'moth-hour', title: 'Moth Hour', artist: 'Yuki Halo', artistId: 'yuki-halo', album: 'Ceramic Sky', albumId: 'ceramic-sky', duration: 252, palette: 'plum', art: 7 },
  { id: 'hush', title: 'Hush', artist: 'Yuki Halo', artistId: 'yuki-halo', album: 'Ceramic Sky', albumId: 'ceramic-sky', duration: 284, palette: 'night', art: 6 },
  { id: 'ceramic-sky', title: 'Ceramic Sky', artist: 'Yuki Halo', artistId: 'yuki-halo', album: 'Ceramic Sky', albumId: 'ceramic-sky', duration: 232, palette: 'lavender', art: 0 },
  { id: 'rain-on-tin', title: 'Rain on Tin', artist: 'Yuki Halo', artistId: 'yuki-halo', album: 'Ceramic Sky', albumId: 'ceramic-sky', duration: 216, palette: 'sky', art: 2 },

  // Nightjun — Blue Hour Tapes
  { id: 'purr-engine', title: 'Purr Engine', artist: 'Nightjun', artistId: 'nightjun', album: 'Blue Hour Tapes', albumId: 'blue-hour-tapes', duration: 238, palette: 'night', art: 3 },
  { id: 'blue-hour', title: 'Blue Hour', artist: 'Nightjun', artistId: 'nightjun', album: 'Blue Hour Tapes', albumId: 'blue-hour-tapes', duration: 271, palette: 'ice', art: 1 },
  { id: 'night-bus', title: 'Night Bus', artist: 'Nightjun', artistId: 'nightjun', album: 'Blue Hour Tapes', albumId: 'blue-hour-tapes', duration: 199, palette: 'sky', art: 4 },
  { id: 'tape-hiss', title: 'Tape Hiss', artist: 'Nightjun', artistId: 'nightjun', album: 'Blue Hour Tapes', albumId: 'blue-hour-tapes', duration: 177, palette: 'lavender', art: 5 },

  // Fennec — Hush Hush
  { id: 'cold-nose', title: 'Cold Nose', artist: 'Fennec', artistId: 'fennec', album: 'Hush Hush', albumId: 'hush-hush', duration: 167, palette: 'ice', art: 0 },
  { id: 'paw-print', title: 'Paw Print', artist: 'Fennec', artistId: 'fennec', album: 'Hush Hush', albumId: 'hush-hush', duration: 192, palette: 'sky', art: 7 },
  { id: 'hush-hush', title: 'Hush Hush', artist: 'Fennec', artistId: 'fennec', album: 'Hush Hush', albumId: 'hush-hush', duration: 208, palette: 'night', art: 2 },

  // Polaris Club — Elevator Dreams
  { id: 'elevator-dreams', title: 'Elevator Dreams', artist: 'Polaris Club', artistId: 'polaris-club', album: 'Elevator Dreams', albumId: 'elevator-dreams', duration: 213, palette: 'lavender', art: 6 },
  { id: 'lobby', title: 'Lobby', artist: 'Polaris Club', artistId: 'polaris-club', album: 'Elevator Dreams', albumId: 'elevator-dreams', duration: 189, palette: 'cream', art: 1 },
  { id: 'mezzanine', title: 'Mezzanine', artist: 'Polaris Club', artistId: 'polaris-club', album: 'Elevator Dreams', albumId: 'elevator-dreams', duration: 254, palette: 'plum', art: 4 },

  // June Mora — Sunroom
  { id: 'sundial', title: 'Sundial', artist: 'June Mora', artistId: 'june-mora', album: 'Sunroom', albumId: 'sunroom', duration: 197, palette: 'peach', art: 5 },
  { id: 'terracotta', title: 'Terracotta', artist: 'June Mora', artistId: 'june-mora', album: 'Sunroom', albumId: 'sunroom', duration: 224, palette: 'cream', art: 0 },
  { id: 'long-shadow', title: 'Long Shadow', artist: 'June Mora', artistId: 'june-mora', album: 'Sunroom', albumId: 'sunroom', duration: 182, palette: 'blush', art: 3 },
];

export const artists: Artist[] = [
  {
    id: 'luna-vale',
    name: 'Luna Vale',
    tagline: 'Dream-pop for slow afternoons',
    monthly: 1204332,
    palette: 'lavender',
    art: 0,
    bio: 'Recorded mostly after midnight in a converted sunroom, Luna Vale makes patient, glowing songs about waiting rooms, warm light and the space between two thoughts. Slow Parade is her third record.',
    topTracks: ['slow-blink', 'stairwell-sun', 'paper-moon', 'landing-lights', 'feather'],
  },
  {
    id: 'sable-quiet',
    name: 'Sable & the Quiet',
    tagline: 'Small songs, soft landing',
    monthly: 842110,
    palette: 'night',
    art: 5,
    bio: 'A two-piece from a rainy coast. Guitar, brushed drums and a lot of restraint. Catnap was written in a week and mixed in a kitchen.',
    topTracks: ['moonlit-knead', 'catmilk', 'nightlight', 'warm-sock'],
  },
  {
    id: 'mira-chen',
    name: 'Mira Chen',
    tagline: 'Bedroom synth, big windows',
    monthly: 2110884,
    palette: 'peach',
    art: 7,
    bio: 'Mira writes pop songs that feel like a room with the curtains open. Glass Hour is her most direct record yet: nine tracks, no wasted seconds.',
    topTracks: ['peach-soda', 'daybed', 'glass-hour', 'winter-arcade'],
  },
  {
    id: 'low-ceiling',
    name: 'Low Ceiling',
    tagline: 'Ambient for the in-between',
    monthly: 512640,
    palette: 'ice',
    art: 2,
    bio: 'Long tones, field recordings and the hum of old buildings. Low Ceiling records live in one take, usually before sunrise.',
    topTracks: ['lint', 'marble', 'hallway-hum', 'room-tone'],
  },
  {
    id: 'velvet-static',
    name: 'Velvet Static',
    tagline: 'Loud soft, quiet loud',
    monthly: 947302,
    palette: 'blush',
    art: 1,
    bio: 'Fuzz pedals, high ceilings, a weakness for a good bridge. Milk Teeth is a six-song sprint.',
    topTracks: ['soft-teeth', 'milk-teeth', 'hairpin'],
  },
  {
    id: 'yuki-halo',
    name: 'Yuki Halo',
    tagline: 'Ceramics, choirs, weather',
    monthly: 1533870,
    palette: 'plum',
    art: 7,
    bio: 'Yuki builds songs from layered breath and close-mic’d piano. Ceramic Sky was recorded in a pottery studio with the windows open.',
    topTracks: ['moth-hour', 'hush', 'ceramic-sky', 'rain-on-tin'],
  },
  {
    id: 'nightjun',
    name: 'Nightjun',
    tagline: 'Tape loops for the night bus',
    monthly: 704992,
    palette: 'night',
    art: 3,
    bio: 'Nightjun makes instrumentals from cassette loops and late-night radio static. Blue Hour Tapes is best heard moving.',
    topTracks: ['purr-engine', 'blue-hour', 'night-bus', 'tape-hiss'],
  },
  {
    id: 'fennec',
    name: 'Fennec',
    tagline: 'Minimal folk, maximum quiet',
    monthly: 388204,
    palette: 'ice',
    art: 0,
    bio: 'One voice, one nylon guitar, a room with good reverb. Fennec’s songs arrive without knocking.',
    topTracks: ['cold-nose', 'paw-print', 'hush-hush'],
  },
  {
    id: 'polaris-club',
    name: 'Polaris Club',
    tagline: 'Lobby music with feelings',
    monthly: 601780,
    palette: 'lavender',
    art: 6,
    bio: 'Polaris Club treats the hotel lobby as a genre: soft carpets, brass, the sense that something is about to happen.',
    topTracks: ['elevator-dreams', 'lobby', 'mezzanine'],
  },
  {
    id: 'june-mora',
    name: 'June Mora',
    tagline: 'Warm songs for cold rooms',
    monthly: 1196200,
    palette: 'peach',
    art: 5,
    bio: 'June writes about sunlight on floors and people leaving slowly. Sunroom is her second album.',
    topTracks: ['sundial', 'terracotta', 'long-shadow'],
  },
];

export const albums: Album[] = [
  {
    id: 'slow-parade',
    title: 'Slow Parade',
    artist: 'Luna Vale',
    artistId: 'luna-vale',
    year: 2025,
    palette: 'lavender',
    art: 0,
    blurb: 'A patient, glowing record about waiting rooms and warm light. Recorded at home, mixed at night.',
    trackIds: ['slow-blink', 'stairwell-sun', 'paper-moon', 'feather', 'landing-lights', 'blue-chair'],
  },
  {
    id: 'catnap',
    title: 'Catnap',
    artist: 'Sable & the Quiet',
    artistId: 'sable-quiet',
    year: 2024,
    palette: 'night',
    art: 5,
    blurb: 'Five small songs for the soft part of the day. Guitars, brushes, rain on a window.',
    trackIds: ['moonlit-knead', 'catmilk', 'nightlight', 'warm-sock', 'drowsy'],
  },
  {
    id: 'glass-hour',
    title: 'Glass Hour',
    artist: 'Mira Chen',
    artistId: 'mira-chen',
    year: 2026,
    palette: 'peach',
    art: 7,
    blurb: 'Bedroom synth pop with big windows. Bright on the surface, tender underneath.',
    trackIds: ['peach-soda', 'daybed', 'glass-hour', 'winter-arcade'],
  },
  {
    id: 'room-tone',
    title: 'Room Tone',
    artist: 'Low Ceiling',
    artistId: 'low-ceiling',
    year: 2025,
    palette: 'ice',
    art: 2,
    blurb: 'Four long pieces built from the sound of empty rooms. Headphones recommended, distractions optional.',
    trackIds: ['lint', 'marble', 'hallway-hum', 'room-tone'],
  },
  {
    id: 'milk-teeth',
    title: 'Milk Teeth',
    artist: 'Velvet Static',
    artistId: 'velvet-static',
    year: 2023,
    palette: 'blush',
    art: 1,
    blurb: 'Six songs, fuzz pedals and a weakness for a good bridge. Loud soft, quiet loud.',
    trackIds: ['soft-teeth', 'milk-teeth', 'hairpin'],
  },
  {
    id: 'ceramic-sky',
    title: 'Ceramic Sky',
    artist: 'Yuki Halo',
    artistId: 'yuki-halo',
    year: 2024,
    palette: 'plum',
    art: 7,
    blurb: 'Layered breath, close piano, weather. Written in a pottery studio with the windows open.',
    trackIds: ['moth-hour', 'hush', 'ceramic-sky', 'rain-on-tin'],
  },
  {
    id: 'blue-hour-tapes',
    title: 'Blue Hour Tapes',
    artist: 'Nightjun',
    artistId: 'nightjun',
    year: 2025,
    palette: 'night',
    art: 3,
    blurb: 'Cassette loops and late-night static. Best heard moving, preferably in a window seat.',
    trackIds: ['purr-engine', 'blue-hour', 'night-bus', 'tape-hiss'],
  },
  {
    id: 'hush-hush',
    title: 'Hush Hush',
    artist: 'Fennec',
    artistId: 'fennec',
    year: 2026,
    palette: 'ice',
    art: 0,
    blurb: 'One voice, one nylon guitar, a room with good reverb. These songs arrive without knocking.',
    trackIds: ['cold-nose', 'paw-print', 'hush-hush'],
  },
  {
    id: 'elevator-dreams',
    title: 'Elevator Dreams',
    artist: 'Polaris Club',
    artistId: 'polaris-club',
    year: 2023,
    palette: 'lavender',
    art: 6,
    blurb: 'Lobby music with feelings. Soft carpets, brass, the sense that something is about to happen.',
    trackIds: ['elevator-dreams', 'lobby', 'mezzanine'],
  },
  {
    id: 'sunroom',
    title: 'Sunroom',
    artist: 'June Mora',
    artistId: 'june-mora',
    year: 2024,
    palette: 'peach',
    art: 5,
    blurb: 'Warm songs for cold rooms. Written about sunlight on floors and people leaving slowly.',
    trackIds: ['sundial', 'terracotta', 'long-shadow'],
  },
];

export const playlists: Playlist[] = [
  {
    id: 'late-night-purr',
    title: 'Late Night Purr',
    description: 'Slow tempos, soft edges. For the hours after the city goes quiet.',
    curator: 'Mewzak',
    palette: 'lavender',
    art: 5,
    updated: 'Updated today',
    trackIds: ['slow-blink', 'moonlit-knead', 'moth-hour', 'purr-engine', 'cold-nose', 'hush'],
  },
  {
    id: 'liked-songs',
    title: 'Liked Songs',
    description: 'Everything you tucked away. Kept warm.',
    curator: 'Mina',
    palette: 'plum',
    art: 3,
    updated: 'Updated recently',
    trackIds: ['slow-blink', 'moonlit-knead', 'peach-soda', 'moth-hour', 'daybed', 'cold-nose', 'sundial', 'hush'],
  },
  {
    id: 'sunday-loaf',
    title: 'Sunday Loaf',
    description: 'Nowhere to be. Nothing to prove. Just a warm windowsill and a good record.',
    curator: 'Mewzak',
    palette: 'cream',
    art: 4,
    updated: 'Updated yesterday',
    trackIds: ['peach-soda', 'sundial', 'catmilk', 'daybed', 'terracotta', 'long-shadow'],
  },
  {
    id: 'rainy-window',
    title: 'Rainy Window',
    description: 'The best excuse to stay in. Muted, humid, unhurried.',
    curator: 'Mewzak',
    palette: 'sky',
    art: 2,
    updated: 'Updated 3 days ago',
    trackIds: ['lint', 'cold-nose', 'hush', 'marble', 'rain-on-tin', 'night-bus'],
  },
  {
    id: 'focus-paws',
    title: 'Focus Paws',
    description: 'Steady, low-distraction music for deep work. No sudden movements.',
    curator: 'Mewzak',
    palette: 'ice',
    art: 0,
    updated: 'Updated last week',
    trackIds: ['marble', 'stairwell-sun', 'hallway-hum', 'blue-hour', 'tape-hiss', 'ceramic-sky'],
  },
  {
    id: 'soft-launch',
    title: 'Soft Launch',
    description: 'New songs with a gentle entrance. No alarms, no surprises.',
    curator: 'Mewzak',
    palette: 'blush',
    art: 1,
    updated: 'Updated today',
    trackIds: ['soft-teeth', 'peach-soda', 'milk-teeth', 'warm-sock', 'sundial', 'feather'],
  },
  {
    id: 'kitten-nap',
    title: 'Kitten Nap',
    description: 'Twenty minutes of nothing much. Set a timer, close one eye.',
    curator: 'Mewzak',
    palette: 'night',
    art: 6,
    updated: 'Updated 2 days ago',
    trackIds: ['catmilk', 'warm-sock', 'drowsy', 'daybed', 'moonlit-knead', 'long-shadow'],
  },
  {
    id: 'golden-hour-tail',
    title: 'Golden Hour Tail',
    description: 'Warm light, long shadows, the last good hour of the day.',
    curator: 'Mewzak',
    palette: 'peach',
    art: 7,
    updated: 'Updated 4 days ago',
    trackIds: ['sundial', 'terracotta', 'peach-soda', 'stairwell-sun', 'landing-lights', 'glass-hour'],
  },
  {
    id: 'cream-and-sugar',
    title: 'Cream & Sugar',
    description: 'Smooth, sweet, a little indulgent. One more song won’t hurt.',
    curator: 'Mewzak',
    palette: 'cream',
    art: 4,
    updated: 'Updated last week',
    trackIds: ['catmilk', 'peach-soda', 'soft-teeth', 'sundial', 'winter-arcade', 'milk-teeth'],
  },
];

export const moods = [
  { label: 'Late night', playlist: 'late-night-purr' },
  { label: 'Focus', playlist: 'focus-paws' },
  { label: 'Rainy', playlist: 'rainy-window' },
  { label: 'Sunday', playlist: 'sunday-loaf' },
  { label: 'Soft pop', playlist: 'soft-launch' },
  { label: 'Bedroom', playlist: 'kitten-nap' },
];

export const categories = [
  { name: 'Late night', icon: 'Moon', palette: 'night' as PaletteKey, playlist: 'late-night-purr' },
  { name: 'Focus', icon: 'Focus', palette: 'ice' as PaletteKey, playlist: 'focus-paws' },
  { name: 'Rainy days', icon: 'CloudRain', palette: 'sky' as PaletteKey, playlist: 'rainy-window' },
  { name: 'Soft pop', icon: 'Sparkles', palette: 'blush' as PaletteKey, playlist: 'soft-launch' },
  { name: 'Ambient', icon: 'Waves', palette: 'lavender' as PaletteKey, playlist: 'late-night-purr' },
  { name: 'Bedroom', icon: 'Bed', palette: 'plum' as PaletteKey, playlist: 'kitten-nap' },
  { name: 'Acoustic', icon: 'Music2', palette: 'cream' as PaletteKey, playlist: 'sunday-loaf' },
  { name: 'Piano', icon: 'Piano', palette: 'lavender' as PaletteKey, playlist: 'focus-paws' },
  { name: 'Lo-fi', icon: 'AudioLines', palette: 'peach' as PaletteKey, playlist: 'rainy-window' },
  { name: 'Road trip', icon: 'Car', palette: 'peach' as PaletteKey, playlist: 'golden-hour-tail' },
];

export const lyrics: Record<string, { t: number; line: string }[]> = {
  'slow-blink': [
    { t: 0, line: 'Streetlight hum, a slow blink' },
    { t: 10, line: 'You said the night could wait' },
    { t: 20, line: 'And I believed you then' },
    { t: 31, line: 'The kettle ticks, the floorboards lean' },
    { t: 43, line: 'We’re nowhere near the end' },
    { t: 55, line: 'So let the record turn' },
    { t: 67, line: 'Let the record turn' },
    { t: 78, line: 'I’ll take the long way home' },
    { t: 90, line: 'Past the windows, past the glow' },
    { t: 102, line: 'If you’re still up, I’ll call' },
    { t: 115, line: 'A slow blink, a slow parade' },
    { t: 128, line: 'The quiet is a place we made' },
    { t: 142, line: 'So let the record turn' },
    { t: 156, line: 'Let the record turn' },
    { t: 170, line: 'Nothing here is in a hurry' },
    { t: 184, line: 'Nothing here has to arrive' },
    { t: 198, line: 'A slow blink, a slow parade' },
    { t: 212, line: 'We’re doing fine' },
  ],
  'moonlit-knead': [
    { t: 0, line: 'The moon gets up before I do' },
    { t: 14, line: 'And kneads the dark into the room' },
    { t: 28, line: 'A little weight, a little warmth' },
    { t: 42, line: 'That’s all I need from you' },
    { t: 58, line: 'Soft steps down the hallway' },
    { t: 73, line: 'Soft landing on the bed' },
    { t: 88, line: 'The night is not my enemy' },
    { t: 103, line: 'It’s just a longer room' },
    { t: 120, line: 'Knead the dark, knead the dark' },
    { t: 138, line: 'Make a place to rest' },
    { t: 156, line: 'Knead the dark, knead the dark' },
    { t: 174, line: 'Then curl up in the quiet' },
    { t: 192, line: 'The moon gets up before I do' },
    { t: 210, line: 'And that’s okay' },
  ],
};

// ─── Derived lookups ─────────────────────────────────────────────────────────

export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t])) as Record<string, Track>;
export const artistById = Object.fromEntries(artists.map((a) => [a.id, a])) as Record<string, Artist>;
export const albumById = Object.fromEntries(albums.map((a) => [a.id, a])) as Record<string, Album>;
export const playlistById = Object.fromEntries(playlists.map((p) => [p.id, p])) as Record<string, Playlist>;

export const queueSeed: string[] = [...playlists[0].trackIds];

// ─── Live catalogue ───────────────────────────────────────────────────────────
// The design studio boots with the fictional Phase 1 catalogue above. The
// product boots by replacing these same collections with real, attributed
// source data, so every Phase 1 screen reads the live catalogue without a
// second parallel data model. This is deliberately a whole-catalogue swap.

export type Catalogue = {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
};

function replaceLookup<T>(lookup: Record<string, T>, items: T[], key: (item: T) => string) {
  for (const id of Object.keys(lookup)) delete lookup[id];
  for (const item of items) lookup[key(item)] = item;
}

export function installCatalogue(next: Catalogue) {
  tracks.splice(0, tracks.length, ...next.tracks);
  artists.splice(0, artists.length, ...next.artists);
  albums.splice(0, albums.length, ...next.albums);
  playlists.splice(0, playlists.length, ...next.playlists);
  replaceLookup(trackById, tracks, (item) => item.id);
  replaceLookup(artistById, artists, (item) => item.id);
  replaceLookup(albumById, albums, (item) => item.id);
  replaceLookup(playlistById, playlists, (item) => item.id);
  queueSeed.splice(0, queueSeed.length, ...(playlists[0]?.trackIds ?? []));
}

export function mergeSourceCatalogue(next: Partial<Catalogue>) {
  const newTracks = (next.tracks ?? []).filter((item) => !trackById[item.id]);
  if (newTracks.length) tracks.push(...newTracks);
  for (const item of newTracks) trackById[item.id] = item;

  for (const artist of next.artists ?? []) {
    if (!artistById[artist.id]) artists.push(artist);
    artistById[artist.id] = artist;
  }
  for (const album of next.albums ?? []) {
    if (!albumById[album.id]) albums.push(album);
    albumById[album.id] = album;
  }
  return newTracks;
}

export function setLikedPlaylist(ids: string[], curator = 'You') {
  const playlist = playlistById['liked-songs'];
  if (!playlist) return;
  playlist.trackIds = ids;
  playlist.curator = curator;
  playlist.updated = ids.length ? 'Kept warm' : 'Nothing saved yet';
  playlist.image = ids.length ? trackById[ids[0]]?.image : undefined;
}

export function upsertPlaylist(playlist: Playlist) {
  const index = playlists.findIndex((item) => item.id === playlist.id);
  if (index >= 0) playlists.splice(index, 1, playlist);
  else playlists.push(playlist);
  playlistById[playlist.id] = playlist;
}

export function removePlaylist(id: string) {
  const index = playlists.findIndex((item) => item.id === id);
  if (index >= 0) playlists.splice(index, 1);
  delete playlistById[id];
}

export function displayNameFor(name: string): { name: string; initials: string } {
  const clean = name.trim() || 'Listener';
  const initials = clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return { name: clean, initials: initials || 'M' };
}

export function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function totalTime(ids: string[]): number {
  return ids.reduce((sum, id) => sum + (trackById[id]?.duration ?? 0), 0);
}

export function totalLabel(ids: string[]): string {
  const total = totalTime(ids);
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

export function albumYear(albumId: string): number {
  return albumById[albumId]?.year ?? 2026;
}
