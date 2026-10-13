/**
 * The one configured HTTP client. Nothing else in the app calls `fetch`.
 * Auth is not specified yet (see .claude/rules/open-questions.md), so no header is attached.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];
export type QueryParams = Record<string, QueryValue>;

/** Sends a prepared request. Swapped for the in-browser mock server while there is no backend. */
export type ApiTransport = (request: Request) => Promise<Response>;

let transport: ApiTransport = (request) => fetch(request);

export function setApiTransport(next: ApiTransport) {
  transport = next;
}

/** Every non-2xx response becomes an ApiError, so callers handle one error shape. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, params: QueryParams = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method: string, path: string, { params, body, signal }: RequestOptions) {
  const headers = new Headers({ Accept: 'application/json' });
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await transport(
    new Request(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    }),
  );

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, `${method} ${path} failed with ${response.status}`, data);
  }
  return data;
}

export const apiClient = {
  get: (path: string, options: Omit<RequestOptions, 'body'> = {}) => request('GET', path, options),
  post: (path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}) =>
    request('POST', path, { ...options, body }),
  put: (path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}) =>
    request('PUT', path, { ...options, body }),
  delete: (path: string, options: Omit<RequestOptions, 'body'> = {}) => request('DELETE', path, options),
};
