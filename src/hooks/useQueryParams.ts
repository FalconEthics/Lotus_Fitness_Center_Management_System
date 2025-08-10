import { useState, useCallback, useEffect, useMemo } from 'react';
import { isEqual, pickBy } from 'lodash';

// React 19-style query parameter management
export function useQueryParams<T extends Record<string, string | number | boolean | undefined>>(
  initialParams: T,
  options?: {
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
    replace?: boolean; // Use replaceState instead of pushState
  }
) {
  const { serialize, deserialize, replace = false } = options || {};

  // Get initial state from URL or use provided initial params
  const [params, setParams] = useState<T>(() => {
    if (typeof window === 'undefined') return initialParams;
    
    const urlParams = new URLSearchParams(window.location.search);
    const parsedParams = { ...initialParams };
    
    Object.keys(initialParams).forEach((key) => {
      const value = urlParams.get(key);
      if (value !== null) {
        if (deserialize) {
          (parsedParams as any)[key] = deserialize(value);
        } else {
          // Auto-detect type based on initial value
          const initialValue = initialParams[key];
          if (typeof initialValue === 'boolean') {
            (parsedParams as any)[key] = value === 'true';
          } else if (typeof initialValue === 'number') {
            (parsedParams as any)[key] = Number(value) || initialValue;
          } else {
            (parsedParams as any)[key] = value;
          }
        }
      }
    });
    
    return parsedParams;
  });

  // Update URL when params change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams();
    
    // Only include non-empty values
    const cleanParams = pickBy(params, (value) => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      !(typeof value === 'boolean' && !value)
    );
    
    Object.entries(cleanParams).forEach(([key, value]) => {
      if (serialize) {
        urlParams.set(key, serialize(value));
      } else {
        urlParams.set(key, String(value));
      }
    });
    
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    
    if (newUrl !== window.location.pathname + window.location.search) {
      if (replace) {
        window.history.replaceState({}, '', newUrl);
      } else {
        window.history.pushState({}, '', newUrl);
      }
    }
  }, [params, serialize, replace]);

  const updateParams = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    setParams((prev) => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      const newParams = { ...prev, ...newUpdates };
      
      // Don't update if nothing changed
      if (isEqual(prev, newParams)) {
        return prev;
      }
      
      return newParams;
    });
  }, []);

  const resetParams = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  const clearParams = useCallback(() => {
    setParams({} as T);
  }, []);

  return {
    params,
    updateParams,
    resetParams,
    clearParams,
  };
}

// Specialized hook for modal state management via URL
export function useModalQuery(modalKey: string = 'modal') {
  const { params, updateParams } = useQueryParams({
    [modalKey]: undefined as string | undefined,
  });

  const isOpen = useMemo(() => Boolean(params[modalKey]), [params, modalKey]);
  const modalId = params[modalKey];

  const openModal = useCallback((id: string) => {
    updateParams({ [modalKey]: id } as any);
  }, [updateParams, modalKey]);

  const closeModal = useCallback(() => {
    updateParams({ [modalKey]: undefined } as any);
  }, [updateParams, modalKey]);

  return {
    isOpen,
    modalId,
    openModal,
    closeModal,
  };
}

// Specialized hook for search and filter state
export function useSearchAndFilterQuery<T extends Record<string, any>>(
  initialFilters: T
) {
  const { params, updateParams, resetParams } = useQueryParams({
    search: '',
    ...initialFilters,
  });

  const updateSearch = useCallback((search: string) => {
    updateParams({ search } as any);
  }, [updateParams]);

  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    updateParams({ [key]: value } as any);
  }, [updateParams]);

  const updateFilters = useCallback((filters: Partial<T>) => {
    updateParams(filters as any);
  }, [updateParams]);

  const clearSearch = useCallback(() => {
    updateParams({ search: '' } as any);
  }, [updateParams]);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(initialFilters).reduce((acc, key) => {
      acc[key] = initialFilters[key];
      return acc;
    }, {} as T);
    updateParams({ search: '', ...clearedFilters } as any);
  }, [updateParams, initialFilters]);

  return {
    searchTerm: params.search,
    filters: Object.fromEntries(
      Object.entries(params).filter(([key]) => key !== 'search')
    ) as T,
    updateSearch,
    updateFilter,
    updateFilters,
    clearSearch,
    clearFilters,
    resetAll: resetParams,
  };
}