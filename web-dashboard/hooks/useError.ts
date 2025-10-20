import { useState, useCallback } from "react";

interface UseErrorReturn {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (err: unknown) => void;
}

/**
 * Custom hook for consistent error handling across components
 * @returns Error state and handler functions
 */
export const useError = (): UseErrorReturn => {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  }, []);

  return {
    error,
    setError,
    clearError,
    handleError,
  };
};

export default useError;
