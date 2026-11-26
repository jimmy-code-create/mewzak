/**
 * MEWZAK PHASE 2 — every editable string lives here.
 * Tone: warm, confident, quietly funny. No fake social proof, ratings or awards.
 * Replace values here; no component owns product copy.
 */

export const ACCOUNT = {
  name: 'Mina Park',
  handle: '@mewmina',
  email: 'mina@mewzak.app',
  plan: 'Mewzak Soft · trial',
};

export const MIN_AGE = 13;

export const ONBOARDING_SLIDES = [
  {
    eyebrow: 'A quieter listen',
    title: 'Music that lowers its voice.',
    body: 'A player for slow evenings, clean windows, and the songs you keep almost to yourself.',
  },
  {
    eyebrow: 'Your room, your tempo',
    title: 'Nothing here is in a hurry.',
    body: 'No shouting carousels. No algorithmic rush. Just the next right song, and then the one after it.',
  },
  {
    eyebrow: 'A little purr in the machine',
    title: 'Built soft. Kept warm.',
    body: 'Warm surfaces, clear controls, and a cat who knows exactly when to leave the room.',
  },
];

export const SIGN_IN = {
  eyebrow: 'Welcome back',
  title: 'Sign in.',
  body: 'Pick up your queue, your saves and the playlists that already know your name.',
  google: 'Continue with Google',
  phone: 'Continue with phone number',
  localTitle: 'A room of your own.',
  localBody: 'No account, no cloud. Your profile and library stay on this device.',
  localCta: 'Continue on this device',
  localNote: 'You can add an account and sync later. Nothing leaves this device today.',
  localWelcomeNote: 'No account needed. Your library stays on this device.',
  divider: 'or',
  socialHeading: 'Phase 1 providers',
  social: [
    { id: 'google', label: 'Google' },
    { id: 'phone', label: 'Phone' },
  ],
  legal: 'By continuing you agree to keep your paws to yourself. Demo only — no data leaves this page.',
};

export const AUTH_LOADING = {
  title: 'Opening your room',
  body: 'Finding your saves and warming the lamps.',
  working: 'working on it',
};

export const BIRTHDAY = {
  eyebrow: 'A small formality',
  title: 'When did the purring start?',
  body: 'We use your birthday to keep the room age-appropriate. Nothing else.',
  day: 'Day',
  month: 'Month',
  year: 'Year',
  continue: 'Continue',
  invalid: `You’ll need to be ${MIN_AGE} or older to come in.`,
  valid: 'That works. The door is warm.',
  legalPrefix: 'By continuing you agree to our',
  privacy: 'Privacy Note',
  and: 'and',
  terms: 'Listening Terms',
  legalSuffix: '.',
};

export const CREATE_PROFILE = {
  eyebrow: 'Make yourself at home',
  title: 'What should we call you?',
  body: 'Your name is how the room says hello. You can change it later.',
  label: 'Your name',
  placeholder: 'Mina Park',
  photo: 'Change profile photo',
  continue: 'Continue',
  saving: 'Saving',
  handleHint: 'Your corner will live at',
};

export const READY = {
  eyebrow: 'One last stretch',
  title: 'You’re in. Let’s make it feel like yours.',
  body: 'A few familiar faces are already here. We’ll keep the door open for the rest.',
  avatarLine: 'You, Luna and Yuki are already in the room.',
  cta: 'I’m ready',
  skip: 'Skip',
};

export const VIBE = {
  eyebrow: 'Tune the room',
  title: 'What does your quiet sound like?',
  body: 'Pick as many as you like. We’ll use them to soften the edges, not to box you in.',
  cta: 'Continue',
  saving: 'Setting the room',
  none: 'No genres yet — that’s allowed.',
  genres: [
    'pop',
    'rock',
    'alternative',
    'latin',
    'trap',
    'phonk',
    'math rock',
    'gospel',
    'indie pop',
    'classical',
    'k-pop',
    'psychedelic',
    'experimental',
    'blues',
    'reggae',
    'ambient',
    'lo-fi',
    'punk',
    'indie',
    'sad',
    'folk',
    'dance',
    'j-pop',
    'funk',
    'jazz',
    'r&b',
    'edm',
    'country',
    'hip hop',
    'electronic',
    'metal',
  ],
};

