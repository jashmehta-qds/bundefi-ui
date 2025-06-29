import { getProtocols } from '@/lib/services';
import type { Protocol } from '@/types/protocols';
import { useEffect, useState } from 'react';

interface UseProtocolsResult {
  protocols: Protocol[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useProtocols(): UseProtocolsResult {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProtocols();
      setProtocols(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch protocols'));
      console.error('Error fetching protocols:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  return {
    protocols,
    loading,
    error,
    refetch: fetchProtocols,
    lastUpdated,
  };
} 