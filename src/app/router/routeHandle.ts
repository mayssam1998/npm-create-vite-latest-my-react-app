/** Static data attached to a route via `handle`, read by the header to title the page. */
export interface RouteHandle {
  /** Key in the `common` namespace. */
  titleKey: string;
}

export function isRouteHandle(handle: unknown): handle is RouteHandle {
  return typeof handle === 'object' && handle !== null && 'titleKey' in handle && typeof handle.titleKey === 'string';
}
