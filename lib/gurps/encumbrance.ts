/**
 * GURPS 4e Encumbrance Calculations
 * Based on Basic Set, p. 17
 * Enhanced with visual feedback for video-game UI
 */

import type { EncumbranceLevel, EncumbranceInfo } from "@/types/gurps";

/**
 * Calculate Basic Lift (BL) from Strength
 * BL = (ST × ST) / 5 lbs
 */
export function basicLift(ST: number): number {
  return (ST * ST) / 5;
}

/**
 * Get encumbrance level based on carried weight and ST
 * Returns the encumbrance level and associated modifiers with visual styling
 */
export function encumbranceLevel(
  carriedWeight: number,
  ST: number
): EncumbranceInfo {
  const bl = basicLift(ST);
  
  if (carriedWeight <= bl) {
    return {
      level: "None",
      multiplier: 1.0,
      moveModifier: 0,
      dodgeModifier: 0,
      color: "#10b981", // Green
    };
  } else if (carriedWeight <= bl * 2) {
    return {
      level: "Light",
      multiplier: 2.0,
      moveModifier: 0,
      dodgeModifier: -1,
      color: "#84cc16", // Lime
    };
  } else if (carriedWeight <= bl * 3) {
    return {
      level: "Medium",
      multiplier: 3.0,
      moveModifier: -1,
      dodgeModifier: -2,
      color: "#eab308", // Yellow
    };
  } else if (carriedWeight <= bl * 6) {
    return {
      level: "Heavy",
      multiplier: 6.0,
      moveModifier: -2,
      dodgeModifier: -3,
      color: "#f97316", // Orange
    };
  } else {
    return {
      level: "Extra-Heavy",
      multiplier: 10.0,
      moveModifier: -3,
      dodgeModifier: -4,
      color: "#dc2626", // Red
    };
  }
}

/**
 * Get encumbrance percentage for meter display (0-100%)
 */
export function encumbrancePercentage(
  carriedWeight: number,
  ST: number
): number {
  const bl = basicLift(ST);
  const maxWeight = bl * 10; // Extra-Heavy threshold
  return Math.min(100, (carriedWeight / maxWeight) * 100);
}

/**
 * Get encumbrance meter segments for visual bar
 */
export function encumbranceMeterSegments(ST: number): Array<{
  level: EncumbranceLevel;
  start: number;
  end: number;
  color: string;
}> {
  const bl = basicLift(ST);
  const maxWeight = bl * 10;
  
  return [
    { level: "None", start: 0, end: (bl / maxWeight) * 100, color: "#10b981" },
    { level: "Light", start: (bl / maxWeight) * 100, end: ((bl * 2) / maxWeight) * 100, color: "#84cc16" },
    { level: "Medium", start: ((bl * 2) / maxWeight) * 100, end: ((bl * 3) / maxWeight) * 100, color: "#eab308" },
    { level: "Heavy", start: ((bl * 3) / maxWeight) * 100, end: ((bl * 6) / maxWeight) * 100, color: "#f97316" },
    { level: "Extra-Heavy", start: ((bl * 6) / maxWeight) * 100, end: 100, color: "#dc2626" },
  ];
}

/**
 * Calculate total weight of all items in inventory
 */
export function calculateTotalWeight(items: Array<{ weight: number; quantity: number }>): number {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0);
}

/**
 * Get effective Move based on encumbrance
 * Base Move = HT (for most characters)
 */
export function effectiveMove(HT: number, encumbrance: EncumbranceInfo): number {
  return Math.max(1, HT + encumbrance.moveModifier);
}

/**
 * Get effective Dodge based on encumbrance
 * Base Dodge = (DX + HT) / 4 + 3
 */
export function effectiveDodge(
  DX: number,
  HT: number,
  encumbrance: EncumbranceInfo
): number {
  return Math.max(1, Math.floor((DX + HT) / 4) + 3 + encumbrance.dodgeModifier);
}
