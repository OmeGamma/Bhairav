import { useState, useEffect, useCallback, useRef } from 'react';
import type { DependencyList } from 'react';
import type { ApiResponse } from '../api/client';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: DependencyList = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const depsRef = useRef(deps);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    depsRef.current = deps;
  }, [deps]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.error);
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...depsRef.current]);

  return { data, loading, error, refetch: execute };
}