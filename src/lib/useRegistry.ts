import { useCallback, useState } from 'react';

/**
 * A keyed set of requests that child components register with a parent, which then
 * lays them out or summarizes them together (curve labels, axis values, result rows).
 * Re-registering an identical request is a no-op, so children can register from
 * layout effects without causing render loops.
 */
export function useRegistry<T>(): [
  ReadonlyMap<string, T>,
  (id: string, request: T | null) => void,
] {
  const [requests, setRequests] = useState<ReadonlyMap<string, T>>(() => new Map());
  const register = useCallback((id: string, request: T | null) => {
    setRequests((previous) => {
      if (request === null) {
        if (!previous.has(id)) return previous;
        const next = new Map(previous);
        next.delete(id);
        return next;
      }
      const existing = previous.get(id);
      if (existing && JSON.stringify(existing) === JSON.stringify(request)) return previous;
      return new Map(previous).set(id, request);
    });
  }, []);
  return [requests, register];
}
