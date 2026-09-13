import { useEffect, useRef } from "react";

type UseExternalValueSyncOptions<T> = {
  /** The externally controlled value. */
  value: T;
  /** Applies an externally changed value to the internal state. */
  apply: (value: T) => void | Promise<void>;
  /** Determines whether the external value differs from
   the current internal value. Defaults to `Object.is`. */
  isEqual?: (a: T, b: T|undefined) => boolean;
};

type UseExternalValueSyncResult<T> = {
  /** Indicates whether the initial external value is currently being synchronized with internally tracked value. */
  isInitialSync: React.RefObject<boolean>;
  /** Updates the internally tracked value. */
  updateFromInternal: (value: T) => void;
};

/**
 * Synchronizes an externally controlled value with an internally managed state.
 *
 * Useful for components that maintain their own mutable state while exposing
 * a controlled `value` and `onChange` API. It prevents values emitted by the
 * component itself from being unnecessarily applied back to the internal state
 * when the parent re-renders with the updated value.
 */
export function useExternalValueSync<T>({
  value,
  apply,
  isEqual = Object.is
}: UseExternalValueSyncOptions<T>): UseExternalValueSyncResult<T> {
  const currentValueRef = useRef<T>(undefined);
  const isInitialSyncRef = useRef(true);


  useEffect(() => {
    if (isEqual(value, currentValueRef.current)) {
      return;
    }

    const isInitial = currentValueRef.current === undefined;

    currentValueRef.current = value;

    if (isInitial) {
      isInitialSyncRef.current = true;
    }

    apply(value)

    if (isInitial) {
      setTimeout(() => isInitialSyncRef.current = false, 0);
    }

  }, [value, apply, isEqual]);

  const updateFromInternal = (newValue: T) => {
    currentValueRef.current = newValue;
  };

  return {
    isInitialSync: isInitialSyncRef,
    updateFromInternal
  };
}