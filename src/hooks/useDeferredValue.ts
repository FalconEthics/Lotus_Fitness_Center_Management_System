import { useState, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

// React 19-style useDeferredValue implementation for React 18
export function useDeferredValue<T>(value: T, delay: number = 100): T {
  const [deferredValue, setDeferredValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return deferredValue;
}

// Enhanced version with debouncing using Lodash
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const debouncedUpdate = useMemo(
    () => debounce((newValue: T) => setDebouncedValue(newValue), delay, options),
    [delay, options]
  );

  useEffect(() => {
    debouncedUpdate(value);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [value, debouncedUpdate]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return debouncedValue;
}

// Specialized hook for search queries
export function useSearchQuery(
  query: string,
  delay: number = 300
): {
  deferredQuery: string;
  isSearching: boolean;
} {
  const [isSearching, setIsSearching] = useState(false);
  const deferredQuery = useDebouncedValue(query, delay);

  useEffect(() => {
    setIsSearching(query !== deferredQuery);
  }, [query, deferredQuery]);

  return {
    deferredQuery,
    isSearching,
  };
}