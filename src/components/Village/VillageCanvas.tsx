import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { RenderState, VillageRenderer } from './renderer';

export interface VillageCanvasHandle {
  burst: (key: string, color: string) => void;
  float: (key: string, text: string, color: string) => void;
  floatCenter: (text: string, color: string) => void;
  fitToContent: () => void;
}

interface Props {
  render: RenderState;
  onHover: (key: string | null) => void;
  onClickTile: (key: string) => void;
  /** Clicked somewhere that is not a tile at all. */
  onClickAway: () => void;
  onRightClickTile: (key: string) => void;
}

const VillageCanvas = React.forwardRef<VillageCanvasHandle, Props>(
  ({ render, onHover, onClickTile, onClickAway, onRightClickTile }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<VillageRenderer | null>(null);
    const dragRef = useRef({ active: false, moved: 0, x: 0, y: 0 });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const renderer = new VillageRenderer(canvas);
      rendererRef.current = renderer;
      renderer.start();

      const onResize = () => renderer.resize();
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        renderer.stop();
        rendererRef.current = null;
      };
    }, []);

    useEffect(() => {
      rendererRef.current?.setState(render);
    }, [render]);

    useImperativeHandle(ref, () => ({
      burst: (key, color) => rendererRef.current?.burstAt(key, color),
      float: (key, text, color) => rendererRef.current?.floatText(key, text, color),
      floatCenter: (text, color) => rendererRef.current?.floatTextAtCenter(text, color),
      fitToContent: () => rendererRef.current?.fitToContent(),
    }));

    const localPoint = (event: React.MouseEvent | React.WheelEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      dragRef.current = { active: true, moved: 0, x: event.clientX, y: event.clientY };
    }, []);

    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        const renderer = rendererRef.current;
        if (!renderer) return;

        if (dragRef.current.active) {
          const dx = event.clientX - dragRef.current.x;
          const dy = event.clientY - dragRef.current.y;
          dragRef.current.moved += Math.abs(dx) + Math.abs(dy);
          dragRef.current.x = event.clientX;
          dragRef.current.y = event.clientY;
          renderer.pan(dx, dy);
        }

        const point = localPoint(event);
        onHover(renderer.hexAtScreen(point.x, point.y));
      },
      [onHover]
    );

    const endDrag = useCallback(() => {
      dragRef.current.active = false;
    }, []);

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        // Ignore the click that ends a camera drag.
        if (dragRef.current.moved > 6) return;
        const renderer = rendererRef.current;
        if (!renderer) return;
        const point = localPoint(event);
        const key = renderer.hexAtScreen(point.x, point.y);
        if (key) onClickTile(key);
        else onClickAway();
      },
      [onClickTile, onClickAway]
    );

    const handleContextMenu = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        const renderer = rendererRef.current;
        if (!renderer) return;
        const point = localPoint(event);
        const key = renderer.hexAtScreen(point.x, point.y);
        if (key) onRightClickTile(key);
      },
      [onRightClickTile]
    );

    // Wheel zoom is registered natively so it can be non-passive.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        rendererRef.current?.zoomAt(
          event.deltaY < 0 ? 1.12 : 1 / 1.12,
          event.clientX - rect.left,
          event.clientY - rect.top
        );
      };
      canvas.addEventListener('wheel', onWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="village-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          endDrag();
          onHover(null);
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    );
  }
);

VillageCanvas.displayName = 'VillageCanvas';

export default VillageCanvas;
