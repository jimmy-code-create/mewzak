export type CopyLine = { context: string; text: string; note?: string };
export type CopyGroup = { id: string; title: string; blurb: string; lines: CopyLine[] };

/**
 * The Mewzak microcopy sheet. Every line in the product lives here so voice can
 * be reviewed in one place and ported to ARB / Localizable.strings in phase 2.
 *
 * Voice rules: short, soft, a little cheeky. Never pun inside a playback
 * control or a destructive confirmation. Pun in toasts, empty states, loading
 * and errors. No line blocks the user from finishing a task.
 */
export const copyGroups: CopyGroup[] = [
  {
    id: 'onboarding',
    title: 'Onboarding',
    blurb: 'Warm, brief, and finished in three taps. The mascot carries the charm so the copy can stay plain.',
    lines: [
      { context: 'Welcome headline', text: 'Mewzak.', note: 'The wordmark does the work; no exclamation mark.' },
      { context: 'Welcome subline', text: 'Music with soft paws.' },
      { context: 'Welcome CTA', text: 'Start purring' },
      { context: 'Taste step headline', text: 'Make it yours.' },
      { context: 'Taste step subline', text: 'Pick a few moods. We’ll do the rest.' },
      { context: 'Taste step CTA', text: 'That’s me' },
      { context: 'Ready headline', text: 'You’re all set.' },
      { context: 'Ready subline', text: 'Your ears are in good paws.' },
      { context: 'Ready CTA', text: 'Take me home' },
      { context: 'Skip link', text: 'Skip for now' },
      { context: 'Too many moods', text: 'Three is plenty. Add more later.' },
    ],
  },
  {
    id: 'toasts',
    title: 'Toasts',
    blurb: 'One line, under 50 characters where possible. A toast never carries information the user needs to finish a task.',
    lines: [
      { context: 'Added to queue', text: 'Queued. Patience, kitten.' },
      { context: 'Play next', text: 'Up next. Cutting the line, politely.' },
      { context: 'Liked', text: 'Saved. Very purr-sonal.' },
      { context: 'Unliked', text: 'Removed. No hard feelings.' },
      { context: 'Link copied', text: 'Copied. Share the mewsic.' },
      { context: 'Followed artist', text: 'Following. Whiskers on the pulse.' },
      { context: 'Unfollowed', text: 'Unfollowed. We’ll keep it quiet.' },
      { context: 'Playlist created', text: 'New playlist. Empty, for now.' },
      { context: 'Downloaded', text: 'Downloaded. Paws off the Wi-Fi.' },
      { context: 'Download removed', text: 'Undownloaded. The cloud has it.' },
      { context: 'Shuffle on', text: 'Shuffled. Order is a suggestion.' },
      { context: 'Queue cleared', text: 'Queue cleared. Fresh start.' },
      { context: 'Offline playback', text: 'Offline — playing from your cache.' },
      { context: 'Sleep timer', text: 'Snoozing playback in 30 minutes.' },
      { context: 'Cache cleared', text: 'Cache cleared. All clean.' },
      { context: 'Signed out', text: 'Sessions cleared. Come back soon.' },
    ],
  },
  {
    id: 'empty',
    title: 'Empty states',
    blurb: 'Two lines maximum: what happened, then a gentle way forward. Mascot appears here — nowhere near the transport.',
    lines: [
      { context: 'Library, no playlists', text: 'Your library is quiet. Save an album or start a playlist. We’ll keep it warm.' },
      { context: 'Downloads empty', text: 'Nothing downloaded. Fetch some music for the tunnel.' },
      { context: 'Search, no results', text: 'No matches. Cats are picky; we’re not.' },
      { context: 'Queue empty', text: 'Nothing’s next. A perfect time for a catnap.' },
      { context: 'Lyrics unavailable', text: 'No lyrics for this one. Hum along.' },
      { context: 'Notifications empty', text: 'All quiet. Even the bell is napping.' },
      { context: 'No listening history', text: 'Press play — we’ll take notes.' },
      { context: 'No followed artists', text: 'No one followed yet. Find a sound you trust.' },
    ],
  },
  {
    id: 'loading',
    title: 'Loading',
    blurb: 'Shown only after 400 ms of waiting. The UI stays usable and the skeleton matches the final layout.',
    lines: [
      { context: 'Home refresh', text: 'Warming up the purr…' },
      { context: 'App launch', text: 'Tuning the whiskers…' },
      { context: 'Search', text: 'Sniffing around…' },
      { context: 'Lyrics sync', text: 'Finding the words…' },
      { context: 'Queue sync', text: 'Herding the queue…' },
      { context: 'Library sync', text: 'Dusting the shelves…' },
      { context: 'Generic', text: 'One moment. We’re on soft paws.' },
    ],
  },
  {
    id: 'errors',
    title: 'Errors',
    blurb: 'No red, no blame, always a retry. Say what happened, then what to do. Peach carries the error accent.',
    lines: [
      { context: 'Generic failure', text: 'Something knocked the record player over. Try again?' },
      { context: 'Playback failed', text: 'That track slipped away. Tap to retry.' },
      { context: 'Offline', text: 'No signal. Cached tracks still purr.' },
      { context: 'Search failed', text: 'Search tripped over its tail. Retry?' },
      { context: 'Lyrics failed', text: 'Lyrics are napping. Try again soon.' },
      { context: 'Couldn’t save playlist', text: 'Couldn’t save. Your playlist is safe on this device.' },
      { context: 'Expired sign-in link', text: 'That link expired. One more time?' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & confirmations',
    blurb: 'Explain the effect, not the mechanic. Non-destructive confirmations stay single-tap.',
    lines: [
      { context: 'Reduced transparency', text: 'Turn off blur for maximum clarity.' },
      { context: 'Toe-bean pause', text: 'A little paw on the pause button.' },
      { context: 'Crossfade', text: 'Let tracks overlap. No abrupt landings.' },
      { context: 'Autoplay', text: 'Keep the music going after an album ends.' },
      { context: 'Download over Wi-Fi only', text: 'Save data. Download when you’re home.' },
      { context: 'Clear cache', text: 'Clears artwork and lyrics, not downloads.' },
      { context: 'Sign out', text: 'Sign out on this device?' },
      { context: 'Sign out confirmation', text: 'Sessions cleared. Come back soon.' },
      { context: 'Reset settings', text: 'Settings back to defaults. Paws clean.' },
    ],
  },
  {
    id: 'controls',
    title: 'Controls & tooltips',
    blurb: 'Playback controls never get a pun in the visible label. The toe-bean is the one visual easter egg.',
    lines: [
      { context: 'Play / pause', text: 'Play' },
      { context: 'Pause tooltip', text: 'Pawse' },
      { context: 'Next', text: 'Next track' },
      { context: 'Previous', text: 'Previous track' },
      { context: 'Shuffle', text: 'Shuffle' },
      { context: 'Repeat', text: 'Repeat' },
      { context: 'Lyrics', text: 'Lyrics' },
      { context: 'Queue', text: 'Queue' },
      { context: 'Volume', text: 'Volume' },
      { context: 'More', text: 'More options' },
    ],
  },
];

export const voiceDos = [
  'Keep it under one breath.',
  'Let the mascot be cute so the UI can be plain.',
  'Name the action, then the feeling.',
  'Say sorry once, then offer the way out.',
];

export const voiceDonts = [
  'Pun inside Play, Pause, Delete or Pay.',
  'More than one exclamation mark per screen.',
  'Cat puns that need explaining.',
  'Baby talk in errors or billing.',
];
