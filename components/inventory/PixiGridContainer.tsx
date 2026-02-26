"use client";

/**
 * PixiGridContainer - Tarkov-style volumetric inventory grid
 * Premium video-game feel with 60fps PixiJS rendering
 * Features: Drag, rotate (R key/right-click), collision detection, nested containers
 */

import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import type { InventoryContainer, GURPSItem } from "@/types/gurps";
import { checkCollision, getRotatedDimensions, snapToGrid } from "@/lib/inventory/gridEngine";
import { useInventoryStore } from "@/lib/stores/inventoryStore";

interface PixiGridContainerProps {
  container: InventoryContainer;
  cellSize?: number;
}

export function PixiGridContainer({ container, cellSize = 40 }: PixiGridContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const containerRef = useRef<PIXI.Container | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{
    item: GURPSItem;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const moveItem = useInventoryStore((state) => state.moveItem);
  const rotateItem = useInventoryStore((state) => state.rotateItem);
  const setSelectedItem = useInventoryStore((state) => state.setSelectedItem);

  const CONTAINER_OFFSET = 10;
  const gridWidth = container.gridWidth * cellSize;
  const gridHeight = container.gridHeight * cellSize;

  // Initialize PixiJS
  useEffect(() => {
    if (!canvasRef.current) return;

    let app: PIXI.Application | null = null;
    let isMounted = true;

    const initApp = async () => {
      if (!canvasRef.current || !isMounted) return;

      app = new PIXI.Application();
      await app.init({
        canvas: canvasRef.current,
        width: gridWidth + 20,
        height: gridHeight + 20,
        backgroundColor: 0x0a0f14,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: undefined, // Disable auto-resize to avoid resize plugin issues
      });

      if (!isMounted) {
        // Component unmounted during init
        try {
          await app.destroy();
        } catch {
          // Ignore destroy errors if already cleaning up
        }
        return;
      }

      appRef.current = app;

      const pixiContainer = new PIXI.Container();
      pixiContainer.x = CONTAINER_OFFSET;
      pixiContainer.y = CONTAINER_OFFSET;
      app.stage.addChild(pixiContainer);
      containerRef.current = pixiContainer;
    };

    initApp();

    // Keyboard handler for rotation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (selectedItemId) {
          const item = container.items.find((i) => i.id === selectedItemId);
          if (item) {
            const newRotation = (item.rotation + 90) % 360;
            rotateItem(item.id, newRotation);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyPress);
      
      const currentApp = appRef.current;
      if (currentApp) {
        // Cleanup in a safe way
        try {
          // Remove canvas from DOM first
          if (currentApp.canvas && currentApp.canvas.parentNode) {
            currentApp.canvas.parentNode.removeChild(currentApp.canvas);
          }
          
          // Then destroy the app
          try {
            currentApp.destroy();
          } catch {
            // Ignore destroy errors during cleanup
          }
        } catch (error) {
          // Fallback: just remove canvas
          if (currentApp.canvas && currentApp.canvas.parentNode) {
            currentApp.canvas.parentNode.removeChild(currentApp.canvas);
          }
        }
      }
      
      appRef.current = null;
      containerRef.current = null;
    };
  }, [gridWidth, gridHeight, container.items, selectedItemId, rotateItem]);

  // Update grid rendering
  useEffect(() => {
    if (!containerRef.current) return;

    const pixiContainer = containerRef.current;
    pixiContainer.removeChildren();

    // Grid background
    const gridBg = new PIXI.Graphics();
    gridBg.setStrokeStyle({ width: 1, color: 0x1a1a1a, alpha: 0.5 });
    for (let x = 0; x <= container.gridWidth; x++) {
      gridBg.moveTo(x * cellSize, 0);
      gridBg.lineTo(x * cellSize, container.gridHeight * cellSize);
    }
    for (let y = 0; y <= container.gridHeight; y++) {
      gridBg.moveTo(0, y * cellSize);
      gridBg.lineTo(container.gridWidth * cellSize, y * cellSize);
    }
    gridBg.rect(0, 0, container.gridWidth * cellSize, container.gridHeight * cellSize);
    gridBg.fill({ color: 0x0a0f14, alpha: 0.8 });
    pixiContainer.addChild(gridBg);

    // Items
    container.items.forEach((item) => {
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

      // Get item icon based on category
      const getItemIcon = (category?: string): string => {
        switch (category) {
          case "Weapon":
            return "🔫";
          case "Armor":
            return "🛡️";
          case "Medical":
            return "💉";
          case "Ammunition":
            return "📦";
          case "Tool":
            return "🔧";
          case "Container":
            return "🎒";
          case "Electronics":
            return "📱";
          case "Food":
            return "🍖";
          default:
            return "📦";
        }
      };

      // Item background with glow effect if selected
      const itemBg = new PIXI.Graphics();
      const fillColor = isSelected ? 0x00ff9f : 0x1f2937;
      const strokeColor = isSelected ? 0x00ff9f : 0x374151;
      
      itemBg.setStrokeStyle({ 
        width: isSelected ? 3 : 2, 
        color: strokeColor, 
        alpha: isSelected ? 1 : 0.6 
      });
      itemBg.roundRect(0, 0, itemWidth, itemHeight, 4);
      itemBg.fill({ color: fillColor, alpha: isSelected ? 0.4 : 0.3 });
      itemContainer.addChild(itemBg);

      // Item icon (emoji as text)
      const iconText = new PIXI.Text({
        text: getItemIcon(item.itemDefinition.category),
        style: {
          fontSize: Math.min(itemWidth, itemHeight) * 0.4,
          fill: isSelected ? 0x00ff9f : 0xffffff,
        },
      });
      iconText.x = (itemWidth - iconText.width) / 2;
      iconText.y = 6;
      itemContainer.addChild(iconText);

      // Item name (truncated if too long)
      const itemText = new PIXI.Text({
        text: item.itemDefinition.name.length > 12 
          ? item.itemDefinition.name.substring(0, 10) + "..." 
          : item.itemDefinition.name,
        style: {
          fontSize: Math.max(8, Math.min(10, itemWidth / 6)),
          fill: isSelected ? 0x00ff9f : 0xffffff,
          wordWrap: true,
          wordWrapWidth: itemWidth - 8,
          fontWeight: isSelected ? "bold" : "normal",
        },
      });
      itemText.x = 4;
      itemText.y = itemHeight - itemText.height - 4;
      itemContainer.addChild(itemText);

      // Quantity badge
      if (item.quantity > 1) {
        const qtyText = new PIXI.Text({
          text: `×${item.quantity}`,
          style: {
            fontSize: 9,
            fill: 0x00ff9f,
            fontWeight: "bold",
          },
        });
        qtyText.x = itemWidth - qtyText.width - 4;
        qtyText.y = itemHeight - qtyText.height - 4;
        itemContainer.addChild(qtyText);
      }

      // Event handlers
      itemContainer.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
        const containerX = e.global.x - CONTAINER_OFFSET;
        const containerY = e.global.y - CONTAINER_OFFSET;
        setDraggingItem({
          item,
          offsetX: containerX - displayX,
          offsetY: containerY - displayY,
        });
        setSelectedItemId(item.id);
        setSelectedItem(item);
      });

      itemContainer.on("click", () => {
        setSelectedItemId(item.id);
        setSelectedItem(item);
      });

      itemContainer.on("rightclick", () => {
        const newRotation = (item.rotation + 90) % 360;
        rotateItem(item.id, newRotation);
      });

      pixiContainer.addChild(itemContainer);
    });

    // Dragging preview
    if (draggingItem && hoverPosition && draggingItem.item.itemDefinition) {
      const { width, height } = getRotatedDimensions(
        draggingItem.item.itemDefinition.gridWidth,
        draggingItem.item.itemDefinition.gridHeight,
        draggingItem.item.rotation
      );

      const itemWidth = width * cellSize;
      const itemHeight = height * cellSize;
      const containerX = hoverPosition.x - CONTAINER_OFFSET;
      const containerY = hoverPosition.y - CONTAINER_OFFSET;

      // Check if can place
      const snapped = snapToGrid(containerX, containerY, cellSize);
      const result = checkCollision(
        container.items.filter((i) => i.id !== draggingItem.item.id),
        draggingItem.item,
        snapped.x,
        snapped.y,
        draggingItem.item.rotation,
        container.gridWidth,
        container.gridHeight,
        draggingItem.item.id
      );

      const canPlace = result.canPlace;

      const dragContainer = new PIXI.Container();
      dragContainer.x = containerX;
      dragContainer.y = containerY;
      dragContainer.alpha = 0.7;

      const dragBg = new PIXI.Graphics();
      dragBg.setStrokeStyle({ 
        width: 2, 
        color: canPlace ? 0x00ff9f : 0xdc2626, 
        alpha: 1 
      });
      dragBg.roundRect(0, 0, itemWidth, itemHeight, 4);
      dragBg.fill({ color: canPlace ? 0x00ff9f : 0xdc2626, alpha: 0.2 });
      dragContainer.addChild(dragBg);

      // Drag icon
      const getItemIcon = (category?: string): string => {
        switch (category) {
          case "Weapon": return "🔫";
          case "Armor": return "🛡️";
          case "Medical": return "💉";
          case "Ammunition": return "📦";
          case "Tool": return "🔧";
          case "Container": return "🎒";
          case "Electronics": return "📱";
          case "Food": return "🍖";
          default: return "📦";
        }
      };

      const dragIcon = new PIXI.Text({
        text: getItemIcon(draggingItem.item.itemDefinition.category),
        style: {
          fontSize: Math.min(itemWidth, itemHeight) * 0.4,
          fill: 0xffffff,
        },
      });
      dragIcon.x = (itemWidth - dragIcon.width) / 2;
      dragIcon.y = 6;
      dragContainer.addChild(dragIcon);

      const dragText = new PIXI.Text({
        text: draggingItem.item.itemDefinition.name.length > 12 
          ? draggingItem.item.itemDefinition.name.substring(0, 10) + "..." 
          : draggingItem.item.itemDefinition.name,
        style: {
          fontSize: Math.max(8, Math.min(10, itemWidth / 6)),
          fill: 0xffffff,
          wordWrap: true,
          wordWrapWidth: itemWidth - 8,
        },
      });
      dragText.x = 4;
      dragText.y = itemHeight - dragText.height - 4;
      dragContainer.addChild(dragText);

      pixiContainer.addChild(dragContainer);
    }
  }, [
    container,
    cellSize,
    selectedItemId,
    draggingItem,
    hoverPosition,
    setSelectedItem,
    rotateItem,
  ]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!appRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const globalX = e.clientX - rect.left;
    const globalY = e.clientY - rect.top;
    
    if (draggingItem) {
      const containerX = globalX - CONTAINER_OFFSET;
      const containerY = globalY - CONTAINER_OFFSET;
      const itemX = containerX - draggingItem.offsetX;
      const itemY = containerY - draggingItem.offsetY;
      const snapped = snapToGrid(itemX, itemY, cellSize);
      setHoverPosition({
        x: snapped.x * cellSize + CONTAINER_OFFSET,
        y: snapped.y * cellSize + CONTAINER_OFFSET,
      });
    }
  }, [draggingItem, cellSize]);

  const handleMouseUp = useCallback(() => {
    if (!draggingItem || !hoverPosition) {
      setDraggingItem(null);
      return;
    }

    const containerX = hoverPosition.x - CONTAINER_OFFSET;
    const containerY = hoverPosition.y - CONTAINER_OFFSET;
    const snapped = snapToGrid(containerX, containerY, cellSize);
    
    const result = checkCollision(
      container.items.filter((i) => i.id !== draggingItem.item.id),
      draggingItem.item,
      snapped.x,
      snapped.y,
      draggingItem.item.rotation,
      container.gridWidth,
      container.gridHeight,
      draggingItem.item.id
    );

    if (result.canPlace) {
      moveItem(draggingItem.item.id, container.id, snapped.x, snapped.y, draggingItem.item.rotation);
    }

    setDraggingItem(null);
    setHoverPosition(null);
  }, [draggingItem, hoverPosition, cellSize, container, moveItem]);

  return (
    <div className="glass-panel p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          {container.name}
        </h3>
        <div className="text-xs text-gray-400">
          {container.gridWidth}×{container.gridHeight}
        </div>
      </div>
      
      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative"
      >
        <canvas ref={canvasRef} className="rounded-sm" />
      </div>
    </div>
  );
}
