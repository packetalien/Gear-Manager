"use client";

/**
 * GridContainer - PixiJS-based volumetric inventory grid
 * Supports drag, rotate, collision detection, and nested containers
 */

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Stage, Container, Sprite, Graphics, Text } from "@pixi/react";
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

  const handleMouseDown = (item: Item, event: PIXI.FederatedPointerEvent) => {
    if (!item.gridX || !item.gridY || !item.itemDefinition) return;
    
    const itemWorldX = item.gridX * cellSize;
    const itemWorldY = item.gridY * cellSize;
    
    setDraggingItem({
      item,
      offsetX: event.global.x - itemWorldX,
      offsetY: event.global.y - itemWorldY,
    });
    setSelectedItemId(item.id);
  };

  const handleMouseMove = (event: PIXI.FederatedPointerEvent) => {
    if (!draggingItem) {
      setHoverPosition({ x: event.global.x, y: event.global.y });
      return;
    }

    const snapped = snapToGrid(
      event.global.x - draggingItem.offsetX,
      event.global.y - draggingItem.offsetY,
      cellSize
    );

    setHoverPosition({ x: snapped.x * cellSize, y: snapped.y * cellSize });
  };

  const handleMouseUp = () => {
    if (!draggingItem || !hoverPosition) {
      setDraggingItem(null);
      return;
    }

    const snapped = snapToGrid(hoverPosition.x, hoverPosition.y, cellSize);
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

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{slot.name}</h3>
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleMouseMove({
            global: { x: e.clientX - rect.left, y: e.clientY - rect.top },
          } as PIXI.FederatedPointerEvent);
        }}
        onMouseUp={handleMouseUp}
      >
        <Stage
          width={gridWidth + 20}
          height={gridHeight + 20}
          options={{ backgroundColor: 0x1a1a1a, antialias: true }}
        >
        <Container x={10} y={10}>
          {/* Grid Background */}
          <GridBackground
            width={slot.gridWidth}
            height={slot.gridHeight}
            cellSize={cellSize}
          />

          {/* Items */}
          {items.map((item) => {
            if (draggingItem?.item.id === item.id) return null;
            
            return (
              <ItemSprite
                key={item.id}
                item={item}
                cellSize={cellSize}
                isSelected={selectedItemId === item.id}
                onClick={handleItemClick}
                onDoubleClick={handleItemDoubleClick}
                onMouseDown={handleMouseDown}
              />
            );
          })}

          {/* Dragging Item Preview */}
          {draggingItem && hoverPosition && (
            <ItemSprite
              item={draggingItem.item}
              cellSize={cellSize}
              x={hoverPosition.x}
              y={hoverPosition.y}
              isDragging={true}
              opacity={0.7}
            />
          )}
        </Container>
      </Stage>
      </div>
    </div>
  );
}

// Grid Background Component
function GridBackground({
  width,
  height,
  cellSize,
}: {
  width: number;
  height: number;
  cellSize: number;
}) {
  return (
    <Graphics
      draw={(g) => {
        g.clear();
        
        // Grid cells
        g.lineStyle(1, 0x333333, 0.5);
        for (let x = 0; x <= width; x++) {
          g.moveTo(x * cellSize, 0);
          g.lineTo(x * cellSize, height * cellSize);
        }
        for (let y = 0; y <= height; y++) {
          g.moveTo(0, y * cellSize);
          g.lineTo(width * cellSize, y * cellSize);
        }
        
        // Background
        g.beginFill(0x0a0a0a, 0.8);
        g.drawRect(0, 0, width * cellSize, height * cellSize);
        g.endFill();
      }}
    />
  );
}

// Item Sprite Component
function ItemSprite({
  item,
  cellSize,
  x,
  y,
  isSelected = false,
  isDragging = false,
  opacity = 1,
  onClick,
  onDoubleClick,
  onMouseDown,
}: {
  item: Item;
  cellSize: number;
  x?: number;
  y?: number;
  isSelected?: boolean;
  isDragging?: boolean;
  opacity?: number;
  onClick?: (item: Item) => void;
  onDoubleClick?: (item: Item) => void;
  onMouseDown?: (item: Item, event: PIXI.FederatedPointerEvent) => void;
}) {
  if (!item.itemDefinition) return null;

  const { width, height } = getRotatedDimensions(
    item.itemDefinition.gridWidth,
    item.itemDefinition.gridHeight,
    item.rotation
  );

  const displayX = x ?? (item.gridX ?? 0) * cellSize;
  const displayY = y ?? (item.gridY ?? 0) * cellSize;

  const itemWidth = width * cellSize;
  const itemHeight = height * cellSize;

  return (
    <Container
      x={displayX}
      y={displayY}
      interactive={!isDragging}
      buttonMode={!isDragging}
      pointerdown={(e) => onMouseDown?.(item, e)}
      click={() => onClick?.(item)}
      doubleclick={() => onDoubleClick?.(item)}
    >
      {/* Item Background */}
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(
            isSelected ? 0x4a9eff : isDragging ? 0x6b7280 : 0x374151,
            opacity
          );
          g.lineStyle(2, isSelected ? 0x60a5fa : 0x4b5563, opacity);
          g.drawRoundedRect(0, 0, itemWidth, itemHeight, 4);
          g.endFill();
        }}
      />

      {/* Item Label */}
      <Text
        text={item.itemDefinition.name}
        style={{
          fontSize: 10,
          fill: 0xffffff,
          wordWrap: true,
          wordWrapWidth: itemWidth - 8,
        }}
        x={4}
        y={4}
        alpha={opacity}
      />
    </Container>
  );
}
