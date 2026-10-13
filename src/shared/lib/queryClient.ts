import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiClient';

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: Error) {
  // A 4xx will not fix itself; only retry network failures and 5xx.
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

// staleTime is set per query, deliberately — see .claude/rules/api-layer.md.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry },
  },
});
