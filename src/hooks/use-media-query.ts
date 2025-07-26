
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if window is defined for SSR
    if (typeof window !== 'undefined') {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => {
            setMatches(media.matches);
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }
  }, [matches, query]);

  return matches;
}
