import { useCallback, useEffect, useRef, useState } from "react";
import { getUserFriendlyErrorMessage } from "../utils/errors";

export default function useAsyncMutation({
  defaultErrorMessage = "Action failed.",
} = {}) {
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (task, { onSuccess, onError, onFinally, errorMessage } = {}) => {
      if (isPendingRef.current) {
        return undefined;
      }

      isPendingRef.current = true;
      if (isMountedRef.current) {
        setIsPending(true);
      }

      try {
        const result = await task();
        await onSuccess?.(result);
        return result;
      } catch (error) {
        const message = getUserFriendlyErrorMessage(
          error,
          errorMessage || defaultErrorMessage,
        );
        await onError?.(error, message);
        throw error;
      } finally {
        isPendingRef.current = false;
        if (isMountedRef.current) {
          setIsPending(false);
        }
        await onFinally?.();
      }
    },
    [defaultErrorMessage],
  );

  return {
    isPending,
    run,
  };
}