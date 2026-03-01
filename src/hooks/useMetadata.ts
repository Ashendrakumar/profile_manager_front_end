/**
 * useMetadata Hook
 * Custom hook to manage page metadata (title and meta tags)
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setPageMetadata, resetPageMetadata } from '@/utils/metadata';
import type { PageMetadata } from '@/utils/metadata';

/**
 * Custom hook to set page metadata
 * Automatically updates metadata when route changes
 */
export const useMetadata = (metadata?: PageMetadata): void => {
  const location = useLocation();

  useEffect(() => {
    if (metadata) {
      setPageMetadata(metadata);
    } else {
      resetPageMetadata();
    }

    // Cleanup: reset metadata when component unmounts
    return () => {
      resetPageMetadata();
    };
  }, [location.pathname, metadata]);
};
