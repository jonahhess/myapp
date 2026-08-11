import { useCallback, useEffect, useRef, useState } from "react";
import { getUserFriendlyErrorMessage } from "../utils/errors";

export default function useAsyncListResource({
  fetcher,
  mapItems,
  errorMessage = "Failed to load data.",
  clearItemsOnError = false,
  enabled = true,
}) {
  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const mapItemsRef = useRef(mapItems);
  const errorMessageRef = useRef(errorMessage);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetcherRef.current = fetcher;
    mapItemsRef.current = mapItems;
    errorMessageRef.current = errorMessage;
  }, [errorMessage, fetcher, mapItems]);

  const reload = useCallback(async () => {
    if (!enabled) {
      return [];
    }

    if (isMountedRef.current) {
      setIsLoading(true);
      setLoadError("");
    }

    try {
      const payload = await fetcherRef.current();
      const nextItems = mapItemsRef.current(payload);
      if (isMountedRef.current) {
        setItems(nextItems);
      }
      return nextItems;
    } catch (error) {
      if (clearItemsOnError && isMountedRef.current) {
        setItems([]);
      }

      if (isMountedRef.current) {
        setLoadError(
          getUserFriendlyErrorMessage(error, errorMessageRef.current),
        );
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clearItemsOnError, enabled]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return () => {
        isMountedRef.current = false;
      };
    }

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
  }, [enabled, reload]);

  return {
    items,
    setItems,
    isLoading: enabled ? isLoading : false,
    errorMessage: loadError,
    setErrorMessage: setLoadError,
    reload,
  };
}
