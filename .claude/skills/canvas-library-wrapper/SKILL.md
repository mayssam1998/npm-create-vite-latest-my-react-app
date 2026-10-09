---
name: canvas-library-wrapper
description: Wrap an imperative canvas or WebGL library in React — Sigma, Cytoscape, MapLibre, deck.gl, or a D3 timeline. Use when building a map, graph, link analysis view, timeline or any canvas visualisation. Produces the ref + empty-deps + cleanup wrapper, the single-instance rule, imperative updates and dir="ltr" containers.
---

# Wrap a canvas / WebGL library

> Written from the architecture document before the graph and map modules existed. These
> are the two highest-risk workstreams — write feature-specific graph and map skills from
> the real code when those modules land, and leave this one as the general pattern.

Rules: `.claude/rules/heavy-visual-modules.md`.

Sigma, MapLibre, deck.gl and the D3 timeline are **not React components**. They are
imperative libraries that own a piece of the DOM. Treat them that way and they are fast;
treat them like React and they will fight you.

## The pattern

1. The React component renders **one empty `<div ref={containerRef} dir="ltr" />`** and
   nothing else.
2. A `useEffect` with an **empty dependency array** creates the instance and returns a
   cleanup that destroys it.
3. The instance lives in a `useRef`, **never in state**.
4. Data and settings changes are pushed in **imperatively** from separate effects or a
   `useImperativeHandle` method — never by re-creating the instance.
5. Library events become React callbacks (`onNodeSelect`, `onViewportChange`) handed up.
   They never reach into app state directly.

## Template

```tsx
interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect: (nodeId: string) => void;
}

export interface GraphCanvasHandle {
  fitToView: () => void;
  reset: () => void;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas({ nodes, edges, onNodeSelect }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<Sigma | null>(null);
    const onNodeSelectRef = useRef(onNodeSelect);
    onNodeSelectRef.current = onNodeSelect;   // latest callback without re-creating

    // 1. create once, destroy on unmount — empty deps, always a cleanup
    useEffect(() => {
      const instance = new Sigma(new Graph(), containerRef.current!, SIGMA_SETTINGS);
      instance.on('clickNode', ({ node }) => onNodeSelectRef.current(node));
      instanceRef.current = instance;

      return () => {
        instance.kill();            // unmount means destroy. No exceptions.
        instanceRef.current = null;
      };
    }, []);

    // 2. data changes are pushed in imperatively
    useEffect(() => {
      const instance = instanceRef.current;
      if (!instance) return;
      applyGraphData(instance.getGraph(), nodes, edges);
      instance.refresh();
    }, [nodes, edges]);

    useImperativeHandle(ref, () => ({
      fitToView: () => instanceRef.current?.getCamera().animatedReset(),
      reset: () => instanceRef.current?.getGraph().clear(),
    }), []);

    // 3. dir="ltr" even in Arabic — RTL breaks panning
    return <div ref={containerRef} dir="ltr" className="h-full w-full" />;
  },
);
```

Mount it behind an error boundary and a lazy import:

```tsx
const GraphCanvas = lazy(() => import('../components/GraphCanvas'));

<ErrorBoundary fallback={<VisualisationErrorState />}>
  <Suspense fallback={<CanvasSkeleton />}>
    <GraphCanvas {...props} />
  </Suspense>
</ErrorBoundary>
```

## Hard constraints

- **One graph instance and one map instance alive at a time.** Browsers allow 8–16 WebGL
  contexts. A missing cleanup here is not a leak — it is a crash.
- **`dir="ltr"` on every canvas container**, even in Arabic.
- **Pin deck.gl and MapLibre versions exactly**; use deck.gl in overlaid mode.
- **Graphology results describe the loaded subgraph only.** Any UI showing a path,
  centrality or "no connection found" must say it refers to the *loaded* graph. Global
  questions go to the server. **This is a correctness rule and the most important one
  here.**
- **The timeline switches SVG → Canvas above ~2,000 markers.**
- Each visualisation gets its **own error boundary** — a WebGL failure takes down a panel,
  not the app.

## Do not

- Put the instance in `useState`.
- Re-create the instance when data or settings change.
- Render React children inside the canvas container.
- Omit the cleanup, or return it conditionally.
- Let a library event mutate a Zustand store directly from inside the wrapper.
- Ship the library in the entry chunk.

`useMemo` **is** warranted here: settings objects and layer arrays passed to these
libraries compare by reference. That is one of the four exceptions in
`.claude/rules/performance.md`.

Sigma.js vs Cytoscape is not decided — see `.claude/rules/open-questions.md`.
