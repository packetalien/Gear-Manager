/**
 * Inventory Grid Engine
 * Handles collision detection, rotation, and placement logic for volumetric grid inventory
 */

import type { Item, GridPosition, CollisionResult } from "@/types";

/**
 * Get rotated dimensions of an item
 */
export function getRotatedDimensions(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  
  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: height, height: width };
  }
  
  return { width, height };
}

/**
 * Get all grid cells occupied by an item at a position
 */
export function getOccupiedCells(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
): Array<{ x: number; y: number }> {
  const { width: w, height: h } = getRotatedDimensions(width, height, rotation);
  const cells: Array<{ x: number; y: number }> = [];
  
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      cells.push({ x: x + dx, y: y + dy });
    }
  }
  
  return cells;
}

/**
 * Check if a position is within grid bounds
 */
export function isWithinBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  gridWidth: number,
  gridHeight: number,
  rotation: number
): boolean {
  const { width: w, height: h } = getRotatedDimensions(width, height, rotation);
  return x >= 0 && y >= 0 && x + w <= gridWidth && y + h <= gridHeight;
}

/**
 * Check for collisions between items in a grid
 */
export function checkCollision(
  items: Item[],
  newItem: Item,
  gridX: number,
  gridY: number,
  rotation: number,
  gridWidth: number,
  gridHeight: number,
  excludeItemId?: string
): CollisionResult {
  // Check bounds first
  if (!newItem.itemDefinition) {
    return { canPlace: false, conflicts: [] };
  }
  
  const { width, height } = getRotatedDimensions(
    newItem.itemDefinition.gridWidth,
    newItem.itemDefinition.gridHeight,
    rotation
  );
  
  if (!isWithinBounds(gridX, gridY, width, height, gridWidth, gridHeight, rotation)) {
    return { canPlace: false, conflicts: [] };
  }
  
  const newItemCells = getOccupiedCells(
    gridX,
    gridY,
    newItem.itemDefinition.gridWidth,
    newItem.itemDefinition.gridHeight,
    rotation
  );
  
  const conflicts: GridPosition[] = [];
  
  // Check against all other items
  for (const item of items) {
    if (item.id === excludeItemId || !item.itemDefinition || !item.gridX || !item.gridY) {
      continue;
    }
    
    const itemCells = getOccupiedCells(
      item.gridX,
      item.gridY,
      item.itemDefinition.gridWidth,
      item.itemDefinition.gridHeight,
      item.rotation
    );
    
    // Check for overlap
    const hasOverlap = newItemCells.some((cell) =>
      itemCells.some(
        (itemCell) => itemCell.x === cell.x && itemCell.y === cell.y
      )
    );
    
    if (hasOverlap) {
      conflicts.push({
        x: item.gridX,
        y: item.gridY,
        width: item.itemDefinition.gridWidth,
        height: item.itemDefinition.gridHeight,
        rotation: item.rotation,
      });
    }
  }
  
  return {
    canPlace: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Check if an item can be placed at a position
 */
export function canPlace(
  items: Item[],
  item: Item,
  gridX: number,
  gridY: number,
  rotation: number,
  gridWidth: number,
  gridHeight: number,
  excludeItemId?: string
): boolean {
  return checkCollision(
    items,
    item,
    gridX,
    gridY,
    rotation,
    gridWidth,
    gridHeight,
    excludeItemId
  ).canPlace;
}

/**
 * Rotate an item (90° increments)
 */
export function rotateItem(currentRotation: number, direction: "cw" | "ccw" = "cw"): number {
  if (direction === "cw") {
    return (currentRotation + 90) % 360;
  } else {
    return (currentRotation - 90 + 360) % 360;
  }
}

/**
 * Snap position to grid
 */
export function snapToGrid(x: number, y: number, cellSize: number): { x: number; y: number } {
  return {
    x: Math.floor(x / cellSize),
    y: Math.floor(y / cellSize),
  };
}

/**
 * Get grid cell center position
 */
export function getCellCenter(
  gridX: number,
  gridY: number,
  cellSize: number
): { x: number; y: number } {
  return {
    x: gridX * cellSize + cellSize / 2,
    y: gridY * cellSize + cellSize / 2,
  };
}
