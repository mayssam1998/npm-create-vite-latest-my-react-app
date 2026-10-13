/**
 * In-browser stand-in for the backend. It plugs in at the transport level, so apiClient,
 * the *.api.ts functions, Zod parsing, query keys and cancellation all run exactly as they
 * will against the real server. Delete this folder (and VITE_USE_MOCKS) when the API exists.
 */
import { setApiTransport } from '@/shared/lib/apiClient';
import { handleCasesRequest } from './handlers/casesHandlers';

const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 700;
const API_PREFIX = /^\/api/;

/** Set `localStorage['insightx.mock.fail'] = '1'` to make every request fail — for testing error states. */
const FAILURE_FLAG_KEY = 'insightx.mock.fail';

function shouldFail() {
  try {
    return window.localStorage.getItem(FAILURE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/** Simulated network latency that honours AbortSignal, like a real in-flight request. */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timeoutId = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function mockTransport(request: Request) {
  await wait(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS), request.signal);
  if (shouldFail()) return json({ message: 'Simulated server error' }, 500);

  const url = new URL(request.url);
  const result = handleCasesRequest(request.method, url.pathname.replace(API_PREFIX, ''), url.searchParams);
  return result ? json(result.body, result.status) : json({ message: 'Not found' }, 404);
}

export function startMockServer() {
  setApiTransport(mockTransport);
}
