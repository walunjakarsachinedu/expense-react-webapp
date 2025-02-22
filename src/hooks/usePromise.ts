import { useEffect, useRef, useState, useCallback } from "react";

type UsePromiseResult<T> = {
  /** Indicates whether the promise is currently pending. */
  isLoading: boolean;
  /** Holds the error if the promise rejects. Undefined if no error occurred. */
  error?: Error;
  /** Stores the resolved value of the promise if successful. Undefined while loading or on error. */
  result?: T;
  /** Function to manually trigger the promise execution (useful for mutations). */
  run: () => void;
};

type Props<T> = {
  /** Function that returns a promise. It executes on mount and when `dependencies` change, unless `manual` is `true`. */
  asyncFn: () => Promise<T>;
  /** Callback function that runs when the promise resolves successfully. */
  onResolve?: (data: T) => unknown;
  /** Dependencies array that determines when to re-run `asyncFn`. */
  dependencies?: unknown[];
  /** If `true`, the promise does not execute automatically; must be triggered manually via `run`. */
  manual?: boolean;
};

/**
 * Custom hook to handle async promises with state tracking.
 *
 * Note: By default, re-executes when `dependencies` change.
 * If `manual` is `true`, execution must be triggered manually via `run`.
 */
const usePromise = <T>({
  asyncFn,
  dependencies = [],
  onResolve,
  manual = false,
}: Props<T>): UsePromiseResult<T> => {
  const [state, setState] = useState<Omit<UsePromiseResult<T>, "run">>({
    isLoading: !manual,
  });
  const prevDepsRef = useRef<unknown[] | null>(null);

  /** Executes the async function and updates state accordingly. */
  const execute = useCallback(() => {
    setState({ isLoading: true });
    asyncFn()
      .then((result) => {
        setState({ result, isLoading: false });
        onResolve?.(result);
      })
      .catch((error) => setState({ error, isLoading: false }));
  }, [asyncFn, onResolve]);

  useEffect(() => {
    if (
      !manual &&
      JSON.stringify(prevDepsRef.current) !== JSON.stringify(dependencies)
    ) {
      execute();
      prevDepsRef.current = dependencies;
    }
  }, [dependencies, execute, manual]);

  return { ...state, run: execute };
};

export default usePromise;
