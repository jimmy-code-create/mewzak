import { useEffect, useMemo, useRef, useState } from 'react';
import { mergeSourceCatalogue, type Track } from '../data';
import { useApp } from '../store';
import { buildCatalogue, searchTracks } from './source';

export type SearchState = {
  results: Track[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  source: 'audius' | 'local';
};

/**
 * Debounced search against the one music source. Results are merged into the
 * shared catalogue before they are shown, so a result can be played, liked,
 * queued or opened without a second lookup path.
 */
export function useSourceSearch(query: string, enabled: boolean): SearchState {
  const { mode, recordSearch } = useApp();
  const term = query.trim();
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const seenSearch = useRef('');

  useEffect(() => {
    if (!enabled || mode !== 'product' || term.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      searchTracks(term, controller.signal)
        .then(({ tracks, sources }) => {
          if (controller.signal.aborted) return;
          if (!tracks.length) {
            setResults([]);
            return;
          }
          const catalogue = buildCatalogue(tracks, sources);
          mergeSourceCatalogue({
            tracks: catalogue.tracks,
            artists: catalogue.artists,
            albums: catalogue.albums,
          });
          setResults(catalogue.tracks);
          if (seenSearch.current !== term.toLowerCase()) {
            seenSearch.current = term.toLowerCase();
            recordSearch(term);
          }
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setError(reason instanceof Error ? reason.message : 'Search is unavailable right now.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, mode, term, attempt, recordSearch]);

  return useMemo(
    () => ({
      results,
      loading,
      error,
      retry: () => setAttempt((value) => value + 1),
      source: mode === 'product' ? 'audius' : 'local',
    }),
    [results, loading, error, mode],
  );
}
