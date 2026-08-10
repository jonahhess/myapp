import { useCallback, useEffect, useRef, useState } from "react";
import { getUserFriendlyErrorMessage } from "../utils/errors";

export default function useAsyncListResource({
  fetcher,
  mapItems,
  errorMessage = "Failed to load data.",
  clearItemsOnError = false,
}) {
  const isMountedRef = useRef(true);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const reload = useCallback(async () => {
    if (isMountedRef.current) {
      setIsLoading(true);
      setLoadError("");
    }

    try {
      const payload = await fetcher();
      const nextItems = mapItems(payload);
      if (isMountedRef.current) {
        setItems(nextItems);
      }
      return nextItems;
    } catch (error) {
      if (clearItemsOnError && isMountedRef.current) {
        setItems([]);
      }

      if (isMountedRef.current) {
        setLoadError(getUserFriendlyErrorMessage(error, errorMessage));
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clearItemsOnError, errorMessage, fetcher, mapItems]);

  useEffect(() => {
    isMountedRef.current = true;

    const load = async () => {
      try {
        await reload();
      } catch {
        // Error state is already captured in reload.
      }
    };

    load();

    return () => {
      isMountedRef.current = false;
    };
  }, [reload]);

  return {
    items,
    setItems,
    isLoading,
    errorMessage: loadError,
    setErrorMessage: setLoadError,
    reload,
  };
}
