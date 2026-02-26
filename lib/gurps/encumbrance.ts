/**
 * GURPS 4e Encumbrance Calculations
 * Based on Basic Set, p. 17
 */

import type { EncumbranceLevel, EncumbranceInfo } from "@/types";

/**
 * Calculate Basic Lift (BL) from Strength
 * BL = (ST × ST) / 5 lbs
 */
export function basicLift(ST: number): number {
  return (ST * ST) / 5;
}

/**
 * Get encumbrance level based on carried weight and ST
 * Returns the encumbrance level and associated modifiers
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
    };
  } else if (carriedWeight <= bl * 2) {
    return {
      level: "Light",
      multiplier: 2.0,
      moveModifier: 0,
      dodgeModifier: -1,
    };
  } else if (carriedWeight <= bl * 3) {
    return {
      level: "Medium",
      multiplier: 3.0,
      moveModifier: -1,
      dodgeModifier: -2,
    };
  } else if (carriedWeight <= bl * 6) {
    return {
      level: "Heavy",
      multiplier: 6.0,
      moveModifier: -2,
      dodgeModifier: -3,
    };
  } else {
    return {
      level: "Extra-Heavy",
      multiplier: 10.0,
      moveModifier: -3,
      dodgeModifier: -4,
    };
  }
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
