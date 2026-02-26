"use client";

/**
 * GridContainer - PixiJS-based volumetric inventory grid
 * Supports drag, rotate, collision detection, and nested containers
 */

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import type { Item, InventorySlot } from "@/types";
import { checkCollision, getRotatedDimensions, snapToGrid } from "@/lib/inventory/gridEngine";

interface GridContainerProps {
  slot: InventorySlot;
  items: Item[];
  cellSize?: number;
  onItemMove?: (itemId: string, x: number, y: number) => void;
  onItemRotate?: (itemId: string, rotation: number) => void;
  onItemSelect?: (itemId: string | null) => void;
}

export function GridContainer({
  slot,
  items,
  cellSize = 40,
  onItemMove,
  onItemRotate,
  onItemSelect,
}: GridContainerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{
    item: Item;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const gridWidth = slot.gridWidth * cellSize;
  const gridHeight = slot.gridHeight * cellSize;

  const handleItemClick = (item: Item) => {
    setSelectedItemId(item.id === selectedItemId ? null : item.id);
    onItemSelect?.(item.id === selectedItemId ? null : item.id);
  };

  const handleItemDoubleClick = (item: Item) => {
    if (!item.itemDefinition) return;
    
    const newRotation = (item.rotation + 90) % 360;
    onItemRotate?.(item.id, newRotation);
  };

  const CONTAINER_OFFSET = 10; // Container is offset by 10px

  const handleMouseDown = (item: Item, event: PIXI.FederatedPointerEvent) => {
    if (!item.gridX || !item.gridY || !item.itemDefinition) return;
    
    // Convert global coordinates to container-local coordinates
    const containerX = event.global.x - CONTAINER_OFFSET;
    const containerY = event.global.y - CONTAINER_OFFSET;
    
    const itemWorldX = item.gridX * cellSize;
    const itemWorldY = item.gridY * cellSize;
    
    setDraggingItem({
      item,
      offsetX: containerX - itemWorldX,
      offsetY: containerY - itemWorldY,
    });
    setSelectedItemId(item.id);
  };

  const handleMouseMove = (event: PIXI.FederatedPointerEvent) => {
    if (!draggingItem) {
      setHoverPosition({ x: event.global.x, y: event.global.y });
      return;
    }

    // Convert global coordinates to container-local coordinates
    const containerX = event.global.x - CONTAINER_OFFSET;
    const containerY = event.global.y - CONTAINER_OFFSET;

    // Calculate item position accounting for offset
    const itemX = containerX - draggingItem.offsetX;
    const itemY = containerY - draggingItem.offsetY;

    // Snap to grid
    const snapped = snapToGrid(itemX, itemY, cellSize);

    // Convert back to global coordinates for display
    setHoverPosition({ 
      x: snapped.x * cellSize + CONTAINER_OFFSET, 
      y: snapped.y * cellSize + CONTAINER_OFFSET 
    });
  };

  const handleMouseUp = () => {
    if (!draggingItem || !hoverPosition) {
      setDraggingItem(null);
      return;
    }

    // Convert hover position back to container-local coordinates
    const containerX = hoverPosition.x - CONTAINER_OFFSET;
    const containerY = hoverPosition.y - CONTAINER_OFFSET;

    // Snap to grid (already in pixel coordinates, need to convert to grid)
    const snapped = snapToGrid(containerX, containerY, cellSize);
    
    const result = checkCollision(
      items.filter((i) => i.id !== draggingItem.item.id),
      draggingItem.item,
      snapped.x,
      snapped.y,
      draggingItem.item.rotation,
      slot.gridWidth,
      slot.gridHeight,
      draggingItem.item.id
    );

    if (result.canPlace) {
      onItemMove?.(draggingItem.item.id, snapped.x, snapped.y);
    }

    setDraggingItem(null);
    setHoverPosition(null);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const containerRef = useRef<PIXI.Container | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PixiJS application
    const app = new PIXI.Application();
    app.init({
      canvas: canvasRef.current,
      width: gridWidth + 20,
      height: gridHeight + 20,
      backgroundColor: 0x1a1a1a,
      antialias: true,
    });

    appRef.current = app;

    // Create main container
    const container = new PIXI.Container();
    container.x = 10;
    container.y = 10;
    app.stage.addChild(container);
    containerRef.current = container;

    // Cleanup
    return () => {
      app.destroy(true);
    };
  }, [gridWidth, gridHeight]);

  useEffect(() => {
    if (!containerRef.current) return;

    updatePixiContainer(
      containerRef.current,
      slot,
      items,
      cellSize,
      selectedItemId,
      draggingItem,
      hoverPosition,
      handleItemClick,
      handleItemDoubleClick,
      handleMouseDown
    );
  }, [
    slot,
    items,
    cellSize,
    selectedItemId,
    draggingItem,
    hoverPosition,
    handleItemClick,
    handleItemDoubleClick,
    handleMouseDown,
  ]);

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{slot.name}</h3>
      <div
        onMouseMove={(e) => {
          if (!appRef.current || !canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const globalX = e.clientX - rect.left;
          const globalY = e.clientY - rect.top;
          handleMouseMove({
            global: { x: globalX, y: globalY },
          } as PIXI.FederatedPointerEvent);
        }}
        onMouseUp={handleMouseUp}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// Update PixiJS container with grid and items
function updatePixiContainer(
  container: PIXI.Container,
  slot: InventorySlot,
  items: Item[],
  cellSize: number,
  selectedItemId: string | null,
  draggingItem: { item: Item; offsetX: number; offsetY: number } | null,
  hoverPosition: { x: number; y: number } | null,
  onItemClick: (item: Item) => void,
  onItemDoubleClick: (item: Item) => void,
  onItemMouseDown: (item: Item, event: PIXI.FederatedPointerEvent) => void
) {
  // Clear existing children
  container.removeChildren();

  // Create grid background
  const gridBg = new PIXI.Graphics();
  
  // Draw grid lines
  gridBg.setStrokeStyle({ width: 1, color: 0x333333, alpha: 0.5 });
  for (let x = 0; x <= slot.gridWidth; x++) {
    gridBg.moveTo(x * cellSize, 0);
    gridBg.lineTo(x * cellSize, slot.gridHeight * cellSize);
  }
  for (let y = 0; y <= slot.gridHeight; y++) {
    gridBg.moveTo(0, y * cellSize);
    gridBg.lineTo(slot.gridWidth * cellSize, y * cellSize);
  }
  
  // Draw background
  gridBg.rect(0, 0, slot.gridWidth * cellSize, slot.gridHeight * cellSize);
  gridBg.fill({ color: 0x0a0a0a, alpha: 0.8 });
  
  container.addChild(gridBg);

  // Create item sprites
  items.forEach((item) => {
    if (draggingItem?.item.id === item.id) return;
    if (!item.itemDefinition) return;

    const { width, height } = getRotatedDimensions(
      item.itemDefinition.gridWidth,
      item.itemDefinition.gridHeight,
      item.rotation
    );

    const displayX = (item.gridX ?? 0) * cellSize;
    const displayY = (item.gridY ?? 0) * cellSize;
    const itemWidth = width * cellSize;
    const itemHeight = height * cellSize;
    const isSelected = selectedItemId === item.id;

    // Item container
    const itemContainer = new PIXI.Container();
    itemContainer.x = displayX;
    itemContainer.y = displayY;
    itemContainer.interactive = true;
    itemContainer.cursor = "pointer";

    // Item background
    const itemBg = new PIXI.Graphics();
    itemBg.setStrokeStyle({ 
      width: 2, 
      color: isSelected ? 0x60a5fa : 0x4b5563, 
      alpha: 1 
    });
    itemBg.roundRect(0, 0, itemWidth, itemHeight, 4);
    itemBg.fill({ color: isSelected ? 0x4a9eff : 0x374151, alpha: 1 });
    itemContainer.addChild(itemBg);

    // Item text
    const itemText = new PIXI.Text({
      text: item.itemDefinition.name,
      style: {
        fontSize: 10,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: itemWidth - 8,
      },
    });
    itemText.x = 4;
    itemText.y = 4;
    itemContainer.addChild(itemText);

    // Event handlers
    itemContainer.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
      onItemMouseDown(item, e);
    });
    itemContainer.on("click", () => {
      onItemClick(item);
    });
    itemContainer.on("dblclick", () => {
      onItemDoubleClick(item);
    });

    container.addChild(itemContainer);
  });

  // Dragging item preview
  if (draggingItem && hoverPosition && draggingItem.item.itemDefinition) {
    const { width, height } = getRotatedDimensions(
      draggingItem.item.itemDefinition.gridWidth,
      draggingItem.item.itemDefinition.gridHeight,
      draggingItem.item.rotation
    );

    const itemWidth = width * cellSize;
    const itemHeight = height * cellSize;

    const dragContainer = new PIXI.Container();
    // Convert hover position (global) to container-local coordinates
    const CONTAINER_OFFSET = 10;
    dragContainer.x = hoverPosition.x - CONTAINER_OFFSET;
    dragContainer.y = hoverPosition.y - CONTAINER_OFFSET;
    dragContainer.alpha = 0.7;

    const dragBg = new PIXI.Graphics();
    dragBg.setStrokeStyle({ width: 2, color: 0x4b5563, alpha: 1 });
    dragBg.roundRect(0, 0, itemWidth, itemHeight, 4);
    dragBg.fill({ color: 0x6b7280, alpha: 1 });
    dragContainer.addChild(dragBg);

    const dragText = new PIXI.Text({
      text: draggingItem.item.itemDefinition.name,
      style: {
        fontSize: 10,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: itemWidth - 8,
      },
    });
    dragText.x = 4;
    dragText.y = 4;
    dragContainer.addChild(dragText);

    container.addChild(dragContainer);
  }
}
