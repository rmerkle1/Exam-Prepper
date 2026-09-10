import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { IsoScene } from '../three/IsoScene.js';

const GameBoard = forwardRef(function GameBoard({
  quest,
  pieces,
  revealedTiles,
  reachableTiles,
  attackablePieces,
  rangedAttackablePieces,
  onTileClick,
  onTileHover,
}, ref) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  // Expose scene methods to parent via ref
  useImperativeHandle(ref, () => ({
    setIntentPath: (heroId, path, destX, destY, color) =>
      sceneRef.current?.setIntentPath(heroId, path, destX, destY, color),
    clearIntentPath: (heroId) => sceneRef.current?.clearIntentPath(heroId),
    clearAllIntentPaths: () => sceneRef.current?.clearAllIntentPaths(),
    addTrapMarker: (id, x, y) => sceneRef.current?.addTrapMarker(id, x, y),
    removeTrapMarker: (id) => sceneRef.current?.removeTrapMarker(id),
    revealSecretDoor: (x, y) => sceneRef.current?.revealSecretDoor(x, y),
  }));

  // Init scene once
  useEffect(() => {
    const scene = new IsoScene(canvasRef.current);
    sceneRef.current = scene;
    return () => scene.destroy();
  }, []);

  // Build board + fog when quest loads
  useEffect(() => {
    if (!sceneRef.current || !quest) return;
    sceneRef.current.buildBoard(quest);
    sceneRef.current.buildFog(quest);
  }, [quest]);

  // Reveal fog tiles
  useEffect(() => {
    if (!sceneRef.current || !revealedTiles) return;
    sceneRef.current.updateFog(revealedTiles);
  }, [revealedTiles]);

  // Sync pieces
  useEffect(() => {
    if (!sceneRef.current || !pieces) return;
    const scene = sceneRef.current;
    const existingIds = new Set(scene.pieceMeshes.keys());
    const currentIds = new Set(pieces.map(p => p.id));

    existingIds.forEach(id => {
      if (!currentIds.has(id)) scene.removePiece(id);
    });

    pieces.forEach(p => {
      if (p.isDead) {
        scene.removePiece(p.id);
        return;
      }
      if (!existingIds.has(p.id)) {
        scene.addPiece(p);
      } else {
        scene.movePiece(p.id, p.x, p.y);
      }
    });
  }, [pieces]);

  // Highlights
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    scene.clearHighlights();
    if (reachableTiles?.length) scene.setHighlights(reachableTiles, 'reachable');
    if (attackablePieces?.length) scene.setHighlights(attackablePieces.map(p => ({ x: p.x, y: p.y })), 'attack');
    if (rangedAttackablePieces?.length) scene.setHighlights(rangedAttackablePieces.map(p => ({ x: p.x, y: p.y })), 'ranged');
  }, [reachableTiles, attackablePieces, rangedAttackablePieces]);

  // Event handlers — update without re-mounting
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current._onClickHandlers = onTileClick ? [onTileClick] : [];
    sceneRef.current._onHoverHandlers = onTileHover ? [onTileHover] : [];
  }, [onTileClick, onTileHover]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
    />
  );
});

export default GameBoard;
