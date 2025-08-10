import { useState, useCallback, useRef } from 'react';
import { isEqual } from 'lodash';

// React 19-style useOptimistic hook implementation for React 18
export function useOptimisticState<T>(
  initialState: T,
  updateFn: (currentState: T, optimisticValue: T) => T
) {
  const [state, setState] = useState<T>(initialState);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const optimisticRef = useRef<T>(initialState);
  const rollbackRef = useRef<T>(initialState);

  const addOptimistic = useCallback((optimisticValue: T) => {
    // Store the current state for potential rollback
    rollbackRef.current = state;
    
    // Apply optimistic update
    const newState = updateFn(state, optimisticValue);
    optimisticRef.current = newState;
    setState(newState);
    setIsOptimistic(true);
  }, [state, updateFn]);

  const commit = useCallback((finalValue?: T) => {
    if (finalValue) {
      setState(finalValue);
    }
    setIsOptimistic(false);
    rollbackRef.current = finalValue || optimisticRef.current;
  }, []);

  const rollback = useCallback(() => {
    setState(rollbackRef.current);
    setIsOptimistic(false);
  }, []);

  return {
    state,
    isOptimistic,
    addOptimistic,
    commit,
    rollback,
  };
}

// Enhanced version with automatic rollback on error
export function useOptimisticStateWithErrorHandling<T, E = Error>(
  initialState: T,
  updateFn: (currentState: T, optimisticValue: T) => T,
  options?: {
    timeout?: number;
    onError?: (error: E) => void;
    equalityFn?: (a: T, b: T) => boolean;
  }
) {
  const { timeout = 5000, onError, equalityFn = isEqual } = options || {};
  const [error, setError] = useState<E | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    state,
    isOptimistic,
    addOptimistic: baseAddOptimistic,
    commit: baseCommit,
    rollback: baseRollback,
  } = useOptimisticState(initialState, updateFn);

  const addOptimistic = useCallback((optimisticValue: T) => {
    setError(null);
    baseAddOptimistic(optimisticValue);
    
    // Auto-rollback after timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        baseRollback();
        const timeoutError = new Error('Optimistic update timed out') as E;
        setError(timeoutError);
        onError?.(timeoutError);
      }, timeout);
    }
  }, [baseAddOptimistic, baseRollback, timeout, onError]);

  const commit = useCallback((finalValue?: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    baseCommit(finalValue);
    setError(null);
  }, [baseCommit]);

  const rollback = useCallback((errorValue?: E) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    baseRollback();
    if (errorValue) {
      setError(errorValue);
      onError?.(errorValue);
    }
  }, [baseRollback, onError]);

  return {
    state,
    isOptimistic,
    error,
    addOptimistic,
    commit,
    rollback,
  };
}