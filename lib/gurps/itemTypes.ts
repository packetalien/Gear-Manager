/**
 * GURPS Item Type Definitions and Utilities
 */

import type { GURPSItemDefinition, HitLocation } from "@/types/gurps";

/**
 * Common GURPS item categories
 */
export const ItemCategories = {
  WEAPON: "Weapon",
  ARMOR: "Armor",
  TOOL: "Tool",
  CONTAINER: "Container",
  AMMUNITION: "Ammunition",
  MEDICAL: "Medical",
  FOOD: "Food",
  ELECTRONICS: "Electronics",
  OTHER: "Other",
} as const;

/**
 * Quality levels (GURPS 4e)
 */
export const QualityLevels = {
  CHEAP: "Cheap",
  GOOD: "Good",
  FINE: "Fine",
  VERY_FINE: "Very Fine",
} as const;

/**
 * Sample item definitions for testing
 */
export const SampleItems: GURPSItemDefinition[] = [
  {
    id: "tactical-vest",
    name: "Tactical Vest",
    description: "8×6 grid tactical vest with MOLLE webbing",
    weight: 3.5,
    cost: 150,
    tl: 8,
    lc: 3,
    quality: "Good",
    category: ItemCategories.CONTAINER,
    gridWidth: 1,
    gridHeight: 1,
    isContainer: true,
    containerWidth: 8,
    containerHeight: 6,
    containerMaxWeight: 20,
    isArmor: false,
  },
  {
    id: "rifle-m4",
    name: "M4 Carbine",
    description: "5.56mm assault rifle",
    weight: 7.5,
    cost: 900,
    tl: 8,
    lc: 2,
    quality: "Good",
    category: ItemCategories.WEAPON,
    gridWidth: 3,
    gridHeight: 1,
    isContainer: false,
    isArmor: false,
  },
  {
    id: "magazine-30",
    name: "30-Round Magazine",
    description: "5.56mm STANAG magazine",
    weight: 0.7,
    cost: 30,
    tl: 8,
    lc: 3,
    quality: "Good",
    category: ItemCategories.AMMUNITION,
    gridWidth: 1,
    gridHeight: 1,
    isContainer: false,
    isArmor: false,
  },
  {
    id: "medkit",
    name: "First Aid Kit",
    description: "Comprehensive medical supplies",
    weight: 2.0,
    cost: 50,
    tl: 8,
    lc: 4,
    quality: "Good",
    category: ItemCategories.MEDICAL,
    gridWidth: 2,
    gridHeight: 1,
    isContainer: false,
    isArmor: false,
  },
  {
    id: "plate-carrier",
    name: "Plate Carrier",
    description: "Body armor with ceramic plates",
    weight: 8.0,
    cost: 400,
    tl: 8,
    lc: 2,
    quality: "Good",
    category: ItemCategories.ARMOR,
    gridWidth: 1,
    gridHeight: 1,
    isContainer: false,
    isArmor: true,
    dr: 25,
    locations: ["torso"],
  },
];

/**
 * Get item by ID from sample items
 */
export function getSampleItem(id: string): GURPSItemDefinition | undefined {
  return SampleItems.find((item) => item.id === id);
}
