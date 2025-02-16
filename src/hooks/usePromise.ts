import { useEffect, useRef, useState } from "react";

type UsePromiseResult<T> = {
  /** Indicates whether the promise is currently pending. */
  isLoading: boolean;
  /** Holds the error if the promise rejects. Undefined if no error occurred. */
  error?: Error;
  /** Stores the resolved value of the promise if successful. Undefined while loading or on error. */
  result?: T;
};

type Props<T> = {
  /** Function that returns a promise. It executes on mount and when `dependencies` change. */
  asyncFn: () => Promise<T>;
  /** Callback function that runs when the promise resolves successfully. */
  onResolve: (data: T) => unknown;
  /** Dependencies array that determines when to re-run `asyncFn`. */
  dependencies: unknown[];
};

/**
 * Custom hook to handle async promises with state tracking.
 *
 * Note: Re-executes when `dependencies` change.
 */
const usePromise = <T>({
  asyncFn,
  dependencies,
  onResolve,
}: Props<T>): UsePromiseResult<T> => {
  const [state, setState] = useState<UsePromiseResult<T>>({ isLoading: true });

  const promiseRef = useRef<Promise<T> | null>(null);
  const prevDepsRef = useRef<unknown[] | null>(null);

  useEffect(() => {
    const cleanupFn = () => {
      if (prevDepsRef.current != dependencies) {
        promiseRef.current = null;
      }
    };
    if (promiseRef.current) return cleanupFn;

    setState({ isLoading: true });
    const promise = asyncFn();
    promiseRef.current = promise;
    promise
      .then((result) => {
        setState({ result, isLoading: false });
        onResolve(result);
      })
      .catch((error) => setState({ error, isLoading: false }));

    prevDepsRef.current = dependencies;

    return cleanupFn;
  }, [asyncFn, dependencies, onResolve]);

  return state;
};

export default usePromise;
