/**
 * Comprehensive GURPS 4e Type Definitions
 * Video-game quality types for tactical inventory management
 */

// GURPS Attributes
export interface GURPSAttributes {
  ST: number; // Strength
  DX: number; // Dexterity
  IQ: number; // Intelligence
  HT: number; // Health
}

// Encumbrance Levels (GURPS 4e Basic Set p.17)
export type EncumbranceLevel = "None" | "Light" | "Medium" | "Heavy" | "Extra-Heavy";

export interface EncumbranceInfo {
  level: EncumbranceLevel;
  multiplier: number; // Weight multiplier for this level
  moveModifier: number; // Movement penalty
  dodgeModifier: number; // Dodge penalty
  color: string; // CSS color for UI
}

// Hit Locations (GURPS 4e Basic Set p.398)
export type HitLocation =
  | "skull"
  | "eyes"
  | "face"
  | "neck"
  | "torso"
  | "vitals"
  | "groin"
  | "arms"
  | "hands"
  | "legs"
  | "feet";

export interface HitLocationData {
  name: string;
  location: HitLocation;
  dr: number; // Damage Resistance from equipped armor
  equippedItemId?: string;
}

// Item Definition (catalog entry - GURPS 4e item stats)
export interface GURPSItemDefinition {
  id: string;
  name: string;
  description?: string;
  weight: number; // lbs
  cost?: number; // $ in GURPS currency
  tl?: number; // Tech Level (0-12)
  lc?: number; // Legality Class (0-4)
  quality?: "Cheap" | "Good" | "Fine" | "Very Fine";
  category: string; // "Weapon", "Armor", "Tool", "Container", etc.
  
  // Volumetric grid dimensions (Tarkov-style)
  gridWidth: number;
  gridHeight: number;
  
  // Container properties
  isContainer: boolean;
  containerWidth?: number;
  containerHeight?: number;
  containerMaxWeight?: number;
  
  // Armor properties
  isArmor: boolean;
  dr?: number; // Damage Resistance
  locations?: HitLocation[]; // Which body parts this protects
  
  // Weapon properties (if applicable)
  damage?: string; // e.g., "2d+2 cut"
  reach?: string; // e.g., "1,2"
  parry?: string; // e.g., "0F"
  bulk?: string; // e.g., "-4"
  
  // Other properties
  notes?: string;
}

// Item Instance (actual item in inventory)
export interface GURPSItem {
  id: string;
  itemDefinitionId: string;
  itemDefinition?: GURPSItemDefinition;
  characterId?: string;
  containerId?: string; // If inside another item
  quantity: number;
  
  // Grid position (if in inventory grid)
  gridX?: number;
  gridY?: number;
  rotation: number; // 0, 90, 180, 270
  
  // Equipment state
  equippedLocation?: HitLocation;
  hotbarSlot?: number; // 0-9 for quick access
  
  // Custom properties
  condition?: number; // 0-100 (for degradation)
  notes?: string;
  
  // Nested items (if container)
  containedItems?: GURPSItem[];
}

// Inventory Container (grid-based storage)
export interface InventoryContainer {
  id: string;
  characterId: string;
  name: string; // "Tactical Vest", "Backpack", "Vehicle", etc.
  gridWidth: number;
  gridHeight: number;
  containerType: "person" | "backpack" | "vehicle" | "locker" | "alchemy";
  items: GURPSItem[];
  maxWeight?: number;
}

// Character
export interface GURPSCharacter {
  id: string;
  userId: string;
  name: string;
  portrait?: string; // URL to character portrait
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
  
  // Calculated stats
  basicLift: number;
  move: number;
  dodge: number;
  
  // Inventory
  containers: InventoryContainer[];
  equippedItems: Map<HitLocation, GURPSItem>; // What's equipped where
  
  // Loadout presets
  loadouts: LoadoutPreset[];
}

// Loadout Preset (quick-swap configurations)
export interface LoadoutPreset {
  id: string;
  name: string; // "Stealth", "Combat", "Travel"
  containers: InventoryContainer[];
  equippedItems: Map<HitLocation, string>; // Item IDs
}

// Paper Doll Zone (for SVG hit location)
export interface PaperDollZone {
  location: HitLocation;
  path: string; // SVG path data
  x: number;
  y: number;
  width: number;
  height: number;
}

// Grid Position
export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// Collision Check Result
export interface CollisionResult {
  canPlace: boolean;
  conflicts: GridPosition[];
}

// Item Inspector Data
export interface ItemInspectorData {
  item: GURPSItem;
  totalWeight: number;
  encumbranceImpact: number; // How much this item adds to encumbrance
  canEquip: boolean;
  equipLocations: HitLocation[]; // Where this can be equipped
}
