# Heavy visual modules — graph, map, timeline

Sigma, MapLibre, deck.gl and the D3 timeline are **not React components**. They are
imperative libraries that own a piece of the DOM. Treat them that way and they are fast;
treat them like React and they will fight you.

## The wrapper pattern — every heavy visualisation follows it

1. A React component renders one empty `<div ref={containerRef} dir="ltr" />` and nothing
   else.
2. A `useEffect` with an **empty dependency array** creates the instance and returns a
   cleanup that destroys it.
3. The instance is held in a `useRef`, **never in state**. Putting a Sigma instance in
   `useState` re-renders the tree on every change.
4. Data and settings changes are pushed in **imperatively** from separate effects or from a
   `useImperativeHandle` method — never by re-creating the instance.
5. Events from the library are converted into React callbacks (`onNodeSelect`,
   `onViewportChange`) and handed up. They do not reach into the app state directly.

## Hard constraints

- **One graph instance and one map instance alive at a time.** Browsers allow 8–16 WebGL
  contexts. Unmount means destroy, every time, no exceptions. A missing cleanup here is not
  a leak — it is a crash.
- **`dir="ltr"` on every canvas container**, even in Arabic. RTL on a map container breaks
  panning direction.
- **Pin deck.gl and MapLibre versions exactly**, and use deck.gl in overlaid mode.
- **Graphology results describe the loaded subgraph only.** Any UI that shows a path,
  centrality or "no connection found" must say it refers to the loaded graph. Global
  questions go to the server. *This is a correctness rule, not a performance one, and it is
  the most important rule in this section.*
- **The timeline switches SVG → Canvas above ~2,000 markers.**

Wrap each one in its own error boundary. A WebGL failure should take down a panel, not the
application.

Graph library choice (Sigma.js vs Cytoscape) is still open — see `open-questions.md`.

Recipe: the `canvas-library-wrapper` skill. Feature-specific graph and map skills are
deliberately **not** written yet — write them from the real code when those modules land.