export const PROFILE = {
  edit: 'Edit',
  editTitle: 'Edit your corner',
  editBody: 'A name, a handle, and a picture. That’s plenty.',
  save: 'Save changes',
  saving: 'Saving',
  cancel: 'Cancel',
  completeTitle: 'Complete your profile',
  completeStep: 'step 1 of 4',
  completeBody: 'A little more about your taste, and the room will start to feel like yours.',
  creatorsTitle: 'People worth keeping close',
  creatorsBody: 'A few artists from your library. Follow or wave them on.',
  follow: 'Follow',
  following: 'Following',
  dismiss: 'Dismiss creator',
  shelfTitle: 'Your shelf',
  shelfBody: 'The things you already saved, with a little more breathing room.',
  tabs: ['Liked', 'Playlists', 'Following'],
  emptyTitle: 'A very tidy shelf.',
  emptyBody: 'Follow someone or save a song, and it will land here.',
  emptyAction: 'Find your next purr',
  cta: 'Find your next purr',
  skeletons: 'Warming the shelves',
  genresLabel: 'Your room sounds like',
  noGenres: 'Still deciding',
  replay: 'Replay onboarding',
  menu: 'More',
  liked: 'Liked songs',
  playlists: 'Playlists',
  settings: 'Settings',
  signOut: 'Sign out',
  saved: 'Profile saved. Very you.',
  followed: 'Following. Lovely choice.',
  dismissed: 'Noted. More room for the rest.',
  working: 'working on it',
  ready: 'All set',
  allSet: 'Your corner is ready',
};

export const SHELL = {
  home: 'Home',
  search: 'Search',
  library: 'Library',
  player: 'Player',
  profile: 'Profile',
  searchPlaceholder: 'Search songs, artists, playlists',
  searchHint: 'A name, a mood, a half-remembered line.',
  searchEmptyTitle: 'Nothing in that drawer.',
  searchEmptyBody: 'Try a different spelling, or let the room suggest something.',
  homeEyebrow: 'Tuesday · 9:41 pm',
  homeTitle: 'Good evening, Mina.',
  homeBody: 'The city is quiet. So is the queue.',
  homeContinue: 'Continue listening',
  homeOpenPlayer: 'Open player',
  homeForYou: 'Made for your kind of quiet',
  homeRecent: 'Back where you left off',
  libraryTitle: 'Your shelf',
  libraryBody: 'Saves, playlists and the people you keep an ear on.',
  libraryLiked: 'Liked songs',
  libraryPlaylists: 'Playlists',
  libraryArtists: 'Following',
  playerNow: 'Now playing',
  playerQueue: 'Up next',
  playerLyrics: 'Lyrics',
  playerMore: 'More',
  playAll: 'Play all',
  open: 'Open',
  likedCount: 'saved',
  songs: 'songs',
  resultsTracks: 'Songs',
  resultsArtists: 'Artists',
  resultsPlaylists: 'Playlists',
  noGenres: 'Your room is still taking shape.',
  collapsedSidebar: 'Expand sidebar',
  expandedSidebar: 'Collapse sidebar',
  downloadTitle: 'Get Mewzak',
  downloadBody: 'One room, four ways in. Choose your machine.',
  downloadFootnote: 'Design preview only — installers ship with Phase 3.',
  downloadLabel: 'Download',
};

export const TOASTS = {
  promote: 'Following. The room gets warmer.',
  pip: 'Player tucked into the corner.',
  resume: 'Back where you left off.',
  queued: 'Queued. Patience, kitten.',
};

export const LEGAL = {
  privacyTitle: 'Privacy Note',
  privacyBody:
    'This is a design prototype. Nothing is uploaded, stored on a server or shared. The name, birthday and genres you enter can stay in this browser so a half-finished setup resumes.',
  termsTitle: 'Listening Terms',
  termsBody:
    'Be kind to small artists, keep the volume humane, and remember that a queue is a suggestion with manners. This prototype has no commercial terms.',
};

export const DOWNLOAD_PLATFORMS = [
  {
    id: 'macos',
    label: 'macOS',
    detail: 'Apple silicon · desktop preview',
    kind: 'desktop' as const,
  },
  {
    id: 'windows',
    label: 'Windows',
    detail: 'Windows 11 · desktop preview',
    kind: 'desktop' as const,
  },
  {
    id: 'ios',
    label: 'iOS',
    detail: 'iPhone · mobile preview',
    kind: 'mobile' as const,
  },
  {
    id: 'android',
    label: 'Android',
    detail: 'Android · mobile preview',
    kind: 'mobile' as const,
  },
];

export const dateMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
