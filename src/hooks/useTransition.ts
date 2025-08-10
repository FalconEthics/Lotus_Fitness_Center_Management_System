import { useState, useCallback, useRef, startTransition } from 'react';

// Enhanced useTransition with additional features
export function useEnhancedTransition() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startEnhancedTransition = useCallback((
    callback: () => void | Promise<void>,
    options?: {
      timeout?: number;
      onStart?: () => void;
      onComplete?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const { timeout = 10000, onStart, onComplete, onError } = options || {};
    
    setIsPending(true);
    setError(null);
    onStart?.();

    // Set timeout for transition
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        const timeoutError = new Error('Transition timed out');
        setError(timeoutError);
        setIsPending(false);
        onError?.(timeoutError);
      }, timeout);
    }

    startTransition(async () => {
      try {
        await callback();
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        setIsPending(false);
        onComplete?.();
      } catch (err) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsPending(false);
        onError?.(error);
      }
    });
  }, []);

  const cancelTransition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPending(false);
    setError(null);
  }, []);

  return {
    isPending,
    error,
    startTransition: startEnhancedTransition,
    cancelTransition,
  };
}

// Specialized hook for form submissions
export function useFormTransition() {
  const { isPending, error, startTransition, cancelTransition } = useEnhancedTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = useCallback(async (
    submitFn: () => Promise<void>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const { onSuccess, onError } = options || {};
    
    startTransition(
      async () => {
        setIsSubmitting(true);
        await submitFn();
        setIsSubmitting(false);
        onSuccess?.();
      },
      {
        timeout: 30000, // 30 seconds for form submission
        onError: (error) => {
          setIsSubmitting(false);
          onError?.(error);
        },
      }
    );
  }, [startTransition]);

  return {
    isPending,
    isSubmitting,
    error,
    submitForm,
    cancelSubmission: cancelTransition,
  };
}