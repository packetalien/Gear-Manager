/**
 * Inventory Item Model Utilities
 */

import type { GURPSItem, GURPSItemDefinition } from "@/types/gurps";

/**
 * Calculate total weight of an item (including contained items)
 */
export function getItemTotalWeight(item: GURPSItem): number {
  if (!item.itemDefinition) {
    return 0;
  }
  
  let weight = item.itemDefinition.weight * item.quantity;
  
  // Add weight of contained items
  if (item.containedItems && item.containedItems.length > 0) {
    weight += item.containedItems.reduce(
      (total, contained) => total + getItemTotalWeight(contained),
      0
    );
  }
  
  return weight;
}

/**
 * Check if an item can fit in a container
 */
export function canFitInContainer(
  item: GURPSItem,
  container: GURPSItemDefinition
): boolean {
  if (!container.isContainer || !container.containerWidth || !container.containerHeight) {
    return false;
  }
  
  if (!item.itemDefinition) {
    return false;
  }
  
  // Check dimensions
  const fitsWidth = item.itemDefinition.gridWidth <= container.containerWidth;
  const fitsHeight = item.itemDefinition.gridHeight <= container.containerHeight;
  
  if (!fitsWidth || !fitsHeight) {
    // Try rotated
    const fitsRotatedWidth = item.itemDefinition.gridHeight <= container.containerWidth;
    const fitsRotatedHeight = item.itemDefinition.gridWidth <= container.containerHeight;
    return fitsRotatedWidth && fitsRotatedHeight;
  }
  
  return true;
}

/**
 * Check if container has weight capacity
 */
export function containerHasCapacity(
  container: GURPSItemDefinition,
  currentWeight: number,
  itemWeight: number
): boolean {
  if (!container.containerMaxWeight) {
    return true; // No weight limit
  }
  
  return currentWeight + itemWeight <= container.containerMaxWeight;
}
