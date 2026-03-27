import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface PaginatedDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
}

export function usePaginatedData<T = any>(
  tableName: string,
  pageSize: number = 25,
  orderBy: string = 'created_at',
  ascending: boolean = false
): PaginatedDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;

      setTotalCount(count || 0);

      const dataQuery = supabase
        .from(tableName)
        .select('*')
        .order(orderBy, { ascending })
        .range(from, to);

      const { data: fetchedData, error: dataError } = await dataQuery;

      if (dataError) throw dataError;

      setData(fetchedData || []);
    } catch (err) {
      console.error('Error fetching paginated data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [tableName, pageSize, orderBy, ascending, page, refreshTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    nextPage,
    prevPage,
    goToPage,
    refresh
  };
}
